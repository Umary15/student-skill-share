import { motion } from 'framer-motion';
import { GIG_CATEGORIES } from '@/lib/constants';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const allCategories = [{ value: 'all', label: 'All Gigs', emoji: '🔥' }, ...GIG_CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {allCategories.map((cat) => (
        <motion.button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {cat.emoji} {cat.label}
        </motion.button>
      ))}
    </div>
  );
}
