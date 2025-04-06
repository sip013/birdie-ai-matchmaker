import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('main.tsx: Starting application');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

console.log('main.tsx: Found root element');

const root = createRoot(rootElement);
root.render(
  <App />
);

console.log('main.tsx: Application rendered');
