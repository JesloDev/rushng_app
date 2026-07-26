'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { MapPin, Briefcase, CheckCircle2, ShieldCheck, Bike } from 'lucide-react';

export interface Provider {
  id: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
  skills: string[];
  rating: number;
  total_jobs_completed: number;
  hourly_rate?: number;
  base_rate?: number;
  service_radius_km: number;
  verification_level: 'unverified' | 'pending' | 'tier_1' | 'tier_2' | 'verified' | string;
  vehicle_type?: string;
  is_available?: boolean;
}

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const {
    id,
    user,
    skills = [],
    rating = 0,
    total_jobs_completed = 0,
    hourly_rate,
    base_rate,
    service_radius_km = 10,
    verification_level = 'unverified',
    vehicle_type,
    is_available = true,
  } = provider;

  const fullName = user?.full_name || 'RushNG Dispatcher';
  const initial = fullName.charAt(0).toUpperCase();

  const isVerified = verification_level === 'verified' || verification_level === 'tier_2';

  return (
    <Link href={`/providers/${id}`} className="block h-full group">
      <Card className="h-full border-slate-200 bg-white transition-all duration-200 hover:shadow-md hover:border-orange-200 overflow-hidden flex flex-col justify-between">
        <CardContent className="p-5 space-y-4">
          {/* Header Section */}
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              {user?.avatar_url ? (
                <div className="relative h-14 w-14 rounded-full overflow-hidden border border-slate-100">
                  <Image
                    src={user.avatar_url}
                    alt={fullName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-xl font-bold text-white shadow-sm">
                  {initial}
                </div>
              )}
              
              {/* Online/Available Status Dot */}
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  is_available ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                title={is_available ? 'Available Now' : 'Currently Offline'}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900 truncate text-base group-hover:text-orange-600 transition-colors">
                  {fullName}
                </h3>
                {isVerified && (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600 shrink-0"
                    title="Verified RushNG Provider"
                  />
                )}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <RatingStars rating={rating} size="sm" />
                <span className="text-xs text-slate-500 font-medium">
                  ({rating.toFixed(1)})
                </span>
              </div>

              {/* Vehicle / Service Type Badge if present */}
              {vehicle_type && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Bike className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="capitalize">{vehicle_type}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills Badges */}
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-normal border border-slate-200/50"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge
                variant="outline"
                className="text-[11px] px-1.5 py-0.5 text-slate-500 border-slate-200 font-normal"
              >
                +{skills.length - 3} more
              </Badge>
            )}
          </div>

          {/* Jobs & Coverage Info */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>{total_jobs_completed} jobs done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Within {service_radius_km} km</span>
            </div>
          </div>
        </CardContent>

        {/* Footer Rates & Status */}
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-orange-600">
              ₦{(hourly_rate || base_rate || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 ml-0.5">
              {hourly_rate ? '/hr' : '/trip'}
            </span>
          </div>

          {isVerified ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[11px] font-medium gap-1 px-2 py-0.5">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 border-slate-200 text-[11px] font-normal">
              Standard
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}