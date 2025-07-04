import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentRegistry } from '../assembly/ComponentRegistry';

interface GridItem {
  id: string;
  component: string;
  props: Record<string, any>;
  span?: number;
}

interface DynamicGridProps {
  items: GridItem[];
  columns?: number;
  gap?: number;
  className?: string;
}

/**
 * Responsive grid that dynamically renders components based on configuration.
 * Handles smooth transitions when items are added or removed.
 */
export const DynamicGrid: React.FC<DynamicGridProps> = ({
  items,
  columns = 3,
  gap = 24,
  className = ''
}) => {
  const registry = ComponentRegistry.getInstance();

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const getGridColumns = () => {
    // Responsive columns based on screen size
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
    }
    return columns;
  };

  return (
    <motion.div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
        gap: `${gap}px`
      }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => {
          const Component = registry.get(item.component);
          
          if (!Component) {
            console.warn(`Component ${item.component} not found in registry`);
            return null;
          }

          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              layout
              style={{
                gridColumn: item.span ? `span ${item.span}` : undefined
              }}
            >
              <Component {...item.props} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

// Register component
if (typeof window !== 'undefined' && window.ComponentRegistry) {
  window.ComponentRegistry.register('DynamicGrid', DynamicGrid);
}