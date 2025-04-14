
import { createRoot } from 'react-dom/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from './App.tsx';
import './index.css';

// Call the element loader before the app renders
defineCustomElements(window);

// Set up viewport meta tag for proper mobile display with safe areas
const setViewportForMobile = () => {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.getElementsByTagName('head')[0].appendChild(meta);
};

const initialize = () => {
  setViewportForMobile();
  
  // Get the root element and ensure it exists before rendering
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }
  
  // Create root and render the app
  createRoot(rootElement).render(<App />);
};

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initialize();
});
