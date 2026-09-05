export type MenuType = 'food' | 'drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  prepTime: number;
  image: string;
  type: MenuType;
  category: string;
  popular: boolean;
}

export type StaffRole = 'chef' | 'bartender' | 'waiter';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'pretend';

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  type: MenuType;
}

export interface Complaint {
  message: string;
  rating: number;
  createdAt: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  totalPrepTime: number;
  totalAmount: number;
  createdAt: number;
  acceptedAt?: number;
  preparingStartedAt?: number;
  servedAt?: number;
  completedAt?: number;
  paidAt?: number;
  isPaid: boolean;
  paymentSubmitted: boolean;
  paymentMethod?: PaymentMethod;
  chefId?: string;
  bartenderId?: string;
  waiterId?: string;
  complaint?: Complaint;
}
