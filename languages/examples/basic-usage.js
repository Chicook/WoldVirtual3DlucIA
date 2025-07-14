/**
 * Ejemplo Básico de Uso - Sistema de Idiomas
 * 
 * Este ejemplo muestra cómo usar las funcionalidades básicas
 * del sistema de idiomas y traducción.
 */

const LanguageDetector = require('../src/core/language-detector');
const TranslationService = require('../src/core/translation-service');

async function ejemploBasico() {
    console.log('🚀 Iniciando ejemplo básico del Sistema de Idiomas\n');

    // 1. Detección de Idioma
    console.log('1️⃣ Detección de Idioma:');
    const detector = new LanguageDetector();
    
    const textos = [
        'Hola, ¿cómo estás?',
        'Hello, how are you?',
        'Bonjour, comment allez-vous?',
        'Hallo, wie geht es dir?',
        'Ciao, come stai?'
    ];

    for (const texto of textos) {
        const idioma = await detector.detect(texto);
        const info = detector.getLanguageInfo(idioma);
        console.log(`   "${texto}" → ${info.name} (${idioma})`);
    }

    // 2. Traducción
    console.log('\n2️⃣ Traducción:');
    const translator = new TranslationService();
    
    const traducciones = [
        { texto: 'Hola', desde: 'es', hacia: 'en' },
        { texto: 'Thank you', desde: 'en', hacia: 'es' },
        { texto: 'Bonjour', desde: 'fr', hacia: 'es' },
        { texto: 'Good morning', desde: 'en', hacia: 'fr' }
    ];

    for (const trad of traducciones) {
        const resultado = await translator.translate(trad.texto, trad.desde, trad.hacia);
        console.log(`   ${trad.texto} (${trad.desde}) → ${resultado} (${trad.hacia})`);
    }

    // 3. Estadísticas
    console.log('\n3️⃣ Estadísticas del Sistema:');
    const stats = translator.getStats();
    console.log(`   Diccionarios: ${stats.totalDictionaries}`);
    console.log(`   Traducciones: ${stats.totalTranslations}`);
    console.log(`   Cache: ${stats.cacheSize} elementos`);
    console.log(`   Idiomas soportados: ${stats.supportedLanguages.join(', ')}`);

    // 4. Agregar nueva traducción
    console.log('\n4️⃣ Agregando nueva traducción:');
    translator.addTranslation('es', 'en', 'metaverso', 'metaverse');
    const nuevaTraduccion = await translator.translate('metaverso', 'es', 'en');
    console.log(`   "metaverso" (es) → "${nuevaTraduccion}" (en)`);

    console.log('\n✅ Ejemplo completado exitosamente!');
}

// Ejecutar ejemplo
if (require.main === module) {
    ejemploBasico().catch(console.error);
}

module.exports = { ejemploBasico }; 