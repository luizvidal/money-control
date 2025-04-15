import { PlusIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import CategoryItem from '../components/categories/CategoryItem';
import CategoryModal from '../components/categories/CategoryModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Notification from '../components/common/Notification';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import PageLayout from '../components/Layout/PageLayout';
import categoryService, { Category } from '../services/categoryService';
import '../styles/animations.css';
import { PageResponse } from '../types/PageResponse';

interface CategoryFormData {
  id?: number;
  name: string;
  description: string;
}

const Categories = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryFormData>({
    name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({
    type: 'success' as 'success' | 'error',
    message: '',
    isVisible: false
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [paginatedCategories, setPaginatedCategories] = useState<Category[]>([]);

  // Fetch categories with pagination
  const { data: categoriesData, isLoading, isFetching } = useQuery({
    queryKey: ['categories', currentPage, pageSize],
    queryFn: () => categoryService.getAll({ pageNo: currentPage, pageSize, sortBy: 'name', sortDir: 'asc' })
  });

  // Update state when data changes
  useEffect(() => {
    if (categoriesData) {
      if ('content' in categoriesData) {
        const pageData = categoriesData as PageResponse<Category>;
        setPaginatedCategories(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        setPaginatedCategories(categoriesData as Category[]);
        setTotalPages(1);
        setTotalElements((categoriesData as Category[]).length);
      }
    }
  }, [categoriesData]);

  // Mutation to create category
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      showNotification('success', 'Category created successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to create category: ${error.message}`);
    }
  });

  // Mutation to update category
  const updateMutation = useMutation({
    mutationFn: (category: Category) =>
      categoryService.update(category.id!, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      showNotification('success', 'Category updated successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to update category: ${error.message}`);
    }
  });

  // Mutation to delete category
  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showNotification('success', 'Category deleted successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to delete category: ${error.message}`);
    }
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setCurrentCategory({
        id: category.id,
        name: category.name,
        description: category.description || ''
      });
      setIsEditing(true);
    } else {
      setCurrentCategory({
        name: '',
        description: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setCurrentCategory({
      name: '',
      description: ''
    });
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentCategory.id) {
      updateMutation.mutate(currentCategory as Category);
    } else {
      createMutation.mutate(currentCategory as Category);
    }
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete !== null) {
      deleteMutation.mutate(categoryToDelete);
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setCategoryToDelete(null);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Loading state
  if (isLoading || isFetching) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  // Create new category button
  const newCategoryButton = (
    <button
      onClick={() => handleOpenModal()}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      New Category
    </button>
  );

  // Page header component
  const header = (
    <div className="p-6 pb-0">
      <PageHeader
        title="Categories"
        subtitle="Manage your transaction categories"
        action={newCategoryButton}
      />
    </div>
  );

  // Page content component
  const content = (
    <div className="p-6 pt-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <ul className="divide-y divide-gray-200">
          {paginatedCategories && paginatedCategories.length > 0 ? (
            paginatedCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No categories found
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  // Page footer with pagination
  const footer = totalPages > 1 ? (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <span>Showing {paginatedCategories.length} of {totalElements} categories</span>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page: number) => setCurrentPage(page)}
      />
    </div>
  ) : null;

  return (
    <div className="h-full animate-fadeIn">
      <PageLayout
        header={header}
        content={content}
        footer={footer}
      />

      {/* Category modal */}
      <CategoryModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        category={currentCategory}
        onClose={resetForm}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default Categories;
