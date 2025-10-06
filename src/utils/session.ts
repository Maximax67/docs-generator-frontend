import { UAParser } from 'ua-parser-js';

export function getBrowserSessionName(userAgent?: string): string {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  let deviceType = 'Desktop';
  if (device.type === 'mobile') deviceType = 'Mobile';
  else if (device.type === 'tablet') deviceType = 'Tablet';

  const browserStr = [browser.name, browser.version?.split('.')[0]].filter(Boolean).join(' ');
  const osStr = [os.name, os.version?.split('.')[0]].filter(Boolean).join(' ');

  return [deviceType, browserStr, osStr].filter(Boolean).join(', ');
}
