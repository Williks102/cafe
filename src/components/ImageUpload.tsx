// components/ImageUpload.tsx
"use client";

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
  preview?: boolean;
}

interface UploadResponse {
  success: boolean;
  url: string;
  public_id: string;
  optimized_urls: {
    original: string;
    medium: string;
    thumbnail: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  error?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onError, 
  className = "",
  preview = true 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const error = 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.';
      onError?.(error);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const error = 'Fichier trop volumineux. Maximum 5MB.';
      onError?.(error);
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setUploadProgress('Préparation du fichier...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      setUploadProgress('Upload vers Cloudinary...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      setUploadProgress('Optimisation de l\'image...');
      
      // Petit délai pour montrer le succès
      setTimeout(() => {
        setUploadSuccess(true);
        onChange(data.url);
        
        console.log('✅ Upload réussi:', {
          url: data.url,
          public_id: data.public_id,
          size: data.metadata.size,
          format: data.metadata.format
        });

        // Reset success après 2 secondes
        setTimeout(() => {
          setUploadSuccess(false);
        }, 2000);
      }, 500);

    } catch (error) {
      console.error('❌ Erreur upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone d'upload */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
            ${dragOver 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-300 hover:border-amber-400'
            }
            ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
          `}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          <div className="text-center">
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-10 h-10 mx-auto text-amber-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Upload en cours...</p>
                  {uploadProgress && (
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress}</p>
                  )}
                </div>
              </div>
            ) : uploadSuccess ? (
              <div className="space-y-2">
                <CheckCircle className="w-10 h-10 mx-auto text-green-600" />
                <p className="text-sm font-medium text-green-700">Image uploadée avec succès !</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-10 h-10 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Cliquez ou glissez une image ici
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou WebP • Max 5MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir un fichier
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prévisualisation */}
      {value && preview && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Image uploadée"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Bouton supprimer */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* URL et infos */}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 break-all">
              <strong>URL:</strong> {value}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Image optimisée par Cloudinary
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-6"
              >
                Changer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input caché pour changement */}
      {value && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      )}
    </div>
  );
}