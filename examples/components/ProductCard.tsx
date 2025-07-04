import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  onSelect?: (id: string) => void;
  animationDelay?: number;
}

/**
 * Luxury product card component with hover effects and smooth animations.
 * Follows Prada-like minimalist aesthetic with subtle interactions.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  category,
  description,
  onSelect,
  animationDelay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: animationDelay,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.article
      className="relative bg-white cursor-pointer group"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect?.(id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          variants={imageVariants}
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-black/10"
              variants={overlayVariants}
              initial="initial"
              animate="hover"
              exit="initial"
            />
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          className="absolute top-4 right-4 flex flex-col gap-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          <button
            className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart 
              size={18} 
              className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}
            />
          </button>
          <button className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
            <Eye size={18} className="text-gray-700" />
          </button>
        </motion.div>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-medium uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-900">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-light">
            ${price.toLocaleString()}
          </span>
          <motion.button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBag size={18} className="text-gray-700" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.ComponentRegistry) {
  window.ComponentRegistry.register('ProductCard', ProductCard);
}