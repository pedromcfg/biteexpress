import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'going_to_restaurant',
  'picked_up',
  'delivering',
  'delivered'
]);

/** Fragmento de pedido enviado nas cues (campos opcionais). */
export const orderPayloadSchema = z
  .object({
    id: z.string().optional(),
    shortId: z.string().optional(),
    restaurantName: z.string().optional(),
    restaurantAddress: z.string().optional(),
    customerAddress: z.string().optional(),
    value: z.number().optional(),
    etaMinutes: z.number().optional(),
    distanceKm: z.number().optional(),
    status: orderStatusSchema.optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional()
  })
  .strict();

export const mapStageSchema = z.enum(['idle', 'pickup', 'delivering', 'lost']);

/**
 * Notificação / cue na fila (servidor → app).
 * `.passthrough()` mantém chaves extra para evolução sem partir o cliente.
 */
export const externalNotificationSchema = z
  .object({
    id: z.string(),
    timestamp: z.number(),
    message: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    ctaLabel: z.string().optional(),
    secondaryCtaLabel: z.string().optional(),
    requiresAcknowledgement: z.boolean().optional(),
    choiceType: z.enum(['none', 'continue_shift']).optional(),
    performanceBars: z.number().optional(),
    maxBars: z.number().optional(),
    /** Vida 0–100 para a barra de jogo no HUD do condutor. */
    health: z.number().min(0).max(100).optional(),
    countdownMinutes: z.number().optional(),
    countdownRemainingSeconds: z.number().nullable().optional(),
    highlightEmoji: z.boolean().optional(),
    voiceTone: z.enum(['robotic', 'urgent']).optional(),
    /** Som a tocar na app ao receber a cue. */
    soundKey: z.enum(['coins', 'up', 'down']).optional(),
    /** Overlay especial no modal. */
    showBadge: z.enum(['new_record', 'bonus_2x']).optional(),
    /** Vibrar o telemóvel ao receber a cue. */
    vibrate: z.boolean().optional(),
    /** Texto estilo GPS no HUD (não bloqueia o mapa). */
    gpsInstruction: z.string().optional(),
    /** Texto GPS a "falhar" / glitch. */
    gpsGlitch: z.boolean().optional(),
    /** Só actualiza HUD — não abre modal. */
    hudOnly: z.boolean().optional(),
    /** Mostra botão Contactar Cliente no HUD. */
    showContactClient: z.boolean().optional(),
    cueKey: z.string().optional(),
    resetScriptState: z.boolean().optional(),
    clearOrders: z.boolean().optional(),
    mapStage: mapStageSchema.optional(),
    orderPayload: orderPayloadSchema.optional()
  })
  .passthrough();

export const notificationsResponseSchema = z.object({
  notifications: z.array(externalNotificationSchema)
});

/** Corpo do POST /notifications (painel, app geofence, ou API). */
export const postNotificationBodySchema = z
  .object({
    message: z.string().optional(),
    messageIndex: z.number().int().min(0).optional(),
    cueKey: z.string().optional(),
    /** Origem do disparo — geofence usa dedupe por sessão no servidor. */
    source: z.enum(['manual', 'geofence']).optional(),
    /** Id do geofence (obrigatório quando source=geofence). */
    geofenceId: z.string().min(1).optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasMessage = data.message !== undefined && data.message !== '';
    const hasIndex = data.messageIndex !== undefined;
    const hasCue = data.cueKey !== undefined && data.cueKey !== '';
    if (!hasMessage && !hasIndex && !hasCue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indique message, messageIndex ou cueKey'
      });
    }
    if (data.source === 'geofence' && !data.geofenceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'geofenceId é obrigatório quando source=geofence',
        path: ['geofenceId']
      });
    }
  });

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;
export type ExternalNotification = z.infer<typeof externalNotificationSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type PostNotificationBody = z.infer<typeof postNotificationBodySchema>;
