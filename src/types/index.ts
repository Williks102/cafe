// Interface pour les produits
export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string; // Changed from string | null to string
  available: boolean;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les clients
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les articles de commande
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

// Interface pour les commandes
export interface Order {
  id: number;
  customerId: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  orderItems: OrderItem[];
}

// Interface pour créer une commande (landing pages)
export interface CreateOrderRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  source?: string;
  notes?: string;
  items: Array<{
    // Pour produits existants
    productId?: number;
    // Pour produits des landing pages
    productName?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    // Commun
    quantity: number;
  }>;
}