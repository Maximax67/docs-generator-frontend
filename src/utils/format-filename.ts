export function formatFilename(filename: string, mimeType: string): string {
  if (mimeType === 'application/vnd.google-apps.document') {
    return filename;
  }

  const lastDot = filename.lastIndexOf('.');

  return lastDot === -1 ? filename : filename.slice(0, lastDot);
}
