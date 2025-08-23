"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle2 } from 'lucide-react';
import { Button } from './button';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  initialFile?: File | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFileTypes = '*',
  maxSizeMB = 10,
  initialFile = null,
}) => {
  const [file, setFile] = useState<File | null>(initialFile);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      
      if (acceptedFiles.length === 0) {
        return;
      }
      
      const selectedFile = acceptedFiles[0];
      
      // Check file size
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds the ${maxSizeMB}MB limit`);
        return;
      }
      
      setFile(selectedFile);
      onFileSelect(selectedFile);
    },
    [maxSizeMB, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? acceptedFileTypes.split(',').reduce((acc: Record<string, string[]>, type) => {
      acc[type] = [];
      return acc;
    }, {}) : undefined,
    maxFiles: 1,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
    setError(null);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 transition-colors
            ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              Drag & drop your file here, or <span className="text-primary cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {acceptedFileTypes !== '*'
                ? `Supported formats: ${acceptedFileTypes}`
                : 'All file types supported'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-md bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            type="button"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
};
