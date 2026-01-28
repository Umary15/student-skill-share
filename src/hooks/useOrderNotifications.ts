import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useOrderNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          toast.success('🎉 New order received!', {
            description: 'Someone just ordered your gig!',
          });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === 'delivered') {
            toast.success('📦 Order delivered!', {
              description: 'Your order has been marked as delivered.',
            });
          } else if (newStatus === 'paid') {
            toast.info('💳 Payment confirmed!', {
              description: 'Your payment has been processed.',
            });
          }
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === 'paid') {
            toast.success('💰 Payment received!', {
              description: 'A buyer has paid for your gig!',
            });
          }
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
