import { Category } from '../../services/categoryService';
import Pagination from '../common/Pagination';
import CategoryItem from './CategoryItem';

interface CategoryListProps {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

const CategoryList = ({
  categories,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onEdit,
  onDelete
}: CategoryListProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <ul className="divide-y divide-gray-200">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No categories found
            </li>
          )}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>Showing {categories.length} of {totalElements} categories</span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryList;
