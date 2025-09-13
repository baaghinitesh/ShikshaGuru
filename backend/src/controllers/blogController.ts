import { Request, Response } from 'express';
import { Blog } from '../models/Blog';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';

/**
 * Get all blogs with optional filtering, sorting, and pagination
 * GET /api/blogs
 * Query params: page, limit, category, status, search, author, tag
 */
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'published', // Default to published for public access
      search,
      author,
      tag,
      sort = '-publishedAt'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    // Only show published blogs for non-admin users
    const user = (req as AuthenticatedRequest).user;
    if (!user || user.role !== 'admin') {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }

    if (category) filter.category = category;
    if (author) filter.author = author;
    if (tag) filter.tags = { $in: [tag] };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const blogs = await Blog.find(filter)
      .populate('author', 'name profilePicture')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit))
      .select('-content'); // Don't include full content in listing

    const total = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single blog by slug
 * GET /api/blogs/:slug
 */
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug })
      .populate('author', 'name profilePicture bio')
      .populate('comments.userId', 'name profilePicture')
      .populate('comments.replies.userId', 'name profilePicture')
      .populate('likes', 'name profilePicture');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is published (unless user is admin or author)
    const user = (req as AuthenticatedRequest).user;
    if (blog.status !== 'published') {
      if (!user || (user.role !== 'admin' && user._id!.toString() !== blog.author.toString())) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }
    }

    // Increment view count (only for published blogs and not for author/admin)
    if (blog.status === 'published' && (!user || user._id!.toString() !== blog.author.toString())) {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
      blog.views += 1;
    }

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new blog (Admin only)
 * POST /api/blogs
 */
export const createBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status = 'draft',
      seo
    } = req.body;

    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, excerpt, and category are required'
      });
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const blogData: any = {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      author: req.user!._id,
      category,
      tags: tags || [],
      status,
      seo: seo || {}
    };

    // Set publishedAt if status is published
    if (status === 'published') {
      blogData.publishedAt = new Date();
    }

    const blog = new Blog(blogData);
    await blog.save();

    // Populate author info
    await blog.populate('author', 'name profilePicture bio');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a blog (Admin only)
 * PUT /api/blogs/:id
 */
export const updateBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status,
      seo
    } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update fields
    if (title) {
      blog.title = title;
      
      // Update slug if title changed
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Ensure unique slug (excluding current blog)
      let slug = baseSlug;
      let counter = 1;
      while (await Blog.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      blog.slug = slug;
    }

    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (featuredImage !== undefined) blog.featuredImage = featuredImage;
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (seo) blog.seo = { ...blog.seo, ...seo };

    // Handle status change
    if (status && status !== blog.status) {
      blog.status = status;
      
      // Set publishedAt when publishing for first time
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();
    await blog.populate('author', 'name profilePicture bio');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a blog (Admin only)
 * DELETE /api/blogs/:id
 */
export const deleteBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Like/Unlike a blog
 * POST /api/blogs/:id/like
 */
export const likeBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user already liked the blog
    const likedIndex = blog.likes.findIndex(likeId => likeId.toString() === userId!.toString());
    
    if (likedIndex > -1) {
      // Unlike: remove user from likes array
      blog.likes.splice(likedIndex, 1);
    } else {
      // Like: add user to likes array
      blog.likes.push((userId as any));
    }

    await blog.save();

    res.json({
      success: true,
      message: likedIndex > -1 ? 'Blog unliked successfully' : 'Blog liked successfully',
      data: {
        liked: likedIndex === -1,
        totalLikes: blog.likes.length
      }
    });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add a comment to a blog
 * POST /api/blogs/:id/comment
 */
export const commentOnBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, parentCommentIndex } = req.body;
    const userId = req.user!._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (parentCommentIndex !== undefined) {
      // Reply to a comment
      if (parentCommentIndex < 0 || parentCommentIndex >= blog.comments.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }

      const reply = {
        userId: userId as any,
        content: content.trim(),
        createdAt: new Date()
      };

      blog.comments[parentCommentIndex].replies = blog.comments[parentCommentIndex].replies || [];
      blog.comments[parentCommentIndex].replies.push(reply);
    } else {
      // New comment
      const comment = {
        userId: userId as any,
        content: content.trim(),
        createdAt: new Date(),
        replies: []
      };

      blog.comments.push(comment as any);
    }

    await blog.save();

    // Populate the updated blog with user details
    await blog.populate('comments.userId', 'name profilePicture');
    await blog.populate('comments.replies.userId', 'name profilePicture');

    res.status(201).json({
      success: true,
      message: parentCommentIndex !== undefined ? 'Reply added successfully' : 'Comment added successfully',
      data: {
        comments: blog.comments,
        totalComments: blog.comments.reduce((total, comment) => {
          return total + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0)
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get blog categories with counts
 * GET /api/blogs/categories
 */
export const getBlogCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get popular tags
 * GET /api/blogs/tags
 */
export const getBlogTags = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Number(limit) }
    ]);

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};