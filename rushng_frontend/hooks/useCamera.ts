'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useCamera(options: CameraOptions = {}) {
  const {
    facingMode = 'environment',
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      return mediaStream;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to access camera';
      setError(message);
      toast.error('Camera access denied. Please allow camera permissions.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [facingMode, maxWidth, maxHeight]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast.error('Failed to capture image');
      return null;
    }

    canvas.width = video.videoWidth || maxWidth;
    canvas.height = video.videoHeight || maxHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', quality);
    setImage(imageData);
    return imageData;
  }, [maxWidth, maxHeight, quality]);

  const resetImage = useCallback(() => {
    setImage(null);
  }, []);

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    await startCamera();
    return newFacingMode;
  }, [facingMode, startCamera, stopCamera]);

  return {
    videoRef,
    canvasRef,
    stream,
    loading,
    error,
    image,
    startCamera,
    stopCamera,
    capturePhoto,
    resetImage,
    switchCamera,
  };
}