'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Fixed: Added missing Input import
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MessageCircle,
  Navigation,
  AlertCircle,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  DollarSign,
  Package,
  Star, // Fixed: Added missing Star icon import
} from 'lucide-react';

// Step status
type StepStatus = 'pending' | 'active' | 'completed' | 'failed';

interface Step {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  icon: React.ReactNode;
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  address: string;
  city: string;
  state: string;
  estimated_price: number;
  final_price: number;
  created_at: string;
  check_in_time: string;
  check_out_time: string;
  check_in_photo: string;
  check_out_photo: string;
  customer: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
  provider: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    rating: number;
  };
}

export default function JobTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  // Check-in form
  const [checkInData, setCheckInData] = useState({
    lat: 0,
    lng: 0,
    photo: null as string | null,
    otp: '',
  });
  const [checkInPhotoPreview, setCheckInPhotoPreview] = useState<string | null>(null);

  // Check-out form
  const [checkOutData, setCheckOutData] = useState({
    lat: 0,
    lng: 0,
    photo: null as string | null,
    otp: '',
    final_price: 0,
  });
  const [checkOutPhotoPreview, setCheckOutPhotoPreview] = useState<string | null>(null);

  const [locationError, setLocationError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchJob();
  }, [jobId, isAuthenticated]);

  const fetchJob = async () => {
    try {
      const response = await jobApi.get(jobId);
      if (response.data.success) {
        const jobData = response.data.data.job;
        setJob(jobData);
        calculateActiveStep(jobData);
      }
    } catch (error) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const calculateActiveStep = (jobData: Job) => {
    const steps = [
      'posted',
      'assigned',
      'in_progress',
      'completed',
      'cancelled',
    ];
    const currentIndex = steps.indexOf(jobData.status);
    setActiveStep(currentIndex >= 0 ? currentIndex : 0);
  };

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setLocationError(null);
    setOtpError(null);

    try {
      // 1. Get GPS location
      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      // Validate location (check if within 100m of job location)
      // This would need actual distance calculation with job location

      // 2. Take photo
      if (!checkInData.photo) {
        throw new Error('Please take a photo before checking in');
      }

      // 3. Validate OTP
      if (!checkInData.otp || checkInData.otp.length !== 6) {
        setOtpError('Please enter the 6-digit OTP');
        setIsSubmitting(false);
        return;
      }

      // 4. Submit check-in
      const response = await jobApi.checkIn(jobId, {
        lat: latitude,
        lng: longitude,
        photo: checkInData.photo,
        otp: checkInData.otp,
      });

      if (response.data.success) {
        toast.success('Checked in successfully!');
        setShowCheckInModal(false);
        setCheckInData({ lat: 0, lng: 0, photo: null, otp: '' });
        setCheckInPhotoPreview(null);
        fetchJob();
      }
    } catch (error: any) {
      if (error.message === 'Geolocation is not supported') {
        setLocationError('GPS is not supported on this device');
      } else if (error.code === 1) {
        setLocationError('Please enable GPS and try again');
      } else {
        setLocationError(error.message || 'Failed to get location');
      }
      toast.error(error.message || 'Check-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setIsSubmitting(true);
    setLocationError(null);
    setOtpError(null);

    try {
      // 1. Get GPS location
      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      // 2. Take photo
      if (!checkOutData.photo) {
        throw new Error('Please take a photo before checking out');
      }

      // 3. Validate OTP
      if (!checkOutData.otp || checkOutData.otp.length !== 6) {
        setOtpError('Please enter the 6-digit OTP');
        setIsSubmitting(false);
        return;
      }

      // 4. Submit check-out
      const response = await jobApi.checkOut(jobId, {
        lat: latitude,
        lng: longitude,
        photo: checkOutData.photo,
        otp: checkOutData.otp,
        final_price: checkOutData.final_price || job?.estimated_price,
      });

      if (response.data.success) {
        toast.success('Checked out successfully!');
        setShowCheckOutModal(false);
        setCheckOutData({ lat: 0, lng: 0, photo: null, otp: '', final_price: 0 });
        setCheckOutPhotoPreview(null);
        fetchJob();
      }
    } catch (error: any) {
      if (error.message === 'Geolocation is not supported') {
        setLocationError('GPS is not supported on this device');
      } else if (error.code === 1) {
        setLocationError('Please enable GPS and try again');
      } else {
        setLocationError(error.message || 'Failed to get location');
      }
      toast.error(error.message || 'Check-out failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (error) {
      toast.error('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      if (showCheckInModal) {
        setCheckInData({ ...checkInData, photo: imageData });
        setCheckInPhotoPreview(imageData);
      } else if (showCheckOutModal) {
        setCheckOutData({ ...checkOutData, photo: imageData });
        setCheckOutPhotoPreview(imageData);
      }
      
      stopCamera();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      posted: 'bg-blue-100 text-blue-700',
      assigned: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="link" onClick={() => router.push('/jobs')}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';
  const isOwner = user?.id === job.customer.id;
  const isAssignedProvider = user?.id === job.provider?.id;

  const canCheckIn = isAssignedProvider && job.status === 'assigned';
  const canCheckOut = isAssignedProvider && job.status === 'in_progress';
  const canConfirm = isOwner && job.status === 'completed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline">{job.category}</Badge>
              {job.estimated_price && (
                <Badge variant="secondary">₦{job.estimated_price.toLocaleString()}</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tracking Code</p>
            <p className="font-mono text-sm">{job.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex justify-between">
              {[
                { label: 'Posted', icon: Package },
                { label: 'Assigned', icon: User },
                { label: 'In Progress', icon: Clock },
                { label: 'Completed', icon: CheckCircle2 },
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= activeStep;
                const isCurrent = index === activeStep;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-gray-50'
                      } ${isCurrent ? 'ring-2 ring-orange-300 ring-offset-2' : ''}`}
                    >
                      {isActive && index < activeStep ? (
                        <CheckCircle2 className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                    {index < 3 && (
                      <div
                        className={`absolute h-0.5 w-1/4 top-5 left-1/2 ${
                          index < activeStep ? 'bg-orange-500' : 'bg-gray-200'
                        }`}
                        style={{ left: `calc(${index * 25 + 12.5}%)` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Info */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{job.address}</p>
                {job.city && <p className="text-sm text-muted-foreground">{job.city}, {job.state}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Price</p>
                <p className="text-sm text-muted-foreground">
                  Estimated: ₦{job.estimated_price?.toLocaleString() || 'Negotiable'}
                </p>
                {job.final_price && (
                  <p className="text-sm font-semibold text-green-600">
                    Final: ₦{job.final_price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* People Involved */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {job.customer.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm">{job.customer.full_name}</p>
                <div className="flex gap-2 mt-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {job.provider && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  {job.provider.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">Provider</p>
                  <p className="text-sm">{job.provider.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{job.provider.rating || 'New'}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canCheckIn && (
          <Button
            className="gradient-rush text-white"
            onClick={() => setShowCheckInModal(true)}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Check In
          </Button>
        )}

        {canCheckOut && (
          <Button
            className="gradient-rush text-white"
            onClick={() => setShowCheckOutModal(true)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Check Out
          </Button>
        )}

        {canConfirm && (
          <Button
            className="bg-green-500 text-white hover:bg-green-600"
            onClick={async () => {
              try {
                const response = await jobApi.confirm(jobId, {});
                if (response.data.success) {
                  toast.success('Job confirmed!');
                  fetchJob();
                }
              } catch (error) {
                toast.error('Failed to confirm');
              }
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm Completion
          </Button>
        )}

        {job.status === 'posted' && isOwner && (
          <Button variant="destructive" onClick={async () => {
            try {
              const response = await jobApi.cancel(jobId);
              if (response.data.success) {
                toast.success('Job cancelled');
                fetchJob();
              }
            } catch (error) {
              toast.error('Failed to cancel');
            }
          }}>
            <X className="h-4 w-4 mr-2" />
            Cancel Job
          </Button>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Check In</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCheckInModal(false);
                    stopCamera();
                    setCheckInPhotoPreview(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Camera */}
                <div className="relative">
                  {!checkInPhotoPreview ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-48 rounded-lg bg-black object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      {!cameraActive ? (
                        <Button
                          onClick={startCamera}
                          className="absolute inset-0 m-auto w-32 h-12 gradient-rush text-white"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      ) : (
                        <Button
                          onClick={capturePhoto}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black hover:bg-gray-100"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={checkInPhotoPreview}
                        alt="Check-in photo"
                        className="w-full h-48 rounded-lg object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCheckInPhotoPreview(null);
                          setCheckInData({ ...checkInData, photo: null });
                          startCamera();
                        }}
                        className="absolute top-2 right-2 bg-white"
                      >
                        Retake
                      </Button>
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                <div>
                  <label className="text-sm font-medium">OTP Code *</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={checkInData.otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCheckInData({ ...checkInData, otp: val });
                        setOtpError(null);
                      }}
                      className={otpError ? 'border-red-500' : ''}
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        // Resend OTP logic
                        toast.info('OTP resent successfully');
                      }}
                    >
                      Resend
                    </Button>
                  </div>
                  {otpError && (
                    <p className="text-sm text-red-500 mt-1">{otpError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    The customer will provide the OTP to confirm your arrival
                  </p>
                </div>

                {/* GPS Status */}
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  <span>GPS will be verified on check-in</span>
                </div>

                {locationError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{locationError}</span>
                  </div>
                )}

                <Button
                  className="w-full gradient-rush text-white"
                  onClick={handleCheckIn}
                  disabled={isSubmitting || !checkInData.photo || !checkInData.otp}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Confirm Check In'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Check Out</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCheckOutModal(false);
                    stopCamera();
                    setCheckOutPhotoPreview(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Camera */}
                <div className="relative">
                  {!checkOutPhotoPreview ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-48 rounded-lg bg-black object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      {!cameraActive ? (
                        <Button
                          onClick={startCamera}
                          className="absolute inset-0 m-auto w-32 h-12 gradient-rush text-white"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      ) : (
                        <Button
                          onClick={capturePhoto}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black hover:bg-gray-100"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={checkOutPhotoPreview}
                        alt="Check-out photo"
                        className="w-full h-48 rounded-lg object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCheckOutPhotoPreview(null);
                          setCheckOutData({ ...checkOutData, photo: null });
                          startCamera();
                        }}
                        className="absolute top-2 right-2 bg-white"
                      >
                        Retake
                      </Button>
                    </div>
                  )}
                </div>

                {/* Final Price */}
                {isProvider && job.status === 'in_progress' && (
                  <div>
                    <label className="text-sm font-medium">Final Price (₦)</label>
                    <Input
                      type="number"
                      placeholder="Enter final price"
                      value={checkOutData.final_price || job.estimated_price || ''}
                      onChange={(e) =>
                        setCheckOutData({
                          ...checkOutData,
                          final_price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to use estimated price
                    </p>
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="text-sm font-medium">OTP Code *</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={checkOutData.otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCheckOutData({ ...checkOutData, otp: val });
                        setOtpError(null);
                      }}
                      className={otpError ? 'border-red-500' : ''}
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        // Resend OTP logic
                        toast.info('OTP resent successfully');
                      }}
                    >
                      Resend
                    </Button>
                  </div>
                  {otpError && (
                    <p className="text-sm text-red-500 mt-1">{otpError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    The customer will provide the OTP to confirm completion
                  </p>
                </div>

                {/* GPS Status */}
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  <span>GPS will be verified on check-out</span>
                </div>

                {locationError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{locationError}</span>
                  </div>
                )}

                <Button
                  className="w-full gradient-rush text-white"
                  onClick={handleCheckOut}
                  disabled={isSubmitting || !checkOutData.photo || !checkOutData.otp}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Confirm Check Out'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}