import { z } from 'zod';

export const geofenceSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().positive().max(5000),
    cueKey: z.string().min(1),
    enabled: z.boolean()
  })
  .strict();

/** Corpo do POST /geofences (painel). */
export const postGeofenceBodySchema = z
  .object({
    label: z.string().min(1).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().positive().max(5000).default(80),
    cueKey: z.string().min(1),
    enabled: z.boolean().optional()
  })
  .strict();

export const geofencesResponseSchema = z.object({
  geofences: z.array(geofenceSchema)
});

export type Geofence = z.infer<typeof geofenceSchema>;
export type PostGeofenceBody = z.infer<typeof postGeofenceBodySchema>;
export type GeofencesResponse = z.infer<typeof geofencesResponseSchema>;
