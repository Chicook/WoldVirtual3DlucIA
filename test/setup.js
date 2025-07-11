/**
 * Jest Setup - WoldVirtual3DlucIA v0.6.0
 * Configuración global para testing
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configurar Testing Library
configure({ testIdAttribute: 'data-testid' });

// Mock de WebGL
class WebGLRenderingContext {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.drawingBufferWidth = 800;
    this.drawingBufferHeight = 600;
  }
  
  getExtension() { return null; }
  getParameter() { return 0; }
  createBuffer() { return {}; }
  createTexture() { return {}; }
  createProgram() { return {}; }
  createShader() { return {}; }
  clear() {}
  drawArrays() {}
  drawElements() {}
  enable() {}
  disable() {}
  viewport() {}
  clearColor() {}
  clearDepth() {}
  bindBuffer() {}
  bufferData() {}
  bindTexture() {}
  texImage2D() {}
  texParameteri() {}
  useProgram() {}
  getAttribLocation() { return 0; }
  getUniformLocation() { return {}; }
  vertexAttribPointer() {}
  enableVertexAttribArray() {}
  uniformMatrix4fv() {}
  uniform1i() {}
  uniform1f() {}
  uniform3f() {}
  uniform4f() {}
  shaderSource() {}
  compileShader() {}
  attachShader() {}
  linkProgram() {}
  getProgramParameter() { return 1; }
  getShaderParameter() { return 1; }
  getError() { return 0; }
}

// Mock de WebGL2
class WebGL2RenderingContext extends WebGLRenderingContext {
  constructor() {
    super();
  }
  
  createVertexArray() { return {}; }
  bindVertexArray() {}
  drawArraysInstanced() {}
  drawElementsInstanced() {}
  vertexAttribDivisor() {}
  uniformBlockBinding() {}
  getUniformBlockIndex() { return 0; }
  getActiveUniformBlockParameter() { return 0; }
  getActiveUniformBlockName() { return ''; }
  getUniformIndices() { return [0]; }
  getActiveUniforms() { return [0]; }
  uniformMatrix3x2fv() {}
  uniformMatrix4x3fv() {}
  uniformMatrix2x3fv() {}
  uniformMatrix2x4fv() {}
  uniformMatrix3x4fv() {}
  uniformMatrix4x2fv() {}
  uniform1ui() {}
  uniform2ui() {}
  uniform3ui() {}
  uniform4ui() {}
  uniform1uiv() {}
  uniform2uiv() {}
  uniform3uiv() {}
  uniform4uiv() {}
  uniformMatrix2fv() {}
  uniformMatrix3fv() {}
  uniformMatrix4fv() {}
  uniform1f() {}
  uniform2f() {}
  uniform3f() {}
  uniform4f() {}
  uniform1fv() {}
  uniform2fv() {}
  uniform3fv() {}
  uniform4fv() {}
  uniform1i() {}
  uniform2i() {}
  uniform3i() {}
  uniform4i() {}
  uniform1iv() {}
  uniform2iv() {}
  uniform3iv() {}
  uniform4iv() {}
}

// Mock de WebGLRenderingContext
global.WebGLRenderingContext = WebGLRenderingContext;
global.WebGL2RenderingContext = WebGL2RenderingContext;

// Mock de getContext
HTMLCanvasElement.prototype.getContext = function(type) {
  if (type === 'webgl' || type === 'experimental-webgl') {
    return new WebGLRenderingContext();
  }
  if (type === 'webgl2') {
    return new WebGL2RenderingContext();
  }
  return null;
};

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock de MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
};

// Mock de Performance API
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByType: () => [],
  getEntriesByName: () => [],
  clearMarks: () => {},
  clearMeasures: () => {},
  clearResourceTimings: () => {},
  setResourceTimingBufferSize: () => {},
  getEntries: () => [],
  toJSON: () => ({})
};

// Mock de requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

// Mock de cancelAnimationFrame
global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock de fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    status: 200,
    statusText: 'OK'
  })
);

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.sessionStorage = sessionStorageMock;

// Mock de WebSocket
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.bufferedAmount = 0;
    this.protocol = '';
    this.extensions = '';
  }
  
  send(data) {}
  close(code, reason) {}
  addEventListener(type, listener) {}
  removeEventListener(type, listener) {}
  dispatchEvent(event) { return true; }
};

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

// Mock de AudioContext
global.AudioContext = class AudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.destination = {};
  }
  
  createOscillator() { return {}; }
  createGain() { return {}; }
  createAnalyser() { return {}; }
  createBiquadFilter() { return {}; }
  createDelay() { return {}; }
  createConvolver() { return {}; }
  createDynamicsCompressor() { return {}; }
  createMediaElementSource() { return {}; }
  createMediaStreamSource() { return {}; }
  createMediaStreamDestination() { return {}; }
  createScriptProcessor() { return {}; }
  createStereoPanner() { return {}; }
  createWaveShaper() { return {}; }
  createPanner() { return {}; }
  createPeriodicWave() { return {}; }
  createChannelSplitter() { return {}; }
  createChannelMerger() { return {}; }
  createIIRFilter() { return {}; }
  createWorklet() { return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve({}); }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
};

// Mock de MediaDevices
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({})),
  getDisplayMedia: jest.fn(() => Promise.resolve({})),
  enumerateDevices: jest.fn(() => Promise.resolve([])),
  getSupportedConstraints: jest.fn(() => ({})),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Mock de Geolocation
global.navigator.geolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Mock de Permissions
global.navigator.permissions = {
  query: jest.fn(() => Promise.resolve({ state: 'granted' }))
};

// Mock de ServiceWorker
global.ServiceWorker = class ServiceWorker {
  constructor() {
    this.state = 'activated';
    this.scriptURL = '';
  }
  
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
};

global.ServiceWorkerRegistration = class ServiceWorkerRegistration {
  constructor() {
    this.scope = '';
    this.updateViaCache = 'all';
    this.waiting = null;
    this.installing = null;
    this.active = null;
  }
  
  update() { return Promise.resolve(); }
  unregister() { return Promise.resolve(true); }
  showNotification() { return Promise.resolve(); }
  getNotifications() { return Promise.resolve([]); }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
};

// Mock de Notification
global.Notification = class Notification {
  constructor(title, options = {}) {
    this.title = title;
    this.options = options;
    this.tag = options.tag || '';
    this.body = options.body || '';
    this.icon = options.icon || '';
    this.badge = options.badge || '';
    this.image = options.image || '';
    this.data = options.data || null;
    this.actions = options.actions || [];
    this.requireInteraction = options.requireInteraction || false;
    this.silent = options.silent || false;
    this.timestamp = options.timestamp || Date.now();
  }
  
  static requestPermission() { return Promise.resolve('granted'); }
  static permission = 'granted';
  
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
};

// Mock de Crypto API
global.crypto = {
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    generateKey: jest.fn(() => Promise.resolve({})),
    importKey: jest.fn(() => Promise.resolve({})),
    exportKey: jest.fn(() => Promise.resolve({})),
    sign: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    verify: jest.fn(() => Promise.resolve(true)),
    encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    digest: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    deriveBits: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    deriveKey: jest.fn(() => Promise.resolve({})),
    wrapKey: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    unwrapKey: jest.fn(() => Promise.resolve({}))
  }
};

// Mock de TextEncoder/TextDecoder
global.TextEncoder = class TextEncoder {
  encode(string) {
    return new Uint8Array(Buffer.from(string, 'utf8'));
  }
  
  encodeInto(string, dest) {
    const encoded = this.encode(string);
    dest.set(encoded);
    return { read: encoded.length, written: encoded.length };
  }
};

global.TextDecoder = class TextDecoder {
  constructor(encoding = 'utf-8') {
    this.encoding = encoding;
  }
  
  decode(input) {
    if (input instanceof ArrayBuffer) {
      return Buffer.from(input).toString(this.encoding);
    }
    if (input instanceof Uint8Array) {
      return Buffer.from(input).toString(this.encoding);
    }
    return '';
  }
};

// Mock de URL API
global.URL = class URL {
  constructor(url, base) {
    this.href = url;
    this.protocol = 'https:';
    this.host = 'example.com';
    this.hostname = 'example.com';
    this.port = '';
    this.pathname = '/';
    this.search = '';
    this.searchParams = new URLSearchParams();
    this.hash = '';
    this.origin = 'https://example.com';
  }
  
  static createObjectURL(object) {
    return 'blob:mock-url';
  }
  
  static revokeObjectURL(url) {}
};

global.URLSearchParams = class URLSearchParams {
  constructor(init) {
    this.params = new Map();
    if (init) {
      if (typeof init === 'string') {
        init.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          this.append(key, value);
        });
      }
    }
  }
  
  append(name, value) {
    this.params.set(name, value);
  }
  
  delete(name) {
    this.params.delete(name);
  }
  
  get(name) {
    return this.params.get(name) || null;
  }
  
  getAll(name) {
    return [this.params.get(name)].filter(Boolean);
  }
  
  has(name) {
    return this.params.has(name);
  }
  
  set(name, value) {
    this.params.set(name, value);
  }
  
  toString() {
    return Array.from(this.params.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }
  
  forEach(callback) {
    this.params.forEach((value, key) => callback(value, key, this));
  }
  
  keys() {
    return this.params.keys();
  }
  
  values() {
    return this.params.values();
  }
  
  entries() {
    return this.params.entries();
  }
};

// Mock de Headers
global.Headers = class Headers {
  constructor(init) {
    this.headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.append(key, value);
      });
    }
  }
  
  append(name, value) {
    this.headers.set(name.toLowerCase(), value);
  }
  
  delete(name) {
    this.headers.delete(name.toLowerCase());
  }
  
  get(name) {
    return this.headers.get(name.toLowerCase()) || null;
  }
  
  has(name) {
    return this.headers.has(name.toLowerCase());
  }
  
  set(name, value) {
    this.headers.set(name.toLowerCase(), value);
  }
  
  forEach(callback) {
    this.headers.forEach((value, key) => callback(value, key, this));
  }
  
  entries() {
    return this.headers.entries();
  }
  
  keys() {
    return this.headers.keys();
  }
  
  values() {
    return this.headers.values();
  }
};

// Mock de Request
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = new Headers(init.headers);
    this.body = init.body || null;
    this.mode = init.mode || 'cors';
    this.credentials = init.credentials || 'same-origin';
    this.cache = init.cache || 'default';
    this.redirect = init.redirect || 'follow';
    this.referrer = init.referrer || 'about:client';
    this.integrity = init.integrity || '';
  }
  
  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      mode: this.mode,
      credentials: this.credentials,
      cache: this.cache,
      redirect: this.redirect,
      referrer: this.referrer,
      integrity: this.integrity
    });
  }
};

// Mock de Response
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Headers(init.headers);
    this.ok = this.status >= 200 && this.status < 300;
    this.redirected = false;
    this.type = 'default';
    this.url = '';
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }
  
  text() {
    return Promise.resolve(this.body || '');
  }
  
  blob() {
    return Promise.resolve(new Blob([this.body || '']));
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
  
  formData() {
    return Promise.resolve(new FormData());
  }
  
  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    });
  }
};

// Mock de FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }
  
  append(name, value, filename) {
    this.data.set(name, { value, filename });
  }
  
  delete(name) {
    this.data.delete(name);
  }
  
  get(name) {
    const item = this.data.get(name);
    return item ? item.value : null;
  }
  
  getAll(name) {
    const items = Array.from(this.data.entries())
      .filter(([key]) => key === name)
      .map(([, item]) => item.value);
    return items;
  }
  
  has(name) {
    return this.data.has(name);
  }
  
  set(name, value, filename) {
    this.data.set(name, { value, filename });
  }
  
  forEach(callback) {
    this.data.forEach((item, key) => callback(item.value, key, this));
  }
  
  entries() {
    return Array.from(this.data.entries()).map(([key, item]) => [key, item.value]);
  }
  
  keys() {
    return this.data.keys();
  }
  
  values() {
    return Array.from(this.data.values()).map(item => item.value);
  }
};

// Mock de File
global.File = class File {
  constructor(bits, name, options = {}) {
    this.name = name;
    this.size = bits.length;
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }
  
  slice(start, end, contentType) {
    return new Blob([], { type: contentType });
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
  
  stream() {
    return new ReadableStream();
  }
  
  text() {
    return Promise.resolve('');
  }
};

// Mock de FileReader
global.FileReader = class FileReader {
  constructor() {
    this.readyState = FileReader.EMPTY;
    this.result = null;
    this.error = null;
    this.onload = null;
    this.onerror = null;
    this.onprogress = null;
    this.onloadstart = null;
    this.onloadend = null;
    this.onabort = null;
  }
  
  readAsArrayBuffer(blob) {
    this.readyState = FileReader.LOADING;
    setTimeout(() => {
      this.readyState = FileReader.DONE;
      this.result = new ArrayBuffer(0);
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
  
  readAsBinaryString(blob) {
    this.readyState = FileReader.LOADING;
    setTimeout(() => {
      this.readyState = FileReader.DONE;
      this.result = '';
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
  
  readAsDataURL(blob) {
    this.readyState = FileReader.LOADING;
    setTimeout(() => {
      this.readyState = FileReader.DONE;
      this.result = 'data:text/plain;base64,';
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
  
  readAsText(blob, encoding) {
    this.readyState = FileReader.LOADING;
    setTimeout(() => {
      this.readyState = FileReader.DONE;
      this.result = '';
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
  
  abort() {
    this.readyState = FileReader.DONE;
    if (this.onabort) this.onabort({ target: this });
  }
};

FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

// Mock de ReadableStream
global.ReadableStream = class ReadableStream {
  constructor(source) {
    this.source = source;
    this.locked = false;
  }
  
  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {},
      cancel: () => Promise.resolve()
    };
  }
  
  cancel() {
    return Promise.resolve();
  }
  
  get locked() {
    return this.locked;
  }
  
  tee() {
    return [new ReadableStream(), new ReadableStream()];
  }
};

// Mock de WritableStream
global.WritableStream = class WritableStream {
  constructor(sink) {
    this.sink = sink;
    this.locked = false;
  }
  
  getWriter() {
    return {
      write: (chunk) => Promise.resolve(),
      close: () => Promise.resolve(),
      abort: (reason) => Promise.resolve(),
      releaseLock: () => {}
    };
  }
  
  close() {
    return Promise.resolve();
  }
  
  abort(reason) {
    return Promise.resolve();
  }
  
  get locked() {
    return this.locked;
  }
};

// Mock de TransformStream
global.TransformStream = class TransformStream {
  constructor(transformer) {
    this.transformer = transformer;
    this.readable = new ReadableStream();
    this.writable = new WritableStream();
  }
};

// Mock de console para testing
const originalConsole = { ...console };

beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
  
  // Resetear console
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  // Restaurar console después de cada test
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

// Configuración global para tests
global.testUtils = {
  // Utilidad para esperar que algo sea verdadero
  waitFor: (condition, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      };
      
      check();
    });
  },
  
  // Utilidad para mockear módulos
  mockModule: (modulePath, mockExports) => {
    jest.doMock(modulePath, () => mockExports);
  },
  
  // Utilidad para crear datos de prueba
  createTestData: (type, overrides = {}) => {
    const baseData = {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg'
      },
      project: {
        id: 'test-project-id',
        name: 'Test Project',
        description: 'A test project',
        version: '1.0.0'
      },
      scene: {
        id: 'test-scene-id',
        name: 'Test Scene',
        objects: [],
        camera: { position: [0, 0, 5], target: [0, 0, 0] }
      }
    };
    
    return { ...baseData[type], ...overrides };
  }
};

console.log('🧪 Jest setup completado para WoldVirtual3DlucIA'); 