export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  amount?: string | null;
  hidden?: boolean;
  available: boolean; // legacy compatibility
  image_url?: string | null;
  has_image?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductData {
  name: string;
  price: number;
  category: string;
  amount?: string | null;
  hidden?: boolean;
  available?: boolean; // legacy
  image_url?: string | null; // legacy URL support
  image_base64?: string | null;
  image_mime_type?: string | null;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  category?: string;
  amount?: string | null;
  hidden?: boolean;
  available?: boolean; // legacy
  image_url?: string | null; // legacy URL support
  image_base64?: string | null;
  image_mime_type?: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.message || errorData.error || 'Request failed');
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API request failed:', error);
    throw new Error('Failed to connect to the server. Please check your connection.');
  }
}

export const productsApi = {
  // Get all products
  getAll: (): Promise<Product[]> => fetchApi('/api/products'),

  // Get available products only
  getAvailable: (): Promise<Product[]> => fetchApi('/api/products/available'),

  // Get product by ID
  getById: (id: string): Promise<Product> => fetchApi(`/api/products/${id}`),

  // Get products by category
  getByCategory: (category: string): Promise<Product[]> => 
    fetchApi(`/api/products/category/${encodeURIComponent(category)}`),

  // Create new product
  create: (data: CreateProductData): Promise<Product> =>
    fetchApi('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update product
  update: (id: string, data: UpdateProductData): Promise<Product> =>
    fetchApi(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Toggle product availability
  toggleAvailability: (id: string): Promise<Product> =>
    fetchApi(`/api/products/${id}/availability`, {
      method: 'PATCH',
    }),

  // Delete product
  delete: (id: string): Promise<void> =>
    fetchApi(`/api/products/${id}`, {
      method: 'DELETE',
    }),
};

export default productsApi;
