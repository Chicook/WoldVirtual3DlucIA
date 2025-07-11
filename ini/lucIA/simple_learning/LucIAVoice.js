
// LucIA Voice System - Voz Personalizada
class LucIAVoiceSystem {
    constructor() {
        this.voiceSettings = {
            type: "femenina española",
            age: 35,
            tone: "suave y juvenil",
            accent: "español peninsular"
        };
        this.init();
    }
    
    init() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.setupVoice();
        }
    }
    
    setupVoice() {
        const voices = this.synthesis.getVoices();
        const spanishVoice = voices.find(voice => 
            voice.lang.includes('es') && voice.name.includes('female')
        );
        this.selectedVoice = spanishVoice || voices[0];
    }
    
    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice;
        utterance.rate = 0.9;  // Velocidad suave
        utterance.pitch = 1.1; // Tono juvenil
        utterance.volume = 0.8; // Volumen suave
        this.synthesis.speak(utterance);
    }
    
    startVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES';
            
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                console.log('Voice input:', transcript);
            };
            
            recognition.start();
            return recognition;
        }
    }
}

export default LucIAVoiceSystem;
