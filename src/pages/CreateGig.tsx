import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { GigForm } from '@/components/gigs/GigForm';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function CreateGig() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="page-container">
        <GigForm />
      </div>
    </Layout>
  );
}
