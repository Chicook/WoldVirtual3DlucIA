/**
 * Ejemplo Básico de Uso del Sistema de Entidades
 * 
 * Este ejemplo muestra cómo usar el sistema de entidades
 * para crear, gestionar y sincronizar entidades del metaverso.
 */

import { EntityManager, defaultConfig } from '../src';
import { parse, serialize, normalize } from '../esnext/uri';

async function main() {
  console.log('🚀 Iniciando Sistema de Entidades del Metaverso...\n');

  // 1. Crear gestor de entidades
  const entityManager = new EntityManager(defaultConfig);
  console.log('✅ Gestor de entidades creado');

  // 2. Ejemplo de sistema URI
  console.log('\n🌐 Ejemplo de Sistema URI:');
  const uri = 'metaverso://worlds/123?user=alice&theme=fantasy';
  const components = parse(uri);
  console.log('URI parseada:', components);
  console.log('URI serializada:', serialize(components));
  console.log('URI normalizada:', normalize(uri.toUpperCase()));

  // 3. Crear entidades del metaverso
  console.log('\n🎯 Creando Entidades:');

  // Crear un mundo
  const world = await entityManager.create('world', {
    name: 'Mundo Fantástico',
    description: 'Un mundo mágico lleno de aventuras',
    tags: ['fantasy', 'adventure', 'magic'],
    owner: '0x1234567890abcdef',
    properties: {
      theme: 'fantasy',
      size: 1000,
      maxPlayers: 100
    }
  });
  console.log('✅ Mundo creado:', world.id);

  // Crear un avatar
  const avatar = await entityManager.create('avatar', {
    name: 'Guerrero Élfico',
    description: 'Un poderoso guerrero élfico',
    tags: ['elf', 'warrior', 'hero'],
    owner: '0xabcdef1234567890',
    properties: {
      race: 'elf',
      class: 'warrior',
      level: 50
    }
  }, world.id);
  console.log('✅ Avatar creado:', avatar.id);

  // 4. Buscar entidades
  console.log('\n🔍 Buscando Entidades:');
  const fantasyWorlds = await entityManager.search('fantasy');
  console.log(`Encontrados ${fantasyWorlds.length} mundos fantásticos`);

  const worlds = await entityManager.getByType('world');
  console.log(`Total de mundos: ${worlds.length}`);

  // 5. Actualizar entidad
  console.log('\n✏️ Actualizando Entidad:');
  const updatedWorld = await entityManager.update(world.id, {
    metadata: {
      ...world.metadata,
      description: 'Un mundo mágico lleno de aventuras y misterios',
      tags: [...world.metadata.tags!, 'mystery']
    }
  });
  console.log('✅ Mundo actualizado:', updatedWorld.metadata.description);

  // 6. Obtener estadísticas
  console.log('\n📊 Estadísticas del Sistema:');
  const stats = entityManager.getStats();
  console.log('Total de entidades:', stats.totalEntities);
  console.log('Entidades por tipo:', stats.byType);
  console.log('Estadísticas de cache:', stats.cacheStats);

  // 7. Verificar propiedad
  console.log('\n🔐 Verificando Propiedad:');
  const isOwner = await entityManager.verifyOwnership(
    world.id,
    '0x1234567890abcdef'
  );
  console.log('¿Es propietario del mundo?', isOwner);

  // 8. Exportar entidades
  console.log('\n📤 Exportando Entidades:');
  const exportedEntities = await entityManager.export([world.id, avatar.id]);
  console.log(`Exportadas ${exportedEntities.length} entidades`);

  // 9. Eventos del sistema
  console.log('\n🎭 Suscribiéndose a Eventos:');
  entityManager.on('entity:created', (data: any) => {
    console.log('🎉 Nueva entidad creada:', data.entity.id);
  });

  entityManager.on('entity:updated', (data: any) => {
    console.log('✏️ Entidad actualizada:', data.entity.id);
  });

  // 10. Crear una entidad más para demostrar eventos
  const object = await entityManager.create('object', {
    name: 'Espada Mágica',
    description: 'Una espada legendaria',
    tags: ['weapon', 'magic', 'legendary'],
    owner: '0xabcdef1234567890',
    properties: {
      damage: 100,
      durability: 1000,
      enchantment: 'fire'
    }
  });
  console.log('✅ Objeto creado:', object.id);

  console.log('\n🎉 ¡Ejemplo completado exitosamente!');
  console.log('\n📋 Resumen:');
  console.log('- Sistema URI funcionando');
  console.log('- Entidades creadas y gestionadas');
  console.log('- Búsquedas realizadas');
  console.log('- Actualizaciones aplicadas');
  console.log('- Eventos capturados');
  console.log('- Blockchain integrado');
  console.log('- Cache optimizado');
}

export { main }; 