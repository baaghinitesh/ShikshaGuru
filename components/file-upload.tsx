'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  endpoint: 'file' | 'image' | 'avatar' | 'multiple';
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface UploadedFile {
  url: string;
  publicId: string;
  size: number;
  format: string;
  originalName: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  result?: UploadedFile;
  error?: string;
}

export default function FileUpload({
  endpoint,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  onUploadComplete,
  onUploadError,
  className = '',
  children,
  disabled = false
}: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than ${Math.round(maxSize / 1024 / 1024)}MB`,
          variant: 'destructive'
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize upload progress
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploads
    uploadFiles(validFiles);
  }, [maxSize]);

  const uploadFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file, index) => {
      const formData = new FormData();
      
      if (endpoint === 'multiple') {
        formData.append('files', file);
      } else {
        const fieldName = endpoint === 'image' ? 'image' : endpoint === 'avatar' ? 'avatar' : 'file';
        formData.append(fieldName, file);
      }

      // Update status to uploading
      setUploads(prev => prev.map((upload, i) => 
        upload.file === file ? { ...upload, status: 'uploading', progress: 10 } : upload
      ));

      try {
        const response = await fetch(`/api/upload/${endpoint}`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
          // Update progress to completed
          setUploads(prev => prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'completed', progress: 100, result: result.data }
              : upload
          ));

          return result.data;
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update status to error
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, status: 'error', error: errorMessage }
            : upload
        ));

        onUploadError?.(errorMessage);
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}: ${errorMessage}`,
          variant: 'destructive'
        });

        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as UploadedFile[];
      
      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
        toast({
          title: 'Upload successful',
          description: `${successfulUploads.length} file(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const removeUpload = (fileToRemove: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== fileToRemove));
  };

  const clearAll = () => {
    setUploads([]);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {children || (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              {accept || 'All file types'} up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
            {multiple && (
              <p className="text-xs text-gray-400 mt-1">
                Multiple files allowed
              </p>
            )}
          </>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled}
      />

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Uploads ({uploads.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          {uploads.map((upload, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFileIcon(upload.file)}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(upload.file.size)})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {upload.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {upload.status === 'completed' && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-2 h-2 text-white" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpload(upload.file)}
                    className="w-4 h-4 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {upload.status === 'uploading' && (
                <Progress value={upload.progress} className="w-full h-2" />
              )}

              {upload.status === 'error' && upload.error && (
                <p className="text-xs text-red-600 mt-1">{upload.error}</p>
              )}

              {upload.status === 'completed' && upload.result && (
                <div className="text-xs text-green-600 mt-1">
                  Upload completed successfully
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}