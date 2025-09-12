'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Package, 
  Search,
  Plus,
  Minus,
  CreditCard,
  Receipt,
  Hash,
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { productsApi, type Product } from '@/lib/api';

const LoginForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Staff Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Access the POS system
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <a href="/api/auth/login">
              Sign In with Auth0
            </a>
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline text-sm">
            ← Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function SellsPage() {
  const { user, error, isLoading } = useUser();
  const [cart, setCart] = React.useState<Array<{id: string; name: string; price: number; quantity: number}>>([]);
  const [total, setTotal] = React.useState(0);
  const [orderNumber, setOrderNumber] = React.useState(143);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: {id: string; name: string; price: number}) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as typeof cart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const processPayment = () => {
    if (cart.length === 0) return;
    
    // Simulate payment processing
    alert(`Order #${orderNumber} processed successfully!\nTotal: $${total.toFixed(2)}`);
    setCart([]);
    setOrderNumber(prev => prev + 1);
  };

  React.useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

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

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            POS System
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Welcome, {user.name || user.email?.split('@')[0]}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <ShoppingCart className="mr-3 h-4 w-4" />
            Point of Sale
          </Button>
          
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
          </Link>
          
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
      <div className="flex-1 flex">
        {/* Products Section */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Products</h2>
                <p className="text-gray-600 dark:text-gray-400">Select items to add to order</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoadingProducts ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))
            ) : productsError ? (
              <div className="col-span-full text-center py-12">
                <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to Load Products</h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{productsError}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Products Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? `No products match "${searchTerm}"` : 'No products available'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 group ${
                    product.available 
                      ? 'hover:shadow-md cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => product.available && addToCart(product)}
                >
                  <div className={`aspect-square bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-lg mb-3 flex items-center justify-center transition-transform ${
                    product.available ? 'group-hover:scale-105' : ''
                  }`}>
                    <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
                    {!product.available && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                        Out
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.category}</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">${product.price.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Current Order</h2>
            <div className="flex items-center text-purple-600 dark:text-purple-400">
              <Hash className="h-4 w-4 mr-1" />
              <span className="font-mono font-bold">{orderNumber}</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No items in order</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={processPayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
              <Button variant="outline" className="w-full" disabled={cart.length === 0} onClick={clearCart}>
                <Receipt className="mr-2 h-4 w-4" />
                Clear Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}