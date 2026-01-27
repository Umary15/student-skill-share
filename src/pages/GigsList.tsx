import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { GigCard } from '@/components/gigs/GigCard';
import { CategoryFilter } from '@/components/gigs/CategoryFilter';
import { SearchBar } from '@/components/gigs/SearchBar';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useGigs } from '@/hooks/useGigs';

export default function GigsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');

  const { data: gigs, isLoading } = useGigs({
    category: category !== 'all' ? category : undefined,
    search: search || undefined,
  });

  useEffect(() => {
    if (category !== 'all') {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  }, [category, setSearchParams]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Browse Gigs</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Find talented students offering support services. All gigs are for 
            learning support only — not full academic work.
          </p>

          {/* Search */}
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Categories */}
          <CategoryFilter
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
          />
        </motion.div>

        {/* Gigs Grid */}
        {isLoading ? (
          <PageLoader />
        ) : gigs && gigs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card-grid"
          >
            {gigs.map((gig, i) => (
              <GigCard key={gig.id} gig={gig} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
            <p className="text-muted-foreground">
              {search
                ? 'Try a different search term'
                : 'Be the first to create a gig in this category!'}
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
