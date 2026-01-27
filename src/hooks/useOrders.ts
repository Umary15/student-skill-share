import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { OrderStatus } from '@/lib/constants';

export interface Order {
  id: string;
  buyer_id: string;
  gig_id: string;
  seller_id: string;
  status: OrderStatus;
  amount_ngn: number;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  gigs?: {
    id: string;
    title: string;
    image_url: string | null;
  };
  buyer?: {
    username: string;
  };
  seller?: {
    username: string;
  };
}

export function useMyOrders(role: 'buyer' | 'seller') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', role, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const column = role === 'buyer' ? 'buyer_id' : 'seller_id';
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          gigs (
            id,
            title,
            image_url
          ),
          buyer:profiles!orders_buyer_id_fkey (
            username
          ),
          seller:profiles!orders_seller_id_fkey (
            username
          )
        `)
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gigId, sellerId, amount }: { gigId: string; sellerId: string; amount: number }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          gig_id: gigId,
          seller_id: sellerId,
          amount_ngn: amount,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Success!', description: 'Order status updated.' });
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
