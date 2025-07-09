import React, { useState, useRef } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';

interface AssetUploaderProps {
  userId?: string;
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

const AssetUploaderComponent = ({ userId }: AssetUploaderProps) => {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('models');
  const [assetName, setAssetName] = useState<string>('');
  const [assetDescription, setAssetDescription] = useState<string>('');
  const [assetTags, setAssetTags] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'models', name: 'Modelos 3D', icon: '🎨', extensions: ['.fbx', '.obj', '.gltf', '.blend'] },
    { id: 'textures', name: 'Texturas', icon: '🖼️', extensions: ['.png', '.jpg', '.jpeg', '.tga', '.hdr'] },
    { id: 'audio', name: 'Audio', icon: '🎵', extensions: ['.mp3', '.wav', '.ogg', '.flac'] },
    { id: 'animations', name: 'Animaciones', icon: '🎬', extensions: ['.fbx', '.bvh', '.anim'] },
    { id: 'scripts', name: 'Scripts', icon: '📜', extensions: ['.js', '.ts', '.py', '.lua'] }
  ];

  const availableTags = [
    '3D', 'Character', 'Environment', 'Vehicle', 'Weapon', 
    'Fantasy', 'Sci-Fi', 'Medieval', 'Modern', 'Low-Poly',
    'High-Quality', 'Free', 'Premium', 'Animated', 'Rigged'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newUploads: UploadProgress[] = Array.from(files).map(file => ({
      fileId: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);
    setIsUploading(true);

    // Simular proceso de subida
    newUploads.forEach(upload => {
      simulateUpload(upload.fileId);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      setUploadQueue(prev => prev.map(upload => 
        upload.fileId === fileId 
          ? { ...upload, progress: Math.min(progress, 100) }
          : upload
      ));

      if (progress >= 100) {
        clearInterval(interval);
        
        // Simular procesamiento
        setTimeout(() => {
          setUploadQueue(prev => prev.map(upload => 
            upload.fileId === fileId 
              ? { ...upload, status: 'processing' }
              : upload
          ));

          // Simular completado
          setTimeout(() => {
            setUploadQueue(prev => prev.map(upload => 
              upload.fileId === fileId 
                ? { ...upload, status: 'completed' }
                : upload
            ));
          }, 2000);
        }, 500);
      }
    }, 200);
  };

  const handleUpload = () => {
    if (!assetName.trim()) {
      alert('Por favor ingresa un nombre para el asset');
      return;
    }

    if (uploadQueue.length === 0) {
      alert('Por favor selecciona al menos un archivo');
      return;
    }

    // Simular envío de metadata
    const assetData = {
      name: assetName,
      description: assetDescription,
      category: selectedCategory,
      tags: assetTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      userId,
      files: uploadQueue.map(upload => ({
        fileName: upload.fileName,
        fileId: upload.fileId
      }))
    };

    console.log('Subiendo asset:', assetData);
    messageBus.publish('asset-upload', assetData);

    // Limpiar formulario
    setAssetName('');
    setAssetDescription('');
    setAssetTags('');
    setUploadQueue([]);
    setIsUploading(false);
  };

  const removeFromQueue = (fileId: string) => {
    setUploadQueue(prev => prev.filter(upload => upload.fileId !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return '📤';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'blue';
      case 'processing': return 'orange';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="asset-uploader-container">
      <div className="uploader-header">
        <h2>Subir Nuevo Asset</h2>
        <div className="uploader-info">
          <span>Usuario: {userId}</span>
          <span>Archivos en cola: {uploadQueue.length}</span>
        </div>
      </div>

      <div className="uploader-content">
        <div className="upload-form">
          <div className="form-section">
            <h3>Información del Asset</h3>
            
            <div className="form-group">
              <label htmlFor="assetName">Nombre del Asset *</label>
              <input
                id="assetName"
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Ej: Cyberpunk Character"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="assetDescription">Descripción</label>
              <textarea
                id="assetDescription"
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                placeholder="Describe tu asset..."
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="assetCategory">Categoría</label>
              <select
                id="assetCategory"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assetTags">Tags (separados por comas)</label>
              <input
                id="assetTags"
                type="text"
                value={assetTags}
                onChange={(e) => setAssetTags(e.target.value)}
                placeholder="Ej: 3D, Character, Sci-Fi"
                className="form-input"
              />
              <div className="available-tags">
                <small>Tags disponibles: {availableTags.join(', ')}</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Archivos</h3>
            
            {selectedCategoryInfo && (
              <div className="category-info">
                <p>
                  <strong>Formatos soportados:</strong> {selectedCategoryInfo.extensions.join(', ')}
                </p>
                <p>
                  <strong>Tamaño máximo:</strong> 100 MB por archivo
                </p>
              </div>
            )}

            <div className="file-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={selectedCategoryInfo?.extensions.join(',')}
                onChange={handleFileSelect}
                className="file-input"
              />
              <div className="upload-zone">
                <div className="upload-icon">📁</div>
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="upload-hint">
                  Formatos: {selectedCategoryInfo?.extensions.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="upload-queue">
          <h3>Cola de Subida</h3>
          
          {uploadQueue.length === 0 ? (
            <div className="empty-queue">
              <p>No hay archivos en la cola</p>
            </div>
          ) : (
            <div className="queue-items">
              {uploadQueue.map(upload => (
                <div key={upload.fileId} className="queue-item">
                  <div className="item-info">
                    <span className="status-icon">{getStatusIcon(upload.status)}</span>
                    <span className="file-name">{upload.fileName}</span>
                    <span 
                      className="status-text"
                      style={{ color: getStatusColor(upload.status) }}
                    >
                      {upload.status}
                    </span>
                  </div>
                  
                  <div className="item-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${upload.progress}%`,
                          backgroundColor: getStatusColor(upload.status)
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(upload.progress)}%</span>
                  </div>
                  
                  <button
                    onClick={() => removeFromQueue(upload.fileId)}
                    className="remove-btn"
                    disabled={upload.status === 'uploading'}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="uploader-footer">
        <div className="footer-actions">
          <button
            onClick={handleUpload}
            disabled={isUploading || uploadQueue.length === 0 || !assetName.trim()}
            className="btn-primary"
          >
            {isUploading ? 'Subiendo...' : 'Subir Asset'}
          </button>
          
          <button
            onClick={() => messageBus.publish('load-component', {
              componentName: 'AssetManager',
              props: { userId },
              targetId: 'dynamic-content'
            })}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
        
        <div className="footer-info">
          <span>Compresión automática: Activada</span>
          <span>Validación: En tiempo real</span>
          <span>Backup: Automático</span>
        </div>
      </div>
    </div>
  );
};

export default AssetUploaderComponent; 