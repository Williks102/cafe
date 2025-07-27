import { Prisma } from '@prisma/client';

export type OrderWithFullRelations = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    orderItems: {
      include: {
        product: true;
      };
    };
  };
}>;

export interface EmailOrderData {
  orderId: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    category?: string | null;
  }>;
  totalPrice: number;
  notes?: string | null;
  source?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  orderDate: Date;
  isUserOrder: boolean;
  userName?: string | null;
  userEmail?: string | null;
}