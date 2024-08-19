export const runtime = 'edge'

export function genUuid(): string {
  return crypto.randomUUID();
}

export function genUniSeq(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);

  return `${prefix}${randomPart}${timestamp}`;
}

export function getIsoTimestr(): string {
  return new Date().toISOString();
}