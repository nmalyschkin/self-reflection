export function formatTimestampForFilename(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
  return `${prefix}-${timestamp}Z.json`;
}
