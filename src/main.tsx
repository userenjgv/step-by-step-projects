
import { createRoot } from 'react-dom/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from './App.tsx';
import './index.css';

// Call the element loader before the app renders
defineCustomElements(window);

const initialize = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

// Wait for the device to be ready when in native environment
// This helps ensure plugins are ready and native app is initialized
document.addEventListener('DOMContentLoaded', () => {
  initialize();
});
