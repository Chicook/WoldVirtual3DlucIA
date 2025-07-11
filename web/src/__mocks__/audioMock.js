/**
 * @fileoverview Mock para archivos de audio
 * @version 1.0.0
 * @description Mock completo para testing de archivos de audio y funcionalidades de audio
 */

// Mock para archivos de audio
const audioMock = {
  // Formatos de audio soportados
  formats: {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    wma: 'audio/x-ms-wma',
    aiff: 'audio/aiff'
  },

  // Configuraciones de calidad de audio
  qualities: {
    low: { bitrate: 128, sampleRate: 22050, channels: 1 },
    medium: { bitrate: 256, sampleRate: 44100, channels: 2 },
    high: { bitrate: 320, sampleRate: 48000, channels: 2 },
    lossless: { bitrate: 1411, sampleRate: 96000, channels: 2 }
  },

  // Crear archivo de audio mock
  createMockAudioFile: (name, format = 'mp3', duration = 180, quality = 'medium') => {
    const config = audioMock.qualities[quality] || audioMock.qualities.medium;
    const mockData = `mock-audio-data-${format}-${duration}s-${config.bitrate}kbps`;
    
    return new File([mockData], name, {
      type: audioMock.formats[format],
      lastModified: Date.now()
    });
  },

  // Simular carga de audio
  simulateAudioLoad: (url, delay = 200) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url,
          duration: 180,
          currentTime: 0,
          paused: true,
          ended: false,
          readyState: 4,
          volume: 1.0,
          muted: false,
          playbackRate: 1.0,
          src: url
        });
      }, delay);
    });
  },

  // Simular error de carga de audio
  simulateAudioError: (url, delay = 200) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Failed to load audio: ${url}`));
      }, delay);
    });
  },

  // Crear elemento de audio mock
  createMockAudioElement: (url) => {
    const audio = {
      url,
      duration: 180,
      currentTime: 0,
      paused: true,
      ended: false,
      readyState: 4,
      volume: 1.0,
      muted: false,
      playbackRate: 1.0,
      src: url,
      
      // Métodos de control
      play: jest.fn().mockResolvedValue(),
      pause: jest.fn(),
      load: jest.fn(),
      canPlayType: jest.fn().mockReturnValue('probably'),
      
      // Eventos
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
    
    return audio;
  },

  // Simular Web Audio API
  createMockAudioContext: () => {
    return {
      sampleRate: 44100,
      currentTime: 0,
      state: 'running',
      
      // Métodos
      createOscillator: jest.fn().mockReturnValue({
        frequency: { value: 440 },
        type: 'sine',
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn()
      }),
      
      createGain: jest.fn().mockReturnValue({
        gain: { value: 1.0 },
        connect: jest.fn()
      }),
      
      createAnalyser: jest.fn().mockReturnValue({
        connect: jest.fn(),
        getByteFrequencyData: jest.fn(),
        getByteTimeDomainData: jest.fn()
      }),
      
      createMediaElementSource: jest.fn().mockReturnValue({
        connect: jest.fn()
      }),
      
      // Eventos
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  },

  // Validar formato de audio
  validateFormat: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && audioMock.formats[extension];
  },

  // Obtener información de audio mock
  getAudioInfo: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const format = audioMock.formats[extension] || 'unknown';
    
    return {
      filename,
      extension,
      format,
      duration: Math.floor(Math.random() * 600) + 60, // 1-10 minutos
      bitrate: Math.floor(Math.random() * 320) + 128, // 128-448 kbps
      sampleRate: [22050, 44100, 48000][Math.floor(Math.random() * 3)],
      channels: Math.floor(Math.random() * 2) + 1,
      size: Math.floor(Math.random() * 50000000) + 1000000, // 1MB - 50MB
      lastModified: Date.now()
    };
  },

  // Simular análisis de frecuencia
  simulateFrequencyAnalysis: (audioElement) => {
    const frequencies = new Uint8Array(256);
    for (let i = 0; i < frequencies.length; i++) {
      frequencies[i] = Math.floor(Math.random() * 255);
    }
    
    return frequencies;
  },

  // Simular análisis de dominio temporal
  simulateTimeDomainAnalysis: (audioElement) => {
    const timeData = new Uint8Array(256);
    for (let i = 0; i < timeData.length; i++) {
      timeData[i] = Math.floor(Math.random() * 255);
    }
    
    return timeData;
  },

  // Crear playlist mock
  createMockPlaylist: (count = 10) => {
    const playlist = [];
    const formats = Object.keys(audioMock.formats);
    
    for (let i = 0; i < count; i++) {
      const format = formats[Math.floor(Math.random() * formats.length)];
      const duration = Math.floor(Math.random() * 600) + 60;
      
      playlist.push({
        id: `track-${i + 1}`,
        title: `Mock Track ${i + 1}`,
        artist: `Mock Artist ${i + 1}`,
        album: `Mock Album ${i + 1}`,
        duration,
        format,
        url: `mock-audio-url-${format}-${duration}s`,
        cover: `mock-cover-${i + 1}.jpg`
      });
    }
    
    return playlist;
  },

  // Simular streaming de audio
  simulateAudioStream: (url, onData) => {
    let position = 0;
    const chunkSize = 1024;
    const totalSize = 1000000; // 1MB
    
    const stream = setInterval(() => {
      if (position >= totalSize) {
        clearInterval(stream);
        onData(null, { complete: true });
        return;
      }
      
      const chunk = new Uint8Array(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        chunk[i] = Math.floor(Math.random() * 255);
      }
      
      position += chunkSize;
      onData(chunk, { 
        position, 
        totalSize, 
        progress: (position / totalSize) * 100 
      });
    }, 100);
    
    return stream;
  }
};

// Función principal de mock
const audioFileMock = (path) => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  if (audioMock.formats[extension]) {
    return `mock-audio-url-${extension}`;
  }
  
  return `mock-file-url-${extension || 'unknown'}`;
};

// Exportar mock
audioFileMock.mock = audioMock;
module.exports = audioFileMock; 