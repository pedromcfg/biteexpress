import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAppState } from '@store/AppStateContext';
import { OrderCard } from './OrderCard';
import { OrderStatus } from './types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const OrdersScreen: React.FC = () => {
  const { orders, updateOrderStatus, notifications, unreadCount, markAllNotificationsRead } =
    useAppState();

  const renderEmpty = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24
      }}
    >
      <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#4B5563" />
      <Text
        style={{
          color: '#D1D5DB',
          fontSize: 16,
          marginTop: 12,
          fontWeight: '600'
        }}
      >
        Nenhum pedido ativo
      </Text>
      <Text
        style={{
          color: '#6B7280',
          fontSize: 14,
          marginTop: 4,
          textAlign: 'center'
        }}
      >
        Quando novos pedidos forem atribuídos, eles aparecerão aqui com todos os detalhes da rota.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#020617', paddingTop: 40 }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>Os seus pedidos</Text>

        </View>
        <TouchableOpacity
          onPress={markAllNotificationsRead}
          style={{
            position: 'relative',
            padding: 8,
            borderRadius: 999,
            backgroundColor: '#020617',
            borderWidth: 1,
            borderColor: '#374151'
          }}
        >
          <MaterialCommunityIcons name="bell-outline" size={20} color="#E5E7EB" />
          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: '#EF4444',
                borderRadius: 999,
                height: 16,
                minWidth: 16,
                paddingHorizontal: 2,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {notifications.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>
            Últimas notificações
          </Text>
          <View
            style={{
              backgroundColor: '#020617',
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: '#1F2937'
            }}
          >
            {notifications.slice(0, 3).map((n) => (
              <View key={n.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      height: 6,
                      width: 6,
                      borderRadius: 999,
                      marginRight: 8,
                      backgroundColor: n.read ? '#6B7280' : '#34D399'
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#D1D5DB',
                      fontWeight: '500',
                      flex: 1
                    }}
                  >
                    {n.title}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{n.body}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onChangeStatus={(status: OrderStatus) => updateOrderStatus(item.id, status)}
          />
        )}
      />
    </View>
  );
};


