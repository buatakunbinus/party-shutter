import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraCaptureProps {
  onPhotoCapture: (file: File) => void;
  photo: File | null;
  onRemovePhoto: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCapture,
  photo,
  onRemovePhoto,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onPhotoCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [onPhotoCapture, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB');
        return;
      }
      onPhotoCapture(file);
    }
  }, [onPhotoCapture]);

  if (photo) {
    return (
      <Card className="relative overflow-hidden">
        <img
          src={URL.createObjectURL(photo)}
          alt="Captured selfie"
          className="w-full h-48 object-cover"
        />
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onRemovePhoto}
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  if (isCameraActive) {
    return (
      <Card className="overflow-hidden">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button onClick={capturePhoto} size="lg" className="rounded-full">
              <Camera className="h-6 w-6" />
            </Button>
            <Button onClick={stopCamera} variant="outline" size="lg" className="rounded-full">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/50">
      <div className="p-8 text-center space-y-4">
        <div className="flex justify-center gap-4">
          <Button onClick={startCamera} size="lg" className="flex-1">
            <Camera className="h-5 w-5 mr-2" />
            Take Selfie
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            size="lg" 
            className="flex-1"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Photo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Snap a selfie or upload your favorite photo!
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
};