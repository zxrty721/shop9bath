export interface Product {
  ID: number;
  ProductName: string;
  Category: string;
  Price: number;
  Quantity: number;
  ProductImage: string;
}
export interface User {
  ID: number;
  Username: string;
  Fullname: string;
  Role: string;
  Status: 'active' | 'suspended' | 'fired'; // 👈 ต้องมีบรรทัดนี้
}
