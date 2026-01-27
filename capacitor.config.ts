import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.justagram.app',
  appName: 'JustAgram',
  webDir: 'www',
  plugins: {
    InAppBrowser: {
      allowedSchemes: ['http', 'https'],
      beforeload: 'yes'
    }
  }
};

export default config;
