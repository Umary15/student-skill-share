import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { RatingStars } from '@/components/gigs/RatingStars';
import { useUpdateOrderStatus, type Order } from '@/hooks/useOrders';
import { useCreateRating } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface OrderCardProps {
  order: Order;
  role: 'buyer' | 'seller';
}

export function OrderCard({ order, role }: OrderCardProps) {
  const { user } = useAuth();
  const updateStatus = useUpdateOrderStatus();
  const createRating = useCreateRating();
  
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const statusInfo = ORDER_STATUS_LABELS[order.status];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleMarkDelivered = async () => {
    await updateStatus.mutateAsync({
      orderId: order.id,
      status: 'delivered',
    });
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    
    await createRating.mutateAsync({
      orderId: order.id,
      gigId: order.gig_id,
      rating,
      comment: comment || undefined,
    });
    
    setShowRating(false);
  };

  const canMarkDelivered = role === 'seller' && order.status === 'paid';
  const canRate = role === 'buyer' && order.status === 'delivered';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover-lift">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
              {order.gigs?.image_url ? (
                <img
                  src={order.gigs.image_url}
                  alt={order.gigs.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🎯
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold truncate">
                  {order.gigs?.title || 'Gig'}
                </h3>
                <Badge
                  variant={
                    statusInfo.color === 'success'
                      ? 'default'
                      : statusInfo.color === 'warning'
                      ? 'secondary'
                      : 'outline'
                  }
                  className={
                    statusInfo.color === 'success'
                      ? 'bg-success'
                      : statusInfo.color === 'destructive'
                      ? 'bg-destructive'
                      : ''
                  }
                >
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(order.created_at)}
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(order.amount_ngn)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {role === 'buyer' ? (
                  <>Seller: {order.seller?.username}</>
                ) : (
                  <>Buyer: {order.buyer?.username}</>
                )}
              </p>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                {canMarkDelivered && (
                  <Button
                    size="sm"
                    onClick={handleMarkDelivered}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    Mark Delivered
                  </Button>
                )}

                {canRate && !showRating && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowRating(true)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Rate
                  </Button>
                )}
              </div>

              {/* Rating Form */}
              {showRating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-muted rounded-lg"
                >
                  <p className="text-sm font-medium mb-2">Rate this gig:</p>
                  <RatingStars rating={rating} onRatingChange={setRating} size="lg" />
                  <Textarea
                    placeholder="Leave a comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-3"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleSubmitRating}
                      disabled={rating === 0 || createRating.isPending}
                    >
                      {createRating.isPending ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : null}
                      Submit Rating
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowRating(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
