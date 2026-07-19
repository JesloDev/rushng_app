'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { providerApi, ratingApi, jobApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Star,
  Briefcase,
  Clock,
  DollarSign,
  Shield,
  CheckCircle2,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Award,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface Provider {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_picture: string;
    created_at: string;
  };
  skills: string[];
  years_experience: number;
  hourly_rate: number;
  service_radius_km: number;
  verification_level: 'basic' | 'verified' | 'certified';
  is_available: boolean;
  rating: number;
  total_jobs_completed: number;
  total_jobs_cancelled: number;
  compliance_score: number;
  portfolio_urls: string[];
  description: string;
  address: string;
  city: string;
  state: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  rater: {
    full_name: string;
  };
}

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const providerId = params.id as string;

  useEffect(() => {
    fetchProvider();
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const [providerRes, reviewsRes] = await Promise.all([
        providerApi.get(providerId),
        ratingApi.user(providerId),
      ]);

      if (providerRes.data.success) {
        setProvider(providerRes.data.data.provider);
      }

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data.ratings || []);
      }
    } catch (error) {
      toast.error('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/messages?user=${providerId}`);
  };

  const handleHire = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/jobs/post?provider=${providerId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Provider not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === provider.user.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                {provider.user.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold">{provider.user.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className="bg-orange-100 text-orange-700">
                      {provider.verification_level.toUpperCase()}
                    </Badge>
                    {provider.is_available ? (
                      <Badge className="bg-green-100 text-green-700">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Busy</Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{provider.rating || 'New'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleContact}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  {!isOwner && (
                    <Button onClick={handleHire} className="gradient-rush text-white">
                      Hire Now
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {provider.city || provider.address || 'Location not specified'}
                    {provider.state ? `, ${provider.state}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{provider.total_jobs_completed || 0} jobs completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>₦{provider.hourly_rate?.toLocaleString() || 'Negotiable'}/hr</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{provider.years_experience || 0} years experience</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Compliance: {provider.compliance_score || 100}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">About Me</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {provider.description || 'No description provided yet.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </Badge>
                  ))}
                  {provider.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {provider.total_jobs_completed || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {provider.rating || 'New'}
                  </div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {provider.compliance_score || 100}%
                  </div>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {provider.verification_level === 'certified' ? '✅' : '🔄'}
                  </div>
                  <p className="text-sm text-muted-foreground">Verification</p>
                </div>
              </div>

              {/* Contact Info (for customers) */}
              {!isOwner && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{provider.user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{provider.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{provider.address || 'Address not provided'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.rater.full_name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <Card>
            <CardContent className="p-6">
              {provider.portfolio_urls?.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No portfolio items yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {provider.portfolio_urls.map((url, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={url}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}