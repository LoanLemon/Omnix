import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { env } from "@huggingface/transformers";
import App from './App.tsx';
// @ts-ignore
import './index.css';

// WebGPU shader-int64 patch for stable execution in headless/worker Chromium contexts (like Electron).
// In Electron, GPU capabilities (such as 64-bit integer indexing shader-int64) are often reported
// as supported by the card/driver, but compiling them in Tint/WGSL fails inside background renderers.
// This results in validation errors like '[Invalid ComputePipeline "Gather"]' and scrambled text.
// Intercepting navigator.gpu to hide 'shader-int64' safely triggers the high-performance 32-bit Integer fallback.
if (typeof globalThis !== 'undefined' && globalThis.navigator && globalThis.navigator.gpu) {
  try {
    const originalRequestAdapter = globalThis.navigator.gpu.requestAdapter;
    if (typeof originalRequestAdapter === 'function') {
      globalThis.navigator.gpu.requestAdapter = async function (options?: any) {
        const adapter = await originalRequestAdapter.call(globalThis.navigator.gpu, options);
        if (adapter) {
          // Intercept requestDevice to drop 'shader-int64'
          const originalRequestDevice = adapter.requestDevice;
          if (typeof originalRequestDevice === 'function') {
            adapter.requestDevice = async function (deviceDescriptor?: any) {
              if (deviceDescriptor && deviceDescriptor.requiredFeatures) {
                if (Array.isArray(deviceDescriptor.requiredFeatures)) {
                  deviceDescriptor.requiredFeatures = deviceDescriptor.requiredFeatures.filter(
                    (f: any) => f !== 'shader-int64'
                  );
                }
              }
              const device = await originalRequestDevice.call(adapter, deviceDescriptor);
              if (device) {
                if (device.features && typeof device.features.has === 'function') {
                  const originalHas = device.features.has;
                  device.features.has = function (feature: string) {
                    if (feature === 'shader-int64') return false;
                    return originalHas.call(device.features, feature);
                  };
                }
              }
              return device;
            };
          }
          // Hide from Adapter features too
          if (adapter.features && typeof adapter.features.has === 'function') {
            const originalAdapterHas = adapter.features.has;
            adapter.features.has = function (feature: string) {
              if (feature === 'shader-int64') return false;
              return originalAdapterHas.call(adapter.features, feature);
            };
          }
        }
        return adapter;
      };
    }
  } catch (e) {
    console.warn("Failed to apply WebGPU shader patch in main thread:", e);
  }
}

// Suppress ONNX logs
(env as any).debug = false;
(env as any).logLevel = 'error';
if (env.backends?.onnx) {
  env.backends.onnx.logLevel = 'error';
}

createRoot(document.getElementById('root')!).render(
  <App />,
);
