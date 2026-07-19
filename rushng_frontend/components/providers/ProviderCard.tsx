'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { MapPin, Briefcase, Star } from 'lucide-react';

interface ProviderCardProps {
  provider: {
    id: string;
    user: { full_name: string };
    skills: string[];
    rating: number;
    total_jobs_completed: number;
    hourly_rate: number;
    service_radius_km: number;
    verification_level: string;
  };
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/providers/${provider.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-bold text-white">
              {provider.user.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{provider.user.full_name}</h3>
              <RatingStars rating={provider.rating || 0} size="sm" />
              <div className="flex flex-wrap gap-1 mt-2">
                {provider.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {provider.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase className="h-4 w-4" />
              <span>{provider.total_jobs_completed || 0} jobs</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{provider.service_radius_km || 10} km</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-orange-500">
              ₦{provider.hourly_rate || 0}/hr
            </span>
            {provider.verification_level === 'verified' && (
              <Badge className="bg-green-100 text-green-700">✓ Verified</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}