export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  customerId: number;
  status: OrderStatus;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  orderItems: OrderItem[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: {
    productId: number;
    quantity: number;
  }[];
  notes?: string;
}

export interface CartItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
}