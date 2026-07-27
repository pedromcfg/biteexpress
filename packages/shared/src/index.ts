export {
  orderStatusSchema,
  orderPayloadSchema,
  mapStageSchema,
  externalNotificationSchema,
  notificationsResponseSchema,
  postNotificationBodySchema,
  type OrderStatus,
  type OrderPayload,
  type ExternalNotification,
  type NotificationsResponse,
  type PostNotificationBody
} from './schemas/notifications';

export {
  geofenceSchema,
  postGeofenceBodySchema,
  geofencesResponseSchema,
  type Geofence,
  type PostGeofenceBody,
  type GeofencesResponse
} from './schemas/geofences';

export { SOCKET_NOTIFICATION_EVENT, SOCKET_GEOFENCES_UPDATED_EVENT } from './socket';
