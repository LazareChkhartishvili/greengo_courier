import { useCallback, useEffect, useRef, useState } from 'react';
import { Location } from '../types';
import { apiService } from '../utils/api';

interface Order {
  _id: string;
  userId: {
    name?: string;
    phoneNumber: string;
  };
  restaurantId: {
    _id: string;
    name: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
      city?: string;
    };
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  estimatedDelivery: string;
  orderDate: string;
}

interface UseCourierOrdersProps {
  courierId: string | null;
  driverLocation: Location;
  isOnline: boolean;
}

export const useCourierOrders = ({ courierId, driverLocation, isOnline }: UseCourierOrdersProps) => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available orders (status: ready)
  const fetchAvailableOrders = useCallback(async () => {
    if (!isOnline || !courierId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAvailableOrders(
        courierId,
        driverLocation.latitude,
        driverLocation.longitude
      );

      if (response.success && response.data) {
        const orders = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).data || [];
        setAvailableOrders(orders);
      } else {
        setError(response.error?.details || 'შეცდომა შეკვეთების მიღებისას');
      }
    } catch (err: any) {
      setError(err.message || 'უცნობი შეცდომა');
    } finally {
      setLoading(false);
    }
  }, [courierId, driverLocation, isOnline]);

  // Fetch current order assigned to courier
  const fetchCurrentOrder = useCallback(async () => {
    if (!courierId) return;

    try {
      const response = await apiService.getCourierOrders(courierId);
      if (response.success && response.data) {
        const orders = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).data || [];
        // Find active order (delivering or ready)
        const activeOrder = orders.find(
          (order: Order) => order.status === 'delivering' || order.status === 'ready'
        );
        setCurrentOrder(activeOrder || null);
      }
    } catch (err: any) {
      console.error('Error fetching current order:', err);
    }
  }, [courierId]);

  // Accept order
  const acceptOrder = useCallback(async (orderId: string) => {
    if (!courierId) return false;

    try {
      const response = await apiService.acceptOrder(orderId, courierId);
      if (response.success) {
        await fetchCurrentOrder();
        await fetchAvailableOrders();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error accepting order:', err);
      return false;
    }
  }, [courierId, fetchCurrentOrder, fetchAvailableOrders]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, status);
      if (response.success) {
        await fetchCurrentOrder();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      return false;
    }
  }, [fetchCurrentOrder]);

  // Complete order
  const completeOrder = useCallback(async (orderId: string) => {
    if (!courierId) return false;

    try {
      const response = await apiService.completeOrder(orderId, courierId);
      if (response.success) {
        setCurrentOrder(null);
        await fetchCurrentOrder();
        await fetchAvailableOrders();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error completing order:', err);
      return false;
    }
  }, [courierId, fetchAvailableOrders, fetchCurrentOrder]);

  // Store latest function versions in refs
  const fetchAvailableOrdersRef = useRef(fetchAvailableOrders);
  const fetchCurrentOrderRef = useRef(fetchCurrentOrder);
  
  // Update refs when functions change
  useEffect(() => {
    fetchAvailableOrdersRef.current = fetchAvailableOrders;
    fetchCurrentOrderRef.current = fetchCurrentOrder;
  }, [fetchAvailableOrders, fetchCurrentOrder]);

  // Poll for available orders when online
  useEffect(() => {
    if (!isOnline || !courierId) return;

    // Initial fetch
    fetchAvailableOrdersRef.current();
    fetchCurrentOrderRef.current();

    // Poll every 10 seconds for new orders
    const interval = setInterval(() => {
      fetchAvailableOrdersRef.current();
      fetchCurrentOrderRef.current();
    }, 10000);

    return () => clearInterval(interval);
  }, [isOnline, courierId]); // Remove function dependencies to prevent re-creating interval

  return {
    availableOrders,
    currentOrder,
    loading,
    error,
    fetchAvailableOrders,
    fetchCurrentOrder,
    acceptOrder,
    updateOrderStatus,
    completeOrder,
  };
};

