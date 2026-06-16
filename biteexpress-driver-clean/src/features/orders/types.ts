export type OrderStatus =
  | 'pending'
  | 'going_to_restaurant'
  | 'picked_up'
  | 'delivering'
  | 'delivered';

export type Order = {
  id: string;
  shortId: string;
  restaurantName: string;
  restaurantAddress: string;
  customerAddress: string;
  value: number;
  etaMinutes: number;
  distanceKm: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};


