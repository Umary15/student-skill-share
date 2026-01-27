import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GigCard } from '@/components/gigs/GigCard';
import { OrderCard } from '@/components/orders/OrderCard';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useMyGigs } from '@/hooks/useGigs';
import { useMyOrders } from '@/hooks/useOrders';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: myGigs, isLoading: gigsLoading } = useMyGigs();
  const { data: sellerOrders, isLoading: sellerOrdersLoading } = useMyOrders('seller');
  const { data: buyerOrders, isLoading: buyerOrdersLoading } = useMyOrders('buyer');

  const [activeTab, setActiveTab] = useState('gigs');

  if (authLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const paidSellerOrders = sellerOrders?.filter(o => o.status === 'paid' || o.status === 'delivered') || [];
  const pendingOrders = sellerOrders?.filter(o => o.status === 'paid') || [];

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.username || 'Student'} 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your gigs and track your orders
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Gigs</p>
                  <p className="text-2xl font-bold">{myGigs?.length || 0}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{pendingOrders.length}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(profile?.total_earnings || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {sellerOrders?.filter(o => o.status === 'delivered').length || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="gigs">My Gigs</TabsTrigger>
                <TabsTrigger value="selling">Selling Orders</TabsTrigger>
                <TabsTrigger value="buying">My Purchases</TabsTrigger>
              </TabsList>

              <Button asChild>
                <Link to="/create-gig">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Gig
                </Link>
              </Button>
            </div>

            <TabsContent value="gigs">
              {gigsLoading ? (
                <PageLoader />
              ) : myGigs && myGigs.length > 0 ? (
                <div className="card-grid">
                  {myGigs.map((gig, i) => (
                    <GigCard key={gig.id} gig={gig} index={i} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-lg font-semibold mb-2">No gigs yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first gig and start earning!
                    </p>
                    <Button asChild>
                      <Link to="/create-gig">Create Gig</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="selling">
              {sellerOrdersLoading ? (
                <PageLoader />
              ) : sellerOrders && sellerOrders.length > 0 ? (
                <div className="space-y-4">
                  {sellerOrders.map((order) => (
                    <OrderCard key={order.id} order={order} role="seller" />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                      When someone orders your gig, it will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="buying">
              {buyerOrdersLoading ? (
                <PageLoader />
              ) : buyerOrders && buyerOrders.length > 0 ? (
                <div className="space-y-4">
                  {buyerOrders.map((order) => (
                    <OrderCard key={order.id} order={order} role="buyer" />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-4xl mb-4">🛒</div>
                    <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Browse gigs and find the help you need!
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/gigs">Browse Gigs</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
