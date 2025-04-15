import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Category } from '../../services/categoryService';

interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

const CategoryItem = ({ category, onEdit, onDelete }: CategoryItemProps) => {
  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-600 truncate group-hover:text-blue-700 transition-colors duration-150">{category.name}</p>
          {category.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{category.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onEdit(category)}
            className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
            aria-label="Edit category"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => category.id && onDelete(category.id)}
            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
            aria-label="Delete category"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default CategoryItem;
