import { Order } from './types';
import { SAO_PAULO_COORDS } from '@store/AppStateContext';

const now = Date.now();

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    shortId: '#1023',
    restaurantName: 'Pizzaria do Porto',
    restaurantAddress: 'Rua de Santa Catarina, 123 - Porto',
    customerAddress: 'Rua da Cedofeita, 245 - Porto',
    value: 24.90,
    etaMinutes: 30,
    distanceKm: 4.2,
    status: 'going_to_restaurant',
    createdAt: now - 8 * 60 * 1000,
    updatedAt: now - 5 * 60 * 1000
  },
  {
    id: 'order-2',
    shortId: '#1024',
    restaurantName: 'Sushi Gaia',
    restaurantAddress: 'Avenida da Boavista, 800 - Porto',
    customerAddress: 'Rua do Campo Alegre, 500 - Porto',
    value: 35.50,
    etaMinutes: 40,
    distanceKm: 5.1,
    status: 'pending',
    createdAt: now - 2 * 60 * 1000,
    updatedAt: now - 2 * 60 * 1000
  },
  {
    id: 'order-3',
    shortId: '#1025',
    restaurantName: 'Hamburgueria Matosinhos',
    restaurantAddress: 'Rua de Brito Capelo, 250 - Matosinhos',
    customerAddress: 'Rua Heróis de França, 320 - Matosinhos',
    value: 18.75,
    etaMinutes: 20,
    distanceKm: 2.0,
    status: 'delivering',
    createdAt: now - 15 * 60 * 1000,
    updatedAt: now - 7 * 60 * 1000
  }
];

// Export somente para evitar import não utilizado. Mantém exemplo de uso futuro.
export const SAO_PAULO_REFERENCE = SAO_PAULO_COORDS;


