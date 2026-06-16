import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SAO_PAULO_COORDS, useAppState } from '@store/AppStateContext';
import { NotificationModal } from '@components/NotificationModal';

type Coordinate = {
  latitude: number;
  longitude: number;
};

const PICKUP_POINT: Coordinate = { latitude: 41.1525, longitude: -8.6205 };
const DELIVERY_POINT: Coordinate = { latitude: 41.159, longitude: -8.6345 };
const LOST_POINT: Coordinate = { latitude: 41.154, longitude: -8.628 };

export const MapScreen: React.FC = () => {
  const {
    online,
    toggleOnline,
    orders,
    externalNotification,
    clearExternalNotification,
    showEmoji,
    scriptHud,
    mapStage,
    handleExternalChoice
  } = useAppState();
  const [driverPosition, setDriverPosition] = useState<Coordinate | null>(null);
  const [region, setRegion] = useState<Region>({
    ...SAO_PAULO_COORDS,
    latitudeDelta: 0.06,
    longitudeDelta: 0.04
  });

  const mapRef = useRef<MapView | null>(null);

  // Pede permissão e centraliza no GPS real
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão de localização',
            'Para mostrar a tua posição no mapa, activa a localização nas permissões da aplicação.'
          );
          setDriverPosition(SAO_PAULO_COORDS);
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude
        };
        setDriverPosition(coords);
        const nextRegion: Region = {
          ...coords,
          latitudeDelta: 0.04,
          longitudeDelta: 0.03
        };
        setRegion(nextRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(nextRegion, 800);
        }
      } catch (error) {
        console.warn('Erro ao obter localização atual', error);
        setDriverPosition(SAO_PAULO_COORDS);
      }
    })();
  }, []);

  const formatCountdown = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const resolvePerformanceColor = (index: number) => {
    const palette = ['#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E'];
    return palette[index] || '#22C55E';
  };

  const queueCount = online ? orders.length : 0;
  const activeOrder = orders.find((o) => o.status !== 'delivered') ?? null;

  const routeStart = driverPosition ?? SAO_PAULO_COORDS;

  const routeCoordinates: Coordinate[] =
    mapStage === 'pickup'
      ? [routeStart, PICKUP_POINT]
      : mapStage === 'delivering'
        ? [routeStart, DELIVERY_POINT]
        : mapStage === 'lost'
          ? [routeStart, LOST_POINT, DELIVERY_POINT]
          : [];

  const stageLabel: Record<'idle' | 'pickup' | 'delivering' | 'lost', string> = {
    idle: 'A aguardar novo pedido',
    pickup: 'A caminho do restaurante',
    delivering: 'Entrega em curso',
    lost: 'Rota com problema'
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 40,
          paddingBottom: 14,
          backgroundColor: '#020617'
        }}
      >
        <View
          style={{
            backgroundColor: '#0B1220',
            borderWidth: 1,
            borderColor: '#1E293B',
            borderRadius: 20,
            padding: 16
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  height: 12,
                  width: 12,
                  borderRadius: 999,
                  marginRight: 10,
                  backgroundColor: online ? '#22C55E' : '#EF4444'
                }}
              />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>
                {online ? 'Modo Online' : 'Modo Offline'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={toggleOnline}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 999,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: online ? '#DC2626' : '#16A34A'
              }}
            >
              <MaterialCommunityIcons name="power" size={18} color="#fff" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: 8, fontSize: 14 }}>
                {online ? 'Ficar offline' : 'Ficar online'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12 }}>Área central do Porto</Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#111827',
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: '#1F2937'
              }}
            >
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Pedidos na fila</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 2 }}>
                {queueCount}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#111827',
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: '#1F2937'
              }}
            >
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Cronómetro</Text>
              <Text style={{ color: '#FDE68A', fontSize: 30, fontWeight: '800', marginTop: 2 }}>
                {formatCountdown(scriptHud.countdownRemainingSeconds)}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 12,
              backgroundColor: '#111827',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: '#1F2937'
            }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 8 }}>Desempenho</Text>
            <View style={{ flexDirection: 'row', columnGap: 8 }}>
              {Array.from({ length: scriptHud.maxBars }).map((_, index) => {
                const active = index < scriptHud.performanceBars;
                return (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 12,
                      borderRadius: 8,
                      backgroundColor: active ? resolvePerformanceColor(index) : '#374151'
                    }}
                  />
                );
              })}
            </View>
          </View>

          {online && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: '#111827',
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: '#1F2937'
              }}
            >
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Estado da entrega</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 2 }}>
                {stageLabel[mapStage]}
              </Text>
              {activeOrder ? (
                <Text style={{ color: '#CBD5E1', fontSize: 12, marginTop: 6 }}>
                  {activeOrder.shortId} • {activeOrder.restaurantName}
                </Text>
              ) : (
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 6 }}>
                  Sem pedido ativo no momento.
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {online ? (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          mapType="standard"
          showsUserLocation
          followsUserLocation
        >
          {driverPosition && (
            <Marker coordinate={driverPosition} title="Tu" description="A tua posição actual">
              <MaterialCommunityIcons name="car" size={32} color="#22C55E" />
            </Marker>
          )}

          {mapStage !== 'idle' && (
            <Marker coordinate={PICKUP_POINT} title="Restaurante" pinColor="#22C55E" />
          )}

          {(mapStage === 'delivering' || mapStage === 'lost') && (
            <Marker coordinate={DELIVERY_POINT} title="Cliente" pinColor="#FACC15" />
          )}

          {mapStage === 'lost' && (
            <Marker coordinate={LOST_POINT} title="Rota sem saída" pinColor="#EF4444" />
          )}

          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={6}
              strokeColor={mapStage === 'lost' ? '#EF4444' : '#3B82F6'}
            />
          )}
        </MapView>
      ) : (
        <View
          style={{
            flex: 1,
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: '#0B1220',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#1E293B',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <MaterialCommunityIcons name="map-outline" size={64} color="#64748B" />
          <Text style={{ color: '#E2E8F0', fontSize: 22, fontWeight: '700', marginTop: 14 }}>
            Mapa em espera
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 15, textAlign: 'center', marginTop: 8 }}>
            Clica em "Ficar online" para iniciar navegação e mostrar rota no ecrã.
          </Text>
        </View>
      )}

      {/* Modal de notificação */}
      <NotificationModal
        visible={externalNotification !== null}
        title={externalNotification?.title}
        message={externalNotification?.body || externalNotification?.message || ''}
        showEmoji={showEmoji}
        primaryLabel={externalNotification?.ctaLabel || 'Ok, entendido'}
        secondaryLabel={externalNotification?.secondaryCtaLabel}
        onPrimary={() => {
          if (externalNotification?.choiceType === 'continue_shift') {
            handleExternalChoice('primary');
            return;
          }
          clearExternalNotification();
        }}
        onSecondary={
          externalNotification?.choiceType === 'continue_shift'
            ? () => handleExternalChoice('secondary')
            : undefined
        }
      />
    </View>
  );
};

