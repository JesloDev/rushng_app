'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RatingStars } from '@/components/shared/RatingStars';
import {
  MapPin,
  Briefcase,
  Star,
  DollarSign,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { format, isValid } from 'date-fns';

export interface ProviderUser {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface Provider {
  id?: string;
  user?: ProviderUser;
  verification_level?: string;
  is_available?: boolean;
  rating?: number;
  city?: string;
  address?: string;
  total_jobs_completed?: number;
  hourly_rate?: number;
  years_experience?: number;
  compliance_score?: number;
  description?: string;
  skills?: string[];
  portfolio_urls?: string[];
}

export interface Review {
  id: string | number;
  rater?: {
    full_name?: string;
  };
  rating: number;
  created_at: string | Date;
  comment?: string;
}

interface ProviderProfileProps {
  provider: Provider;
  reviews?: Review[];
  isOwner?: boolean;
  onHire?: () => void;
  onMessage?: () => void;
}

export function ProviderProfile({
  provider,
  reviews = [],
  isOwner = false,
  onHire,
  onMessage,
}: ProviderProfileProps) {
  const [activeTab, setActiveTab] = useState('about');

  const formatDateSafe = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return isValid(d) ? format(d, 'MMM d, yyyy') : 'Recently';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold">
                {provider.user?.full_name?.charAt(0).toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold">{provider.user?.full_name || 'Service Provider'}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                      {provider.verification_level?.toUpperCase() || 'BASIC'}
                    </Badge>
                    {provider.is_available ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Busy</Badge>
                    )}
                    <RatingStars rating={provider.rating || 0} size="sm" />
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isOwner && (
                    <>
                      <Button variant="outline" onClick={onMessage}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button onClick={onHire} className="gradient-rush text-white">
                        Hire Now
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{provider.city || provider.address || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{provider.total_jobs_completed || 0} jobs completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>₦{provider.hourly_rate ? provider.hourly_rate.toLocaleString() : 'Negotiable'}/hr</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{provider.years_experience || 0} years experience</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Compliance: {provider.compliance_score ?? 100}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">About Me</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {provider.description || 'No description provided yet.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.skills && provider.skills.length > 0 ? (
                    provider.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill.charAt(0).toUpperCase() + skill.slice(1)}
                      </Badge>
                    ))
                  ) : (
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
                    {provider.rating ? provider.rating.toFixed(1) : 'New'}
                  </div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {provider.compliance_score ?? 100}%
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

              {/* Contact Info (Only visible to third parties) */}
              {!isOwner && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{provider.user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{provider.user?.email || 'Not provided'}</span>
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
                  <Star className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.rater?.full_name || 'Anonymous'}</p>
                          <RatingStars rating={review.rating} size="sm" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDateSafe(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
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
              {!provider.portfolio_urls || provider.portfolio_urls.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No portfolio items yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {provider.portfolio_urls.map((url, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={url}
                        alt={`Portfolio item ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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