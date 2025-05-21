
import { Category } from '../types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

const CategoryBadge = ({ category, size = 'md' }: CategoryBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1 px-3'
  };
  
  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${category.color}20`,  // 20% opacity
        color: category.color 
      }}
    >
      <category.icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {category.name}
    </span>
  );
};

export default CategoryBadge;
