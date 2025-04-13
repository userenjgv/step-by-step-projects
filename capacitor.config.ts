
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2806da625fc848c79cf73b449e224058',
  appName: 'Project Management',
  webDir: 'dist',
  server: {
    url: 'https://2806da62-5fc8-48c7-9cf7-3b449e224058.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
