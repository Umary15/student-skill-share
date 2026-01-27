import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, User, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageLoader, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RatingStars } from '@/components/gigs/RatingStars';
import { useGig } from '@/hooks/useGigs';
import { useGigRatings } from '@/hooks/useRatings';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { GIG_CATEGORIES } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

export default function GigDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: gig, isLoading: gigLoading } = useGig(id!);
  const { data: ratings, isLoading: ratingsLoading } = useGigRatings(id!);
  const createOrder = useCreateOrder();

  const category = GIG_CATEGORIES.find((c) => c.value === gig?.category);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOrder = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to order this gig.',
      });
      navigate('/login');
      return;
    }

    if (!gig) return;

    if (user.id === gig.user_id) {
      toast({
        title: 'Cannot order',
        description: "You can't order your own gig.",
        variant: 'destructive',
      });
      return;
    }

    try {
      await createOrder.mutateAsync({
        gigId: gig.id,
        sellerId: gig.user_id,
        amount: gig.price_ngn,
      });

      toast({
        title: 'Order created!',
        description: 'Your order has been placed. Payment integration coming soon!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Order error:', error);
    }
  };

  if (gigLoading) return <Layout><PageLoader /></Layout>;

  if (!gig) {
    return (
      <Layout>
        <div className="page-container text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Gig not found</h2>
          <p className="text-muted-foreground mb-6">
            This gig may have been removed or doesn't exist.
          </p>
          <Button asChild>
            <Link to="/gigs">Browse Gigs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Image */}
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
              {gig.image_url ? (
                <img
                  src={gig.image_url}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {category?.emoji || '🎯'}
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div>
              <Badge className="mb-3">
                {category?.emoji} {category?.label}
              </Badge>
              <h1 className="text-3xl font-bold">{gig.title}</h1>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{gig.profiles?.username}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RatingStars rating={gig.average_rating} readonly size="sm" />
                  <span>
                    {gig.average_rating > 0
                      ? `${gig.average_rating.toFixed(1)} (${gig.total_reviews} reviews)`
                      : 'New seller'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Gig</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {gig.description}
              </p>
            </div>

            {/* Ethics Notice */}
            <div className="bg-accent/50 p-4 rounded-lg border border-accent">
              <p className="text-sm text-accent-foreground">
                📚 <strong>Academic Integrity Notice:</strong> This service is for 
                learning support only — including guidance, examples, and tutoring. 
                Final work should be your own.
              </p>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Reviews ({ratings?.length || 0})
              </h2>
              
              {ratingsLoading ? (
                <LoadingSpinner />
              ) : ratings && ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {rating.reviewer?.username || 'Anonymous'}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(rating.created_at)}
                              </span>
                            </div>
                            <RatingStars rating={rating.rating} readonly size="sm" />
                            {rating.comment && (
                              <p className="mt-2 text-muted-foreground">
                                {rating.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </div>
          </motion.div>

          {/* Sidebar - Order Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order This Gig</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(gig.price_ngn)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {gig.delivery_days} day{gig.delivery_days > 1 ? 's' : ''}
                  </span>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleOrder}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
