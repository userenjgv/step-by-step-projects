
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.environomics.projectmanagement',
  appName: 'Environomics',
  webDir: 'dist',
  server: {
    url: 'https://2806da62-5fc8-48c7-9cf7-3b449e224058.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    webViewSettings: {
      allowsBackForwardNavigationGestures: true,
    }
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;
