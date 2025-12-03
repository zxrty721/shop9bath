export interface User {
  id: number;
  username: string;
  fullname: string;
  role: string;
  status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  category: string | null;
  price: number;
  quantity: number;
  product_image: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string | null;
  price: number;
  quantity: number;
  created_at?: string | null;
}

export interface Order {
  id: number;
  total_amount: number;
  user_id: number;
  created_at: string | null;
  updated_at?: string | null;
  items: OrderItem[];
}

export interface DashboardStats {
  total_sales: number;
  total_orders: number;
  product_count: number;
  user_count: number;
  low_stock_count: number;
  today_sales: number;
  monthly_sales: number;
  yearly_sales: number;
}