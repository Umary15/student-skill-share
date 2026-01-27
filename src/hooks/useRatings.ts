import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Rating {
  id: string;
  order_id: string;
  gig_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    username: string;
    avatar_url: string | null;
  };
}

export function useGigRatings(gigId: string) {
  return useQuery({
    queryKey: ['ratings', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          reviewer:profiles!ratings_reviewer_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('gig_id', gigId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Rating[];
    },
    enabled: !!gigId,
  });
}

export function useCreateRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, gigId, rating, comment }: { orderId: string; gigId: string; rating: number; comment?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ratings')
        .insert({
          order_id: orderId,
          gig_id: gigId,
          reviewer_id: user.id,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.gigId] });
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Thanks!', description: 'Your rating has been submitted.' });
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
