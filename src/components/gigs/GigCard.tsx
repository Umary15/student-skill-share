import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GIG_CATEGORIES } from '@/lib/constants';
import type { Gig } from '@/hooks/useGigs';

interface GigCardProps {
  gig: Gig;
  index?: number;
}

export function GigCard({ gig, index = 0 }: GigCardProps) {
  const category = GIG_CATEGORIES.find((c) => c.value === gig.category);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/gigs/${gig.id}`}>
        <Card className="group hover-lift overflow-hidden h-full">
          {/* Image */}
          <div className="aspect-video bg-muted relative overflow-hidden">
            {gig.image_url ? (
              <img
                src={gig.image_url}
                alt={gig.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {category?.emoji || '🎯'}
              </div>
            )}
            <Badge className="absolute top-3 left-3" variant="secondary">
              {category?.emoji} {category?.label}
            </Badge>
          </div>

          <CardContent className="p-4">
            {/* Seller */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                {gig.profiles?.username || 'Anonymous'}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {gig.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="text-sm font-medium">
                {gig.average_rating > 0 ? gig.average_rating.toFixed(1) : 'New'}
              </span>
              {gig.total_reviews > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({gig.total_reviews})
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{gig.delivery_days} day{gig.delivery_days > 1 ? 's' : ''}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="font-bold text-primary">{formatPrice(gig.price_ngn)}</p>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
