'use client';

import { useState, useEffect, useMemo } from 'react';
import { providerApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Star, Briefcase, UserX } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Provider {
  id: string;
  user?: {
    full_name?: string;
    profile_picture?: string;
  };
  skills?: string[];
  rating?: number;
  total_jobs_completed?: number;
  hourly_rate?: number;
  service_radius_km?: number;
  verification_level?: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await providerApi.search();
      if (response.data?.success) {
        setProviders(response.data.data?.providers || []);
      }
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering by name or skill
  const filteredProviders = useMemo(() => {
    if (!searchTerm.trim()) return providers;

    const term = searchTerm.toLowerCase();
    return providers.filter((provider) => {
      const nameMatch = provider.user?.full_name?.toLowerCase().includes(term);
      const skillMatch = provider.skills?.some((skill) =>
        skill.toLowerCase().includes(term)
      );
      return nameMatch || skillMatch;
    });
  }, [providers, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Find Providers</h1>
      <p className="text-muted-foreground mb-6">
        Connect with verified service professionals
      </p>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Provider List */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50/50">
          <UserX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No providers found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm
              ? `No results matching "${searchTerm}". Try a different skill or name.`
              : 'There are currently no active service providers available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => {
            const fullName = provider.user?.full_name || 'Anonymous Provider';
            const initial = fullName.charAt(0).toUpperCase();
            const skills = provider.skills || [];

            return (
              <Link href={`/providers/${provider.id}`} key={provider.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar / Fallback */}
                      {provider.user?.profile_picture ? (
                        <img
                          src={provider.user.profile_picture}
                          alt={fullName}
                          className="h-16 w-16 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-semibold text-white shrink-0">
                          {initial}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{fullName}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating ? provider.rating.toFixed(1) : 'New'}</span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs capitalize">
                              {skill}
                            </Badge>
                          ))}
                          {skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Briefcase className="h-4 w-4" />
                        <span>{provider.total_jobs_completed || 0} jobs</span>
                      </div>
                      <div className="text-sm font-semibold text-orange-500">
                        ₦{(provider.hourly_rate || 0).toLocaleString()}/hr
                      </div>
                    </div>

                    {/* Verification Tag */}
                    {provider.verification_level === 'verified' && (
                      <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        ✓ Verified
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}