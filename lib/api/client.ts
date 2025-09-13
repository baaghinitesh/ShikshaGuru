import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../config';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Authentication methods
  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    this.setAuthData(response.data);
    return response.data;
  }

  async login(data: any) {
    const response = await this.client.post('/auth/login', data);
    this.setAuthData(response.data);
    return response.data;
  }

  async googleAuth(data: any) {
    const response = await this.client.post('/auth/google', data);
    this.setAuthData(response.data);
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  private setAuthData(data: any) {
    if (typeof window === 'undefined') return;
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  // Generic CRUD methods
  async get(endpoint: string, config?: AxiosRequestConfig) {
    const response = await this.client.get(endpoint, config);
    return response.data;
  }

  async post(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post(endpoint, data, config);
    return response.data;
  }

  async put(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put(endpoint, data, config);
    return response.data;
  }

  async patch(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch(endpoint, data, config);
    return response.data;
  }

  async delete(endpoint: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete(endpoint, config);
    return response.data;
  }

  // Teacher methods
  async getTeachers(params?: any) {
    return this.get('/teachers/search', { params });
  }

  async getTeacher(id: string) {
    return this.get(`/teachers/${id}`);
  }

  async createTeacherProfile(data: any) {
    return this.post('/teachers/profile', data);
  }

  async getMyTeacherProfile() {
    return this.get('/teachers/profile/me');
  }

  async updateTeacherProfile(data: any) {
    return this.put('/teachers/profile', data);
  }

  async getTeacherStats() {
    return this.get('/teachers/dashboard/stats');
  }

  async addTeacherReview(teacherId: string, data: any) {
    return this.post(`/teachers/${teacherId}/review`, data);
  }

  async toggleTeacherVisibility() {
    return this.post('/teachers/profile/toggle-visibility');
  }

  async uploadTeacherDocument(data: any) {
    return this.post('/teachers/profile/upload-document', data);
  }

  // Student methods
  async getStudentProfile() {
    return this.get('/students/profile');
  }

  async updateStudentProfile(data: any) {
    return this.put('/students/profile', data);
  }

  // Job methods
  async getJobs(params?: any) {
    return this.get('/jobs', { params });
  }

  async getJob(id: string) {
    return this.get(`/jobs/${id}`);
  }

  async createJob(data: any) {
    return this.post('/jobs', data);
  }

  async updateJob(id: string, data: any) {
    return this.put(`/jobs/${id}`, data);
  }

  async deleteJob(id: string) {
    return this.delete(`/jobs/${id}`);
  }

  async applyToJob(jobId: string, data: any) {
    return this.post(`/teachers/jobs/${jobId}/apply`, data);
  }

  // Search methods with geospatial support
  async searchTeachers(params: any) {
    return this.get('/search/teachers', { params });
  }

  async searchJobs(params: any) {
    return this.get('/search/jobs', { params });
  }

  async getNearbyResults(params: { latitude: number; longitude: number; maxDistance?: number; type?: 'teachers' | 'jobs' }) {
    return this.get('/search/nearby', { params });
  }

  async getLocationSuggestions(query: string) {
    return this.get('/search/locations', { params: { query } });
  }

  async getSearchFilters() {
    return this.get('/search/filters');
  }



  // Blog methods
  async getBlogs(params?: any) {
    return this.get('/blogs', { params });
  }

  async getBlog(slug: string) {
    return this.get(`/blogs/${slug}`);
  }

  async getBlogCategories() {
    return this.get('/blogs/categories');
  }

  async getBlogTags(limit?: number) {
    return this.get('/blogs/tags', { params: { limit } });
  }

  // Admin blog management methods
  async createBlog(data: {
    title: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    category: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
    };
  }) {
    return this.post('/blogs', data);
  }

  async updateBlog(id: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    category?: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
    };
  }) {
    return this.put(`/blogs/${id}`, data);
  }

  async deleteBlog(id: string) {
    return this.delete(`/blogs/${id}`);
  }

  // Blog interaction methods
  async likeBlog(id: string) {
    return this.post(`/blogs/${id}/like`);
  }

  async commentOnBlog(id: string, data: {
    content: string;
    parentCommentIndex?: number;
  }) {
    return this.post(`/blogs/${id}/comment`, data);
  }

  // Testimonial methods
  async getTestimonials(params?: any) {
    return this.get('/testimonials', { params });
  }

  async createTestimonial(data: any) {
    return this.post('/testimonials', data);
  }

  // Upload methods
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    return this.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  async uploadImage(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('image', file);

    return this.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Chat methods
  async getChats(params?: any) {
    return this.get('/chat', { params });
  }

  async getChat(chatId: string) {
    return this.get(`/chat/${chatId}`);
  }

  async createChat(data: { participantId: string; type?: 'private' | 'group'; name?: string }) {
    return this.post('/chat', data);
  }

  async getChatMessages(chatId: string, params?: any) {
    return this.get(`/chat/${chatId}/messages`, { params });
  }

  async sendMessage(chatId: string, data: { content: string; type?: string; attachments?: any[] }) {
    return this.post(`/chat/${chatId}/messages`, data);
  }

  async markMessagesAsRead(chatId: string, messageIds: string[]) {
    return this.patch(`/chat/${chatId}/messages/read`, { messageIds });
  }

  async deleteMessage(chatId: string, messageId: string) {
    return this.delete(`/chat/${chatId}/messages/${messageId}`);
  }

  async editMessage(chatId: string, messageId: string, content: string) {
    return this.patch(`/chat/${chatId}/messages/${messageId}`, { content });
  }

  async searchMessages(chatId: string, query: string, params?: any) {
    return this.get(`/chat/${chatId}/messages/search`, { params: { query, ...params } });
  }

  // AI Chat methods
  async startAIConversation(data: { message?: string; conversationId?: string }) {
    return this.post('/ai-chat/conversation', data);
  }

  async getAIConversation(conversationId: string) {
    return this.get(`/ai-chat/conversation/${conversationId}`);
  }

  async executeAIAction(data: { actionId: string; actionData?: any; conversationId?: string }) {
    return this.post('/ai-chat/action', data);
  }
}

export const apiClient = new APIClient();