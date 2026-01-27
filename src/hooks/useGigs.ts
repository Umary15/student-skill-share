import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { GigCategory } from '@/lib/constants';

export interface Gig {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_ngn: number;
  delivery_days: number;
  category: GigCategory;
  image_url: string | null;
  average_rating: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface CreateGigData {
  title: string;
  description: string;
  price_ngn: number;
  delivery_days: number;
  category: GigCategory;
  image_url?: string | null;
}

export function useGigs(options?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['gigs', options?.category, options?.search],
    queryFn: async () => {
      let query = supabase
        .from('gigs')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category as GigCategory);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Gig[];
    },
  });
}

export function useGig(id: string) {
  return useQuery({
    queryKey: ['gig', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Gig;
    },
    enabled: !!id,
  });
}

export function useMyGigs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-gigs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Gig[];
    },
    enabled: !!user,
  });
}

export function useCreateGig() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGigData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: gig, error } = await supabase
        .from('gigs')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return gig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      toast({ title: 'Success!', description: 'Your gig has been created.' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateGigData> & { id: string }) => {
      const { data: gig, error } = await supabase
        .from('gigs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return gig;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig', variables.id] });
      toast({ title: 'Success!', description: 'Your gig has been updated.' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      toast({ title: 'Success!', description: 'Your gig has been deleted.' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
