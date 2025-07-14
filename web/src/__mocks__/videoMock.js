/**
 * @fileoverview Mock para archivos de video
 * @version 1.0.0
 * @description Mock completo para testing de archivos de video y funcionalidades de video
 */

// Mock para archivos de video
const videoMock = {
  // Formatos de video soportados
  formats: {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    flv: 'video/x-flv',
    wmv: 'video/x-ms-wmv'
  },

  // Configuraciones de calidad de video
  qualities: {
    low: { width: 640, height: 360, bitrate: 1000, fps: 24 },
    medium: { width: 1280, height: 720, bitrate: 2500, fps: 30 },
    high: { width: 1920, height: 1080, bitrate: 5000, fps: 60 },
    ultra: { width: 3840, height: 2160, bitrate: 15000, fps: 60 }
  },

  // Crear archivo de video mock
  createMockVideoFile: (name, format = 'mp4', duration = 300, quality = 'medium') => {
    const config = videoMock.qualities[quality] || videoMock.qualities.medium;
    const mockData = `mock-video-data-${format}-${duration}s-${config.width}x${config.height}`;
    
    return new File([mockData], name, {
      type: videoMock.formats[format],
      lastModified: Date.now()
    });
  },

  // Simular carga de video
  simulateVideoLoad: (url, delay = 300) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url,
          duration: 300,
          currentTime: 0,
          paused: true,
          ended: false,
          readyState: 4,
          volume: 1.0,
          muted: false,
          playbackRate: 1.0,
          videoWidth: 1920,
          videoHeight: 1080,
          src: url
        });
      }, delay);
    });
  },

  // Simular error de carga de video
  simulateVideoError: (url, delay = 300) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Failed to load video: ${url}`));
      }, delay);
    });
  },

  // Crear elemento de video mock
  createMockVideoElement: (url) => {
    const video = {
      url,
      duration: 300,
      currentTime: 0,
      paused: true,
      ended: false,
      readyState: 4,
      volume: 1.0,
      muted: false,
      playbackRate: 1.0,
      videoWidth: 1920,
      videoHeight: 1080,
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
    
    return video;
  },

  // Simular MediaRecorder API
  createMockMediaRecorder: (stream) => {
    return {
      stream,
      state: 'inactive',
      mimeType: 'video/webm',
      
      // Métodos
      start: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      requestData: jest.fn(),
      
      // Eventos
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  },

  // Simular getUserMedia API
  createMockMediaStream: () => {
    return {
      id: 'mock-stream-id',
      active: true,
      
      // Métodos
      getTracks: jest.fn(() => []),
      getVideoTracks: jest.fn(() => []),
      getAudioTracks: jest.fn(() => []),
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
      clone: jest.fn(),
      
      // Eventos
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  },

  // Validar formato de video
  validateFormat: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && videoMock.formats[extension];
  },

  // Obtener información de video mock
  getVideoInfo: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const format = videoMock.formats[extension] || 'unknown';
    
    return {
      filename,
      extension,
      format,
      duration: Math.floor(Math.random() * 3600) + 60, // 1-60 minutos
      width: [640, 1280, 1920, 3840][Math.floor(Math.random() * 4)],
      height: [360, 720, 1080, 2160][Math.floor(Math.random() * 4)],
      bitrate: Math.floor(Math.random() * 20000) + 1000, // 1-20 Mbps
      fps: [24, 30, 60][Math.floor(Math.random() * 3)],
      size: Math.floor(Math.random() * 1000000000) + 10000000, // 10MB - 1GB
      lastModified: Date.now()
    };
  },

  // Simular análisis de frames
  simulateFrameAnalysis: (videoElement) => {
    const frames = [];
    const frameCount = Math.floor(videoElement.duration * videoElement.fps);
    
    for (let i = 0; i < frameCount; i++) {
      frames.push({
        index: i,
        timestamp: i / videoElement.fps,
        data: new Uint8Array(Math.floor(Math.random() * 1000) + 100)
      });
    }
    
    return frames;
  },

  // Crear playlist de video mock
  createMockVideoPlaylist: (count = 10) => {
    const playlist = [];
    const formats = Object.keys(videoMock.formats);
    
    for (let i = 0; i < count; i++) {
      const format = formats[Math.floor(Math.random() * formats.length)];
      const duration = Math.floor(Math.random() * 3600) + 60;
      const quality = Object.keys(videoMock.qualities)[Math.floor(Math.random() * 4)];
      
      playlist.push({
        id: `video-${i + 1}`,
        title: `Mock Video ${i + 1}`,
        description: `Mock video description ${i + 1}`,
        duration,
        format,
        quality,
        url: `mock-video-url-${format}-${duration}s`,
        thumbnail: `mock-thumbnail-${i + 1}.jpg`,
        tags: [`tag${i + 1}`, `category${i + 1}`]
      });
    }
    
    return playlist;
  },

  // Simular streaming de video
  simulateVideoStream: (url, onData) => {
    let position = 0;
    const chunkSize = 4096;
    const totalSize = 50000000; // 50MB
    
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
    }, 50);
    
    return stream;
  },

  // Simular captura de pantalla
  simulateScreenshot: (videoElement, format = 'png') => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1920;
    canvas.height = videoElement.videoHeight || 1080;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Simular dibujo de frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simular texto de timestamp
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`Frame at ${videoElement.currentTime}s`, 10, 30);
    }
    
    return canvas.toDataURL(`image/${format}`);
  },

  // Simular codificación de video
  simulateVideoEncoding: (inputFile, outputFormat, quality) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const config = videoMock.qualities[quality] || videoMock.qualities.medium;
        const outputFile = new File(
          [`encoded-video-${outputFormat}-${config.width}x${config.height}`],
          `output.${outputFormat}`,
          { type: videoMock.formats[outputFormat] }
        );
        
        resolve({
          inputFile,
          outputFile,
          format: outputFormat,
          quality,
          duration: 300,
          size: Math.floor(Math.random() * 100000000) + 10000000
        });
      }, 2000);
    });
  }
};

// Función principal de mock
const videoFileMock = (path) => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  if (videoMock.formats[extension]) {
    return `mock-video-url-${extension}`;
  }
  
  return `mock-file-url-${extension || 'unknown'}`;
};

// Exportar mock
videoFileMock.mock = videoMock;
module.exports = videoFileMock; 