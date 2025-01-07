if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = { env: {} };
}

import { Buffer as BufferPolyfill } from 'buffer';
if (typeof Buffer === 'undefined') {
  window.Buffer = BufferPolyfill;
} 