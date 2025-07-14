#!/usr/bin/env node

/**
 * 🌍 World Generator - Metaverso Web3
 * Genera mundos procedurales con diferentes tipos de entornos
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Configuración
const CONFIG = {
    worldTypes: {
        city: {
            buildings: 50,
            roads: 20,
            parks: 5,
            landmarks: 3
        },
        nature: {
            trees: 100,
            mountains: 10,
            lakes: 5,
            caves: 3
        },
        fantasy: {
            castles: 5,
            towers: 15,
            bridges: 8,
            portals: 2
        },
        space: {
            stations: 8,
            asteroids: 50,
            planets: 3,
            wormholes: 1
        }
    },
    outputDir: './generated-worlds',
    templateDir: './templates'
};

// Colores para consola
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

class WorldGenerator {
    constructor() {
        this.worldData = {
            metadata: {},
            entities: [],
            environment: {},
            physics: {},
            lighting: {},
            audio: {}
        };
        this.startTime = performance.now();
    }

    log(message, color = 'reset', level = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`${colors[color]}[${timestamp}] [${level}] ${message}${colors.reset}`);
    }

    // Generar ID único
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Generar posición aleatoria
    generateRandomPosition(bounds = { x: 1000, y: 100, z: 1000 }) {
        return {
            x: (Math.random() - 0.5) * bounds.x,
            y: Math.random() * bounds.y,
            z: (Math.random() - 0.5) * bounds.z
        };
    }

    // Generar rotación aleatoria
    generateRandomRotation() {
        return {
            x: Math.random() * Math.PI * 2,
            y: Math.random() * Math.PI * 2,
            z: Math.random() * Math.PI * 2
        };
    }

    // Generar escala aleatoria
    generateRandomScale(min = 0.5, max = 2.0) {
        const scale = Math.random() * (max - min) + min;
        return { x: scale, y: scale, z: scale };
    }

    // Generar edificios para ciudad
    generateBuildings(count) {
        const buildings = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition();
            const height = Math.random() * 50 + 10;
            
            buildings.push({
                id: this.generateId(),
                type: 'building',
                subtype: this.getRandomBuildingType(),
                position: { ...position, y: height / 2 },
                rotation: this.generateRandomRotation(),
                scale: { x: 1, y: height / 10, z: 1 },
                properties: {
                    floors: Math.floor(height / 3),
                    windows: Math.floor(Math.random() * 20) + 5,
                    color: this.getRandomColor(),
                    material: this.getRandomMaterial()
                }
            });
        }
        
        return buildings;
    }

    // Generar árboles para naturaleza
    generateTrees(count) {
        const trees = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition();
            
            trees.push({
                id: this.generateId(),
                type: 'tree',
                subtype: this.getRandomTreeType(),
                position,
                rotation: this.generateRandomRotation(),
                scale: this.generateRandomScale(0.8, 1.5),
                properties: {
                    species: this.getRandomTreeSpecies(),
                    age: Math.floor(Math.random() * 100) + 1,
                    height: Math.random() * 20 + 5,
                    leaves: this.getRandomColor()
                }
            });
        }
        
        return trees;
    }

    // Generar castillos para fantasía
    generateCastles(count) {
        const castles = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition();
            
            castles.push({
                id: this.generateId(),
                type: 'castle',
                subtype: this.getRandomCastleType(),
                position,
                rotation: this.generateRandomRotation(),
                scale: this.generateRandomScale(1.0, 3.0),
                properties: {
                    towers: Math.floor(Math.random() * 4) + 2,
                    walls: Math.floor(Math.random() * 8) + 4,
                    moat: Math.random() > 0.5,
                    material: 'stone',
                    age: Math.floor(Math.random() * 1000) + 100
                }
            });
        }
        
        return castles;
    }

    // Generar estaciones espaciales
    generateSpaceStations(count) {
        const stations = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition({ x: 2000, y: 500, z: 2000 });
            
            stations.push({
                id: this.generateId(),
                type: 'space_station',
                subtype: this.getRandomStationType(),
                position,
                rotation: this.generateRandomRotation(),
                scale: this.generateRandomScale(1.0, 2.5),
                properties: {
                    modules: Math.floor(Math.random() * 10) + 5,
                    crew: Math.floor(Math.random() * 100) + 10,
                    power: Math.random() * 1000 + 500,
                    shields: Math.random() > 0.3,
                    docking_ports: Math.floor(Math.random() * 8) + 2
                }
            });
        }
        
        return stations;
    }

    // Generar carreteras
    generateRoads(count) {
        const roads = [];
        
        for (let i = 0; i < count; i++) {
            const start = this.generateRandomPosition();
            const end = this.generateRandomPosition();
            
            roads.push({
                id: this.generateId(),
                type: 'road',
                subtype: this.getRandomRoadType(),
                position: {
                    x: (start.x + end.x) / 2,
                    y: 0.1,
                    z: (start.z + end.z) / 2
                },
                rotation: {
                    x: 0,
                    y: Math.atan2(end.z - start.z, end.x - start.x),
                    z: 0
                },
                scale: {
                    x: Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)),
                    y: 0.2,
                    z: 8
                },
                properties: {
                    lanes: Math.floor(Math.random() * 4) + 2,
                    material: 'asphalt',
                    lighting: Math.random() > 0.5
                }
            });
        }
        
        return roads;
    }

    // Generar montañas
    generateMountains(count) {
        const mountains = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition();
            const height = Math.random() * 200 + 50;
            
            mountains.push({
                id: this.generateId(),
                type: 'mountain',
                subtype: this.getRandomMountainType(),
                position: { ...position, y: height / 2 },
                rotation: this.generateRandomRotation(),
                scale: { x: 1, y: height / 100, z: 1 },
                properties: {
                    height: height,
                    snow_capped: Math.random() > 0.7,
                    material: 'rock',
                    vegetation: this.getRandomVegetation()
                }
            });
        }
        
        return mountains;
    }

    // Generar torres
    generateTowers(count) {
        const towers = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition();
            const height = Math.random() * 30 + 10;
            
            towers.push({
                id: this.generateId(),
                type: 'tower',
                subtype: this.getRandomTowerType(),
                position: { ...position, y: height / 2 },
                rotation: this.generateRandomRotation(),
                scale: { x: 1, y: height / 10, z: 1 },
                properties: {
                    height: height,
                    floors: Math.floor(height / 3),
                    spiral_stairs: Math.random() > 0.5,
                    material: 'stone',
                    magical: Math.random() > 0.7
                }
            });
        }
        
        return towers;
    }

    // Generar asteroides
    generateAsteroids(count) {
        const asteroids = [];
        
        for (let i = 0; i < count; i++) {
            const position = this.generateRandomPosition({ x: 3000, y: 1000, z: 3000 });
            
            asteroids.push({
                id: this.generateId(),
                type: 'asteroid',
                subtype: this.getRandomAsteroidType(),
                position,
                rotation: this.generateRandomRotation(),
                scale: this.generateRandomScale(0.1, 2.0),
                properties: {
                    size: Math.random() * 100 + 10,
                    composition: this.getRandomComposition(),
                    orbit_speed: Math.random() * 10 + 1,
                    resources: this.getRandomResources()
                }
            });
        }
        
        return asteroids;
    }

    // Funciones auxiliares para tipos aleatorios
    getRandomBuildingType() {
        const types = ['skyscraper', 'office', 'residential', 'commercial', 'industrial'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomTreeType() {
        const types = ['oak', 'pine', 'maple', 'birch', 'willow'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomCastleType() {
        const types = ['medieval', 'gothic', 'renaissance', 'fortress', 'palace'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomStationType() {
        const types = ['research', 'trading', 'military', 'mining', 'habitation'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomRoadType() {
        const types = ['highway', 'street', 'avenue', 'boulevard', 'alley'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomMountainType() {
        const types = ['volcanic', 'fold', 'block', 'dome', 'plateau'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomTowerType() {
        const types = ['watchtower', 'wizard_tower', 'bell_tower', 'lighthouse', 'defense'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomAsteroidType() {
        const types = ['carbonaceous', 'metallic', 'silicate', 'ice', 'meteor'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomColor() {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown', 'gray'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomMaterial() {
        const materials = ['concrete', 'glass', 'steel', 'wood', 'stone', 'plastic'];
        return materials[Math.floor(Math.random() * materials.length)];
    }

    getRandomTreeSpecies() {
        const species = ['Quercus', 'Pinus', 'Acer', 'Betula', 'Salix'];
        return species[Math.floor(Math.random() * species.length)];
    }

    getRandomVegetation() {
        const vegetation = ['forest', 'grassland', 'desert', 'tundra', 'rainforest'];
        return vegetation[Math.floor(Math.random() * vegetation.length)];
    }

    getRandomComposition() {
        const compositions = ['iron', 'nickel', 'carbon', 'silicon', 'ice'];
        return compositions[Math.floor(Math.random() * compositions.length)];
    }

    getRandomResources() {
        const resources = ['iron_ore', 'gold', 'platinum', 'water_ice', 'rare_metals'];
        return resources[Math.floor(Math.random() * resources.length)];
    }

    // Generar entorno
    generateEnvironment(worldType) {
        const env = {
            skybox: this.getSkyboxForType(worldType),
            weather: this.getWeatherForType(worldType),
            time: {
                day_cycle: Math.random() * 24,
                season: this.getRandomSeason()
            },
            atmosphere: this.getAtmosphereForType(worldType)
        };

        return env;
    }

    // Generar física
    generatePhysics(worldType) {
        const physics = {
            gravity: this.getGravityForType(worldType),
            wind: {
                speed: Math.random() * 20,
                direction: Math.random() * 360
            },
            temperature: this.getTemperatureForType(worldType),
            pressure: this.getPressureForType(worldType)
        };

        return physics;
    }

    // Generar iluminación
    generateLighting(worldType) {
        const lighting = {
            ambient: this.getAmbientLightForType(worldType),
            directional: {
                intensity: Math.random() * 2 + 0.5,
                color: this.getLightColorForType(worldType)
            },
            shadows: Math.random() > 0.3,
            fog: this.getFogForType(worldType)
        };

        return lighting;
    }

    // Generar audio
    generateAudio(worldType) {
        const audio = {
            ambient_sounds: this.getAmbientSoundsForType(worldType),
            music: this.getMusicForType(worldType),
            effects: this.getAudioEffectsForType(worldType),
            volume: {
                master: 0.8,
                ambient: 0.6,
                music: 0.4,
                effects: 0.7
            }
        };

        return audio;
    }

    // Funciones auxiliares para entornos
    getSkyboxForType(worldType) {
        const skyboxes = {
            city: 'urban_skybox',
            nature: 'forest_skybox',
            fantasy: 'magical_skybox',
            space: 'space_skybox'
        };
        return skyboxes[worldType] || 'default_skybox';
    }

    getWeatherForType(worldType) {
        const weathers = {
            city: ['clear', 'cloudy', 'rain'],
            nature: ['clear', 'rain', 'storm', 'fog'],
            fantasy: ['clear', 'magical_storm', 'aurora'],
            space: ['clear', 'solar_wind', 'meteor_shower']
        };
        const options = weathers[worldType] || ['clear'];
        return options[Math.floor(Math.random() * options.length)];
    }

    getRandomSeason() {
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        return seasons[Math.floor(Math.random() * seasons.length)];
    }

    getAtmosphereForType(worldType) {
        const atmospheres = {
            city: { oxygen: 21, pollution: 0.3, visibility: 0.7 },
            nature: { oxygen: 22, pollution: 0.1, visibility: 0.9 },
            fantasy: { oxygen: 23, magic: 0.8, visibility: 0.8 },
            space: { oxygen: 0, radiation: 0.5, visibility: 1.0 }
        };
        return atmospheres[worldType] || { oxygen: 21, visibility: 0.8 };
    }

    getGravityForType(worldType) {
        const gravities = {
            city: 9.8,
            nature: 9.8,
            fantasy: 9.8,
            space: 0.1
        };
        return gravities[worldType] || 9.8;
    }

    getTemperatureForType(worldType) {
        const temperatures = {
            city: 20,
            nature: 15,
            fantasy: 18,
            space: -270
        };
        return temperatures[worldType] || 20;
    }

    getPressureForType(worldType) {
        const pressures = {
            city: 101.3,
            nature: 101.3,
            fantasy: 101.3,
            space: 0.001
        };
        return pressures[worldType] || 101.3;
    }

    getAmbientLightForType(worldType) {
        const lights = {
            city: 0.3,
            nature: 0.4,
            fantasy: 0.5,
            space: 0.1
        };
        return lights[worldType] || 0.3;
    }

    getLightColorForType(worldType) {
        const colors = {
            city: '#ffffff',
            nature: '#f0f8ff',
            fantasy: '#ffd700',
            space: '#000080'
        };
        return colors[worldType] || '#ffffff';
    }

    getFogForType(worldType) {
        const fogs = {
            city: { density: 0.1, color: '#cccccc' },
            nature: { density: 0.05, color: '#87ceeb' },
            fantasy: { density: 0.2, color: '#dda0dd' },
            space: { density: 0.0, color: '#000000' }
        };
        return fogs[worldType] || { density: 0.0, color: '#ffffff' };
    }

    getAmbientSoundsForType(worldType) {
        const sounds = {
            city: ['traffic', 'people', 'construction'],
            nature: ['birds', 'wind', 'water'],
            fantasy: ['magic', 'creatures', 'wind'],
            space: ['silence', 'engines', 'static']
        };
        return sounds[worldType] || ['ambient'];
    }

    getMusicForType(worldType) {
        const music = {
            city: 'urban_ambient',
            nature: 'nature_sounds',
            fantasy: 'epic_fantasy',
            space: 'space_ambient'
        };
        return music[worldType] || 'default_music';
    }

    getAudioEffectsForType(worldType) {
        const effects = {
            city: ['echo', 'reverb'],
            nature: ['reverb', 'lowpass'],
            fantasy: ['reverb', 'chorus'],
            space: ['delay', 'phaser']
        };
        return effects[worldType] || ['reverb'];
    }

    // Generar mundo completo
    async generateWorld(worldType, options = {}) {
        this.log(`🌍 Generando mundo tipo: ${worldType}`, 'green');
        
        const config = CONFIG.worldTypes[worldType];
        if (!config) {
            throw new Error(`Tipo de mundo no válido: ${worldType}`);
        }

        // Generar entidades según el tipo
        let entities = [];
        
        switch (worldType) {
            case 'city':
                entities = [
                    ...this.generateBuildings(config.buildings),
                    ...this.generateRoads(config.roads)
                ];
                break;
            case 'nature':
                entities = [
                    ...this.generateTrees(config.trees),
                    ...this.generateMountains(config.mountains)
                ];
                break;
            case 'fantasy':
                entities = [
                    ...this.generateCastles(config.castles),
                    ...this.generateTowers(config.towers)
                ];
                break;
            case 'space':
                entities = [
                    ...this.generateSpaceStations(config.stations),
                    ...this.generateAsteroids(config.asteroids)
                ];
                break;
        }

        // Generar metadatos
        this.worldData.metadata = {
            id: this.generateId(),
            name: `${worldType}_world_${Date.now()}`,
            type: worldType,
            version: '1.0.0',
            created: new Date().toISOString(),
            generator: 'WorldGenerator',
            entityCount: entities.length,
            bounds: {
                x: 2000,
                y: 500,
                z: 2000
            }
        };

        this.worldData.entities = entities;
        this.worldData.environment = this.generateEnvironment(worldType);
        this.worldData.physics = this.generatePhysics(worldType);
        this.worldData.lighting = this.generateLighting(worldType);
        this.worldData.audio = this.generateAudio(worldType);

        return this.worldData;
    }

    // Guardar mundo
    saveWorld(worldData, filename = null) {
        if (!filename) {
            filename = `${worldData.metadata.name}.json`;
        }

        // Crear directorio si no existe
        if (!fs.existsSync(CONFIG.outputDir)) {
            fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        }

        const filepath = path.join(CONFIG.outputDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(worldData, null, 2));
        
        this.log(`💾 Mundo guardado en: ${filepath}`, 'green');
        return filepath;
    }

    // Mostrar estadísticas del mundo
    displayWorldStats(worldData) {
        console.log(`\n${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║                    🌍 WORLD STATISTICS                       ║${colors.reset}`);
        console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`${colors.blue}📊 METADATA:${colors.reset}`);
        console.log(`   Name: ${worldData.metadata.name}`);
        console.log(`   Type: ${worldData.metadata.type}`);
        console.log(`   Version: ${worldData.metadata.version}`);
        console.log(`   Created: ${worldData.metadata.created}`);
        console.log(`   Entity Count: ${worldData.metadata.entityCount}`);

        console.log(`\n${colors.blue}🏗️  ENTITIES:${colors.reset}`);
        const entityTypes = {};
        worldData.entities.forEach(entity => {
            entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
        });
        
        Object.keys(entityTypes).forEach(type => {
            console.log(`   ${type}: ${entityTypes[type]}`);
        });

        console.log(`\n${colors.blue}🌤️  ENVIRONMENT:${colors.reset}`);
        console.log(`   Skybox: ${worldData.environment.skybox}`);
        console.log(`   Weather: ${worldData.environment.weather}`);
        console.log(`   Time: ${worldData.environment.time.day_cycle.toFixed(1)}h`);
        console.log(`   Season: ${worldData.environment.time.season}`);

        console.log(`\n${colors.blue}⚙️  PHYSICS:${colors.reset}`);
        console.log(`   Gravity: ${worldData.physics.gravity}m/s²`);
        console.log(`   Temperature: ${worldData.physics.temperature}°C`);
        console.log(`   Wind Speed: ${worldData.physics.wind.speed}m/s`);

        console.log(`\n${colors.blue}💡 LIGHTING:${colors.reset}`);
        console.log(`   Ambient: ${worldData.lighting.ambient}`);
        console.log(`   Shadows: ${worldData.lighting.shadows ? 'Enabled' : 'Disabled'}`);
        console.log(`   Fog Density: ${worldData.lighting.fog.density}`);

        console.log(`\n${colors.blue}🔊 AUDIO:${colors.reset}`);
        console.log(`   Music: ${worldData.audio.music}`);
        console.log(`   Ambient Sounds: ${worldData.audio.ambient_sounds.join(', ')}`);
        console.log(`   Master Volume: ${worldData.audio.volume.master * 100}%`);
    }
}

// Manejar argumentos de línea de comandos
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        type: 'city',
        output: null,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--type':
            case '-t':
                options.type = args[++i];
                break;
            case '--output':
            case '-o':
                options.output = args[++i];
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

// Mostrar ayuda
function showHelp() {
    console.log(`${colors.cyan}🌍 World Generator - Metaverso Web3${colors.reset}\n`);
    console.log('Uso: node generate-world.js [opciones]\n');
    console.log('Opciones:');
    console.log('  -t, --type <tipo>     Tipo de mundo (city, nature, fantasy, space)');
    console.log('  -o, --output <archivo> Nombre del archivo de salida');
    console.log('  -h, --help            Mostrar esta ayuda\n');
    console.log('Ejemplos:');
    console.log('  node generate-world.js --type city');
    console.log('  node generate-world.js --type fantasy --output my_world.json');
}

// Iniciar si es el script principal
if (require.main === module) {
    const options = parseArguments();
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    const generator = new WorldGenerator();
    
    generator.generateWorld(options.type)
        .then(worldData => {
            generator.displayWorldStats(worldData);
            generator.saveWorld(worldData, options.output);
            
            const duration = ((performance.now() - generator.startTime) / 1000).toFixed(2);
            console.log(`\n${colors.green}✅ Mundo generado exitosamente en ${duration}s${colors.reset}`);
        })
        .catch(error => {
            console.error(`${colors.red}❌ Error generando mundo: ${error.message}${colors.reset}`);
            process.exit(1);
        });
}

module.exports = WorldGenerator; 