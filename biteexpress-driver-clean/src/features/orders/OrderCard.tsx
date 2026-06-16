import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order, OrderStatus } from './types';

type Props = {
  order: Order;
  onChangeStatus: (status: OrderStatus) => void;
};

const statusLabel: Record<OrderStatus, string> = {
  pending: 'À espera de confirmação',
  going_to_restaurant: 'A caminho do restaurante',
  picked_up: 'Pedido recolhido',
  delivering: 'Em entrega',
  delivered: 'Entregue'
};

const statusSteps: OrderStatus[] = [
  'pending',
  'going_to_restaurant',
  'picked_up',
  'delivering',
  'delivered'
];

export const OrderCard: React.FC<Props> = ({ order, onChangeStatus }) => {
  const [elapsed, setElapsed] = useState<number>(() => {
    return Math.floor((Date.now() - order.createdAt) / 1000);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - order.createdAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const currentIndex = statusSteps.indexOf(order.status);
  const canAdvance = currentIndex < statusSteps.length - 1;
  const canGoBack = currentIndex > 0 && order.status !== 'delivered';

  const handleAdvance = () => {
    if (!canAdvance) return;
    onChangeStatus(statusSteps[currentIndex + 1]);
  };

  const handleBack = () => {
    if (!canGoBack) return;
    onChangeStatus(statusSteps[currentIndex - 1]);
  };

  return (
    <View
      style={{
        backgroundColor: '#020617',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1F2937'
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4
        }}
      >
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{order.shortId}</Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: '#020617'
          }}
        >
          <Text style={{ fontSize: 11, color: '#34D399', fontWeight: '500' }}>
            {statusLabel[order.status]}
          </Text>
        </View>
      </View>

      <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
        {order.restaurantName}
      </Text>
      <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
        {order.restaurantAddress}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 12
        }}
      >
        <MaterialCommunityIcons name="map-marker-outline" color="#FACC15" size={16} />
        <Text
          style={{
            color: '#D1D5DB',
            fontSize: 12,
            marginLeft: 4,
            flex: 1
          }}
        >
          {order.customerAddress}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12
        }}
      >
        <View>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Valor</Text>
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
            €{order.value.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        <View>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Distância</Text>
          <Text style={{ color: '#E5E7EB', fontSize: 16 }}>
            {order.distanceKm.toFixed(1)} km
          </Text>
        </View>
        <View>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>ETA</Text>
          <Text style={{ color: '#E5E7EB', fontSize: 16 }}>{order.etaMinutes} min</Text>
        </View>
        <View>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Cronômetro</Text>
          <Text style={{ color: '#34D399', fontWeight: '600', fontSize: 16 }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 16,
          columnGap: 8
        }}
      >
        <TouchableOpacity
          disabled={!canGoBack}
          onPress={handleBack}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: canGoBack ? '#6B7280' : '#1F2937',
            opacity: canGoBack ? 1 : 0.4,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: '#E5E7EB', fontSize: 14 }}>Voltar etapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!canAdvance}
          onPress={handleAdvance}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: canAdvance ? '#16A34A' : '#1F2937',
            opacity: canAdvance ? 1 : 0.4
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
            {order.status === 'delivered' ? 'Concluído' : 'Avançar estado'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


