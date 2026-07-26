'use client';

import { useState, useRef, useEffect, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial value prop to previews
  useEffect(() => {
    if (value) {
      if (multiple && value.includes(',')) {
        setPreviews(value.split(',').filter(Boolean));
      } else {
        setPreviews([value]);
      }
    } else {
      setPreviews([]);
    }
  }, [value, multiple]);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-auto min-h-[160px]',
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the ${maxSizeMB}MB limit.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not a supported image file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);
    const newPreviews: string[] = [];
    let processedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newPreviews.push(reader.result);
        }
        processedCount++;

        if (processedCount === validFiles.length) {
          setLoading(false);
          const updated = multiple ? [...previews, ...newPreviews] : newPreviews;
          setPreviews(updated);
          onChange?.(updated.join(','));
        }
      };
      reader.onerror = () => {
        toast.error('Failed to process image file.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveSingle = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    if (updated.length === 0) {
      onRemove?.();
      onChange?.('');
    } else {
      onChange?.(updated.join(','));
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelect}
      />

      {previews.length > 0 ? (
        <div className="space-y-3">
          <div
            className={cn(
              'grid gap-3',
              previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
            )}
          >
            {previews.map((img, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
              >
                <img
                  src={img}
                  alt={`Uploaded content ${index + 1}`}
                  className={cn(
                    'w-full object-cover transition-transform duration-200 group-hover:scale-105',
                    aspectRatioClasses[aspectRatio]
                  )}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSingle(index)}
                  className="absolute top-2 right-2 rounded-full bg-slate-900/80 hover:bg-red-600 p-1.5 text-white backdrop-blur-xs transition-colors"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {(multiple || previews.length === 0) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-200 hover:bg-slate-50 text-xs font-semibold"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              {multiple ? 'Add More Images' : 'Change Image'}
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-6 text-center',
            isDragging
              ? 'border-orange-500 bg-orange-50/50 scale-[0.99]'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300',
            aspectRatioClasses[aspectRatio]
          )}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <p className="text-xs font-medium text-slate-500">Processing file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-white border border-slate-200/80 shadow-2xs text-slate-500">
                <Upload className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag and drop or click to upload (Max {maxSizeMB}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}