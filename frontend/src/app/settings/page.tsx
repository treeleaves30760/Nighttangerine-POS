'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  Package,
  Settings,
  LogOut,
  Home,
  ShoppingCart,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { productsApi, type Product, type CreateProductData, type UpdateProductData } from '@/lib/api';

export default function SettingsPage() {
  const { user, error, isLoading } = useUser();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState<CreateProductData>({
    name: '',
    price: 0,
    category: '',
    available: true
  });
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Load products from API
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductsError(null);
        const fetchedProducts = await productsApi.getAll();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProductsError(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      const fetchedProducts = await productsApi.getAll();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    try {
      setActionLoading('add');
      const product = await productsApi.create(newProduct);
      setProducts(prev => [...prev, product]);
      setNewProduct({ name: '', price: 0, category: '', available: true });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    
    try {
      setActionLoading(`edit-${editingProduct.id}`);
      const updates: UpdateProductData = {
        name: editingProduct.name,
        price: editingProduct.price,
        category: editingProduct.category,
        available: editingProduct.available,
      };
      const updatedProduct = await productsApi.update(editingProduct.id, updates);
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      alert(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setActionLoading(`delete-${id}`);
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      setActionLoading(`toggle-${id}`);
      const updatedProduct = await productsApi.toggleAvailability(id);
      setProducts(prev => prev.map(p => 
        p.id === id ? updatedProduct : p
      ));
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert(error instanceof Error ? error.message : 'Failed to toggle availability');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Authentication error: {error.message}</p>
          <Button asChild className="mt-4">
            <a href="/api/auth/login">Try Again</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            POS Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Welcome, {user?.name || user?.email?.split('@')[0]}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/sells">
            <Button variant="ghost" className="w-full justify-start">
              <ShoppingCart className="mr-3 h-4 w-4" />
              Point of Sale
            </Button>
          </Link>
          
          <Button variant="ghost" className="w-full justify-start bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
          
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-3 h-4 w-4" />
              Customer View
            </Button>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" asChild className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900">
            <a href="/api/auth/logout">
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Product Management</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your store's products and pricing</p>
            </div>
            <Button 
              onClick={() => setIsAddingNew(true)} 
              disabled={isAddingNew || isLoadingProducts}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Add New Product Form */}
        {isAddingNew && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name
                </label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="e.g. Beverages, Food, Bakery"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={handleAddProduct} 
                  className="flex-1"
                  disabled={actionLoading === 'add'}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {actionLoading === 'add' ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingNew(false)}
                  disabled={actionLoading === 'add'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoadingProducts ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          ) : productsError ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to Load Products</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{productsError}</p>
              <Button onClick={refreshProducts} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        {editingProduct?.id === product.id ? (
                          <Input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="max-w-xs"
                          />
                        ) : (
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingProduct?.id === product.id ? (
                          <Input
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="max-w-xs"
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">{product.category}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingProduct?.id === product.id ? (
                          <div className="flex items-center max-w-xs">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        ) : (
                          <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAvailability(product.id)}
                          disabled={actionLoading === `toggle-${product.id}`}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            product.available
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === `toggle-${product.id}` ? 'Updating...' : (product.available ? 'Available' : 'Out of Stock')}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {editingProduct?.id === product.id ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={handleSaveEdit}
                                disabled={actionLoading === `edit-${product.id}`}
                              >
                                <Save className="h-4 w-4" />
                                {actionLoading === `edit-${product.id}` ? 'Saving...' : ''}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setEditingProduct(null)}
                                disabled={actionLoading === `edit-${product.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEditProduct(product)}
                                disabled={!!actionLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={actionLoading === `delete-${product.id}`}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                              >
                                {actionLoading === `delete-${product.id}` ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              
              {products.length === 0 && !isLoadingProducts && !productsError && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Get started by adding your first product</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}