'use client';

import { useState, useEffect } from 'react';
import { providerApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function ProviderSearch({ onResults }: { onResults: (providers: any[]) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await providerApi.search({ q: searchTerm });
      if (response.data.success) {
        onResults(response.data.data.providers || []);
      }
    } catch (error) {
      toast.error('Failed to search providers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search by name, skill, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && search()}
        className="flex-1"
      />
      <Button onClick={search} disabled={loading} className="gradient-rush text-white">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
}