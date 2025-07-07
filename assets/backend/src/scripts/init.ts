/**
 * @fileoverview Script de inicialización para el backend del metaverso
 * @module backend/src/scripts/init
 */

import { databaseService } from '../config/database';
import { emailService } from '../utils/email';
import User from '../models/user';
import Asset from '../models/asset';

/**
 * Script de inicialización del backend
 */
export class InitScript {
  /**
   * Ejecutar inicialización completa
   */
  async run(): Promise<void> {
    console.log('🚀 Iniciando backend del Metaverso...\n');

    try {
      // 1. Conectar a la base de datos
      await this.connectDatabase();

      // 2. Verificar configuración de email
      await this.verifyEmailConfig();

      // 3. Crear usuario administrador
      await this.createAdminUser();

      // 4. Crear datos de ejemplo
      await this.createSampleData();

      // 5. Verificar integridad
      await this.verifyIntegrity();

      console.log('\n✅ Inicialización completada exitosamente!');
      console.log('🎉 El backend está listo para usar.');

    } catch (error) {
      console.error('\n❌ Error durante la inicialización:', error);
      process.exit(1);
    }
  }

  /**
   * Conectar a la base de datos
   */
  private async connectDatabase(): Promise<void> {
    console.log('1️⃣ Conectando a la base de datos...');
    
    await databaseService.connect();
    
    const status = databaseService.getConnectionStatus();
    console.log(`   ✅ Conectado a: ${status.host}/${status.name}`);
  }

  /**
   * Verificar configuración de email
   */
  private async verifyEmailConfig(): Promise<void> {
    console.log('2️⃣ Verificando configuración de email...');
    
    const isEmailConfigured = await emailService.verifyConnection();
    
    if (isEmailConfigured) {
      console.log('   ✅ Configuración de email verificada');
    } else {
      console.log('   ⚠️ Configuración de email no disponible');
      console.log('   📧 Los emails no se enviarán hasta configurar SMTP');
    }
  }

  /**
   * Crear usuario administrador
   */
  private async createAdminUser(): Promise<void> {
    console.log('3️⃣ Verificando usuario administrador...');
    
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@metaverso.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
      
      let admin = await User.findOne({ email: adminEmail });
      
      if (!admin) {
        console.log('   👤 Creando usuario administrador...');
        
        admin = new User({
          email: adminEmail,
          username: 'admin',
          password: adminPassword,
          role: 'admin',
          profile: {
            firstName: 'Administrador',
            lastName: 'Metaverso'
          },
          verification: {
            emailVerified: true,
            walletVerified: false
          },
          isActive: true
        });

        await admin.save();
        console.log(`   ✅ Usuario administrador creado: ${adminEmail}`);
      } else {
        console.log('   ✅ Usuario administrador ya existe');
      }
    } catch (error) {
      console.error('   ❌ Error creando usuario administrador:', error);
      throw error;
    }
  }

  /**
   * Crear datos de ejemplo
   */
  private async createSampleData(): Promise<void> {
    console.log('4️⃣ Creando datos de ejemplo...');
    
    try {
      // Crear usuarios de ejemplo
      await this.createSampleUsers();
      
      // Crear assets de ejemplo
      await this.createSampleAssets();
      
      console.log('   ✅ Datos de ejemplo creados');
    } catch (error) {
      console.error('   ❌ Error creando datos de ejemplo:', error);
      throw error;
    }
  }

  /**
   * Crear usuarios de ejemplo
   */
  private async createSampleUsers(): Promise<void> {
    const sampleUsers = [
      {
        email: 'artist@metaverso.com',
        username: 'artist',
        password: 'artist123',
        role: 'creator' as const,
        profile: {
          firstName: 'Artista',
          lastName: 'Digital'
        }
      },
      {
        email: 'moderator@metaverso.com',
        username: 'moderator',
        password: 'mod123',
        role: 'moderator' as const,
        profile: {
          firstName: 'Moderador',
          lastName: 'Comunidad'
        }
      },
      {
        email: 'user@metaverso.com',
        username: 'user',
        password: 'user123',
        role: 'user' as const,
        profile: {
          firstName: 'Usuario',
          lastName: 'Ejemplo'
        }
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User({
          ...userData,
          verification: {
            emailVerified: true,
            walletVerified: false
          },
          isActive: true
        });
        
        await user.save();
        console.log(`   👤 Usuario creado: ${userData.email}`);
      }
    }
  }

  /**
   * Crear assets de ejemplo
   */
  private async createSampleAssets(): Promise<void> {
    const admin = await User.findOne({ role: 'admin' });
    const artist = await User.findOne({ role: 'creator' });
    
    if (!admin || !artist) {
      console.log('   ⚠️ No se pueden crear assets de ejemplo sin usuarios');
      return;
    }

    const sampleAssets = [
      {
        name: 'Carácter Humanoide Básico',
        description: 'Modelo 3D de un personaje humanoide básico para el metaverso',
        type: '3d_model' as const,
        category: 'character' as const,
        creator: artist._id,
        owner: artist._id,
        file: {
          originalName: 'humanoid.glb',
          filename: 'humanoid_123.glb',
          path: '/assets/models/characters/humanoid_123.glb',
          size: 2048576,
          format: 'glb',
          mimeType: 'model/gltf-binary',
          hash: 'abc123def456',
          checksum: 'abc123def456'
        },
        urls: {
          original: 'https://ipfs.io/ipfs/QmExample1',
          optimized: 'https://ipfs.io/ipfs/QmExample2',
          thumbnail: 'https://ipfs.io/ipfs/QmExample3'
        },
        tags: ['character', 'humanoid', '3d', 'basic'],
        status: 'published' as const,
        moderation: {
          isApproved: true,
          approvedBy: admin._id,
          approvedAt: new Date()
        }
      },
      {
        name: 'Textura de Piel Realista',
        description: 'Textura de piel humana realista para personajes',
        type: 'texture' as const,
        category: 'character' as const,
        creator: artist._id,
        owner: artist._id,
        file: {
          originalName: 'skin_texture.png',
          filename: 'skin_texture_456.png',
          path: '/assets/textures/characters/skin_texture_456.png',
          size: 1048576,
          format: 'png',
          mimeType: 'image/png',
          hash: 'def456ghi789',
          checksum: 'def456ghi789'
        },
        urls: {
          original: 'https://ipfs.io/ipfs/QmExample4',
          optimized: 'https://ipfs.io/ipfs/QmExample5',
          thumbnail: 'https://ipfs.io/ipfs/QmExample6'
        },
        tags: ['texture', 'skin', 'realistic', 'character'],
        status: 'published' as const,
        moderation: {
          isApproved: true,
          approvedBy: admin._id,
          approvedAt: new Date()
        }
      },
      {
        name: 'Sonido Ambiental Ciudad',
        description: 'Sonido ambiental de una ciudad futurista',
        type: 'audio' as const,
        category: 'audio' as const,
        creator: artist._id,
        owner: artist._id,
        file: {
          originalName: 'city_ambient.wav',
          filename: 'city_ambient_789.wav',
          path: '/assets/audio/ambient/city_ambient_789.wav',
          size: 5242880,
          format: 'wav',
          mimeType: 'audio/wav',
          hash: 'ghi789jkl012',
          checksum: 'ghi789jkl012'
        },
        urls: {
          original: 'https://ipfs.io/ipfs/QmExample7',
          optimized: 'https://ipfs.io/ipfs/QmExample8'
        },
        tags: ['audio', 'ambient', 'city', 'futuristic'],
        status: 'published' as const,
        moderation: {
          isApproved: true,
          approvedBy: admin._id,
          approvedAt: new Date()
        }
      }
    ];

    for (const assetData of sampleAssets) {
      const existingAsset = await Asset.findOne({ name: assetData.name });
      
      if (!existingAsset) {
        const asset = new Asset(assetData);
        await asset.save();
        console.log(`   🎨 Asset creado: ${assetData.name}`);
      }
    }
  }

  /**
   * Verificar integridad del sistema
   */
  private async verifyIntegrity(): Promise<void> {
    console.log('5️⃣ Verificando integridad del sistema...');
    
    try {
      // Verificar base de datos
      const dbIntegrity = await databaseService.verifyIntegrity();
      
      if (dbIntegrity.isValid) {
        console.log('   ✅ Integridad de base de datos verificada');
      } else {
        console.log('   ⚠️ Problemas de integridad encontrados:');
        dbIntegrity.issues.forEach(issue => console.log(`      - ${issue}`));
      }

      // Verificar usuarios críticos
      const adminCount = await User.countDocuments({ role: 'admin' });
      const userCount = await User.countDocuments({});
      const assetCount = await Asset.countDocuments({});

      console.log(`   📊 Estadísticas:`);
      console.log(`      - Usuarios totales: ${userCount}`);
      console.log(`      - Administradores: ${adminCount}`);
      console.log(`      - Assets totales: ${assetCount}`);

      if (adminCount === 0) {
        throw new Error('No hay usuarios administradores');
      }

    } catch (error) {
      console.error('   ❌ Error verificando integridad:', error);
      throw error;
    }
  }

  /**
   * Limpiar datos de ejemplo (solo desarrollo)
   */
  async cleanup(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se puede limpiar en producción');
    }

    console.log('🧹 Limpiando datos de ejemplo...');
    
    try {
      await databaseService.clearDatabase();
      console.log('✅ Datos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
      throw error;
    }
  }

  /**
   * Crear backup
   */
  async createBackup(): Promise<void> {
    console.log('💾 Creando backup...');
    
    try {
      const backupPath = await databaseService.createBackup();
      console.log(`✅ Backup creado en: ${backupPath}`);
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }
}

// Función principal
async function main() {
  const initScript = new InitScript();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      await initScript.run();
      break;
    case 'cleanup':
      await initScript.cleanup();
      break;
    case 'backup':
      await initScript.createBackup();
      break;
    default:
      console.log('Uso: npm run init [init|cleanup|backup]');
      console.log('  init    - Inicializar el sistema');
      console.log('  cleanup - Limpiar datos (solo desarrollo)');
      console.log('  backup  - Crear backup');
      process.exit(1);
  }
  
  process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export default InitScript; 