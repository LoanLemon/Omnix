import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { env } from "@huggingface/transformers";
import App from './App.tsx';
import './index.css';

// Suppress ONNX logs
(env as any).debug = false;
(env as any).logLevel = 'error';
if (env.backends?.onnx) {
  env.backends.onnx.logLevel = 'error';
}

createRoot(document.getElementById('root')!).render(
  <App />,
);
