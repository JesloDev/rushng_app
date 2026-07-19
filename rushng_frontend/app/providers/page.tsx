'use client';

import { useState, useEffect } from 'react';
import { providerApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Provider {
  id: string;
  user: {
    full_name: string;
    profile_picture: string;
  };
  skills: string[];
  rating: number;
  total_jobs_completed: number;
  hourly_rate: number;
  service_radius_km: number;
  verification_level: string;
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
      if (response.data.success) {
        setProviders(response.data.data.providers || []);
      }
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Find Providers</h1>
      <p className="text-muted-foreground mb-6">Connect with verified service professionals</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, skill, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Link href={`/providers/${provider.id}`} key={provider.id}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-2xl text-white">
                    {provider.user.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{provider.user.full_name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{provider.rating || 'New'}</span>
                    </div>
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
                  <div className="text-sm font-semibold text-orange-500">
                    ₦{provider.hourly_rate || 0}/hr
                  </div>
                </div>

                {provider.verification_level === 'verified' && (
                  <Badge className="mt-2 bg-green-100 text-green-700">
                    ✓ Verified
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}