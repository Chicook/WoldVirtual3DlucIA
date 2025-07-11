/**
 * @fileoverview Mock para archivos de imagen y assets
 * @version 1.0.0
 * @description Mock completo para testing de archivos de imagen, audio, video y otros assets
 */

// Mock para archivos de imagen
const imageMock = {
  // Formatos de imagen soportados
  formats: {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    ico: 'image/x-icon'
  },

  // Dimensiones mock para diferentes tipos de imagen
  dimensions: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    xlarge: { width: 1920, height: 1080 }
  },

  // Generar URL mock para imagen
  generateMockUrl: (format = 'png', size = 'medium') => {
    const dims = imageMock.dimensions[size] || imageMock.dimensions.medium;
    return `data:${imageMock.formats[format]};base64,mock-image-${dims.width}x${dims.height}`;
  },

  // Crear objeto File mock
  createMockFile: (name, format = 'png', size = 'medium') => {
    const dims = imageMock.dimensions[size] || imageMock.dimensions.medium;
    const mockData = `mock-image-data-${dims.width}x${dims.height}`;
    
    return new File([mockData], name, {
      type: imageMock.formats[format],
      lastModified: Date.now()
    });
  },

  // Crear objeto Blob mock
  createMockBlob: (format = 'png', size = 'medium') => {
    const dims = imageMock.dimensions[size] || imageMock.dimensions.medium;
    const mockData = `mock-blob-data-${dims.width}x${dims.height}`;
    
    return new Blob([mockData], {
      type: imageMock.formats[format]
    });
  },

  // Simular carga de imagen
  simulateImageLoad: (url, delay = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url,
          width: 800,
          height: 600,
          naturalWidth: 800,
          naturalHeight: 600,
          complete: true,
          src: url
        });
      }, delay);
    });
  },

  // Simular error de carga de imagen
  simulateImageError: (url, delay = 100) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Failed to load image: ${url}`));
      }, delay);
    });
  },

  // Validar formato de imagen
  validateFormat: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && imageMock.formats[extension];
  },

  // Obtener información de imagen mock
  getImageInfo: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const format = imageMock.formats[extension] || 'unknown';
    
    return {
      filename,
      extension,
      format,
      size: Math.floor(Math.random() * 1000000) + 10000, // 10KB - 1MB
      dimensions: imageMock.dimensions.medium,
      lastModified: Date.now()
    };
  }
};

// Mock para archivos de audio
const audioMock = {
  formats: {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4'
  },

  createMockAudioFile: (name, format = 'mp3', duration = 180) => {
    const mockData = `mock-audio-data-${duration}s`;
    
    return new File([mockData], name, {
      type: audioMock.formats[format],
      lastModified: Date.now()
    });
  },

  simulateAudioLoad: (url, delay = 200) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url,
          duration: 180,
          currentTime: 0,
          paused: true,
          ended: false,
          readyState: 4
        });
      }, delay);
    });
  }
};

// Mock para archivos de video
const videoMock = {
  formats: {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime'
  },

  createMockVideoFile: (name, format = 'mp4', duration = 300) => {
    const mockData = `mock-video-data-${duration}s`;
    
    return new File([mockData], name, {
      type: videoMock.formats[format],
      lastModified: Date.now()
    });
  },

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
          videoWidth: 1920,
          videoHeight: 1080
        });
      }, delay);
    });
  }
};

// Mock para archivos 3D
const model3DMock = {
  formats: {
    glb: 'model/gltf-binary',
    gltf: 'model/gltf+json',
    obj: 'model/obj',
    fbx: 'model/fbx',
    dae: 'model/collada+xml'
  },

  createMock3DFile: (name, format = 'glb') => {
    const mockData = `mock-3d-model-data-${format}`;
    
    return new File([mockData], name, {
      type: model3DMock.formats[format],
      lastModified: Date.now()
    });
  }
};

// Mock para archivos de documento
const documentMock = {
  formats: {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    json: 'application/json',
    xml: 'application/xml'
  },

  createMockDocument: (name, format = 'pdf') => {
    const mockData = `mock-document-data-${format}`;
    
    return new File([mockData], name, {
      type: documentMock.formats[format],
      lastModified: Date.now()
    });
  }
};

// Función principal de mock
const fileMock = (path) => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  // Determinar tipo de archivo basado en extensión
  if (imageMock.formats[extension]) {
    return imageMock.generateMockUrl(extension);
  }
  
  if (audioMock.formats[extension]) {
    return `mock-audio-url-${extension}`;
  }
  
  if (videoMock.formats[extension]) {
    return `mock-video-url-${extension}`;
  }
  
  if (model3DMock.formats[extension]) {
    return `mock-3d-model-url-${extension}`;
  }
  
  if (documentMock.formats[extension]) {
    return `mock-document-url-${extension}`;
  }
  
  // Default mock
  return `mock-file-url-${extension || 'unknown'}`;
};

// Exportar todos los mocks
fileMock.image = imageMock;
fileMock.audio = audioMock;
fileMock.video = videoMock;
fileMock.model3D = model3DMock;
fileMock.document = documentMock;

// Exportar función principal
module.exports = fileMock;
