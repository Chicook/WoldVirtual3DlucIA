/**
 * @fileoverview Tipos para pruebas unitarias
 */

declare global {
  var beforeAll: (fn: () => void | Promise<void>) => void;
  var afterAll: (fn: () => void | Promise<void>) => void;
  var jest: any;
  var process: any;
  var console: any;
  var Buffer: any;
}

export {}; 