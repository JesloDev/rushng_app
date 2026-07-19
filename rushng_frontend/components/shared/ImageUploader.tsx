'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploaderProps {
  value?: string | null;
  onChange?: (image: string) => void;
  onRemove?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  maxSizeMB?: number;
  label?: string;
  multiple?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  className,
  aspectRatio = 'square',
  maxSizeMB = 5,
  label = 'Upload Image',
  multiple = false,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-auto',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      
      if (multiple) {
        setPreviews(prev => [...prev, result]);
        // For multiple, emit all previews
        onChange?.(previews.join(','));
      } else {
        setPreview(result);
        onChange?.(result);
      }
      
      setLoading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read image');
      setLoading(false);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setPreviews([]);
    onRemove?.();
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const displayImages = preview ? [preview] : previews;

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {displayImages.length > 0 ? (
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {displayImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Uploaded ${index + 1}`}
                  className={cn(
                    'w-full rounded-lg border object-cover',
                    aspectRatioClasses[aspectRatio]
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (multiple) {
                      handleRemovePreview(index);
                    } else {
                      handleRemove();
                    }
                  }}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Add More
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition',
            aspectRatioClasses[aspectRatio]
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400">JPG, PNG, GIF up to {maxSizeMB}MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}