import { z } from 'zod';
import { postNotificationBodySchema } from '@biteexpress/shared';

const messagesResponseSchema = z.object({
  messages: z.array(z.string())
});

const cuesResponseSchema = z.object({
  cues: z.record(z.string(), z.object({ body: z.string().optional() }).passthrough())
});

const discoverResponseSchema = z.object({
  ip: z.string(),
  url: z.string()
});

function parseResponse<T>(schema: z.ZodType<T>, data: unknown, endpoint: string): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Resposta inválida em ${endpoint}`);
  }
  return parsed.data;
}

export async function fetchMessages(baseUrl: string): Promise<string[]> {
  const res = await fetch(`${baseUrl}/messages`);
  if (!res.ok) throw new Error(`GET /messages ${res.status}`);
  return parseResponse(messagesResponseSchema, await res.json(), '/messages').messages;
}

export async function fetchCues(baseUrl: string): Promise<Record<string, { body?: string }>> {
  const res = await fetch(`${baseUrl}/cues`);
  if (!res.ok) throw new Error(`GET /cues ${res.status}`);
  return parseResponse(cuesResponseSchema, await res.json(), '/cues').cues;
}

export async function fetchDiscover(baseUrl: string): Promise<{ ip: string; url: string }> {
  const res = await fetch(`${baseUrl}/discover`);
  if (!res.ok) throw new Error(`GET /discover ${res.status}`);
  return parseResponse(discoverResponseSchema, await res.json(), '/discover');
}

export async function sendMessageIndex(baseUrl: string, messageIndex: number): Promise<void> {
  const body = postNotificationBodySchema.parse({ messageIndex });
  const res = await fetch(`${baseUrl}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST /notifications ${res.status}`);
}

export async function sendCue(baseUrl: string, cueKey: string): Promise<void> {
  const body = postNotificationBodySchema.parse({ cueKey });
  const res = await fetch(`${baseUrl}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST /notifications ${res.status}`);
}

export async function sendCustomMessage(baseUrl: string, message: string): Promise<void> {
  const body = postNotificationBodySchema.parse({ message });
  const res = await fetch(`${baseUrl}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST /notifications ${res.status}`);
}

export async function resetCues(baseUrl: string): Promise<void> {
  const res = await fetch(`${baseUrl}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`POST /reset ${res.status}`);
}
