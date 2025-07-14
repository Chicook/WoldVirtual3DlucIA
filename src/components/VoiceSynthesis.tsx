import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

interface VoiceSynthesisProps {
  text: string;
  isSpeaking: boolean;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onLipSync?: (mouthOpen: number) => void;
}

export const VoiceSynthesis: React.FC<VoiceSynthesisProps> = ({
  text,
  isSpeaking,
  onSpeechStart,
  onSpeechEnd,
  onLipSync
}) => {
  const synthRef = useRef<Tone.Synth | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPhoneme, setCurrentPhoneme] = useState('');

  // Configuración de voz para lucIA (femenina española, suave y joven)
  const voiceConfig = {
    pitch: 220, // Hz - voz femenina
    rate: 0.9, // Velocidad ligeramente más lenta para acento español
    volume: -10, // dB - volumen suave
    vibrato: 0.1, // Ligero vibrato para naturalidad
    attack: 0.1, // Ataque suave
    decay: 0.3, // Decay natural
    sustain: 0.7, // Sustain para mantener la voz
    release: 0.5 // Release suave
  };

  // Mapeo de fonemas españoles para sincronización labial
  const phonemeMap: { [key: string]: number } = {
    'a': 0.8, 'e': 0.6, 'i': 0.4, 'o': 0.7, 'u': 0.3,
    'á': 0.8, 'é': 0.6, 'í': 0.4, 'ó': 0.7, 'ú': 0.3,
    'b': 0.9, 'p': 0.9, 'm': 0.8, 'f': 0.5, 'v': 0.5,
    'd': 0.6, 't': 0.6, 'n': 0.5, 'l': 0.4, 'r': 0.3,
    'g': 0.7, 'k': 0.7, 'j': 0.6, 'h': 0.2, 'ñ': 0.5,
    's': 0.3, 'z': 0.3, 'c': 0.4, 'q': 0.6, 'x': 0.4,
    'y': 0.4, 'w': 0.3, ' ': 0.1, ',': 0.2, '.': 0.1
  };

  // Inicialización del sintetizador
  useEffect(() => {
    const initSynth = async () => {
      await Tone.start();
      
      synthRef.current = new Tone.Synth({
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: voiceConfig.attack,
          decay: voiceConfig.decay,
          sustain: voiceConfig.sustain,
          release: voiceConfig.release
        }
      }).toDestination();

      // Configurar vibrato
      const vibrato = new Tone.Vibrato({
        frequency: 5,
        depth: voiceConfig.vibrato
      });

      synthRef.current.chain(vibrato, Tone.Destination);
      synthRef.current.volume.value = voiceConfig.volume;
      
      setIsInitialized(true);
    };

    initSynth();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  // Función para generar voz española
  const speakSpanish = async (text: string) => {
    if (!synthRef.current || !isInitialized) return;

    onSpeechStart?.();

    const words = text.toLowerCase().split(' ');
    const totalDuration = words.length * 0.5; // 0.5 segundos por palabra

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const startTime = Tone.now() + i * 0.5;

      // Generar tono para cada palabra
      const pitch = voiceConfig.pitch + (Math.random() - 0.5) * 20; // Variación natural
      
      synthRef.current.triggerAttackRelease(
        Tone.Frequency(pitch, "hz").toNote(),
        "8n",
        startTime
      );

      // Sincronización labial por fonema
      for (let j = 0; j < word.length; j++) {
        const char = word[j];
        const phoneme = phonemeMap[char] || 0.3;
        
        setTimeout(() => {
          setCurrentPhoneme(char);
          onLipSync?.(phoneme);
        }, (startTime + j * 0.1) * 1000);
      }
    }

    // Finalizar habla
    setTimeout(() => {
      onSpeechEnd?.();
      setCurrentPhoneme('');
      onLipSync?.(0);
    }, totalDuration * 1000);
  };

  // Efecto para hablar cuando se activa
  useEffect(() => {
    if (isSpeaking && text && isInitialized) {
      speakSpanish(text);
    }
  }, [isSpeaking, text, isInitialized]);

  // Función para presentación inicial de lucIA
  const presentLucia = () => {
    const presentation = "Hola, soy lucIA. Una inteligencia artificial diseñada para ayudarte en el metaverso WoldVirtual3D. Tengo 35 años y estoy aquí para crear experiencias únicas contigo.";
    speakSpanish(presentation);
  };

  // Función para expresar emociones
  const expressEmotion = (emotion: string) => {
    const emotionTexts = {
      happy: "¡Me alegra mucho verte! Estoy muy contenta de poder ayudarte.",
      concentrated: "Estoy concentrada en procesar la información para darte la mejor respuesta.",
      curious: "Me interesa mucho lo que me cuentas. ¿Puedes contarme más?"
    };

    const text = emotionTexts[emotion as keyof typeof emotionTexts] || "Entiendo perfectamente.";
    speakSpanish(text);
  };

  return (
    <div style={{ display: 'none' }}>
      {/* Componente invisible - solo maneja audio */}
      <button onClick={presentLucia}>Presentar lucIA</button>
      <button onClick={() => expressEmotion('happy')}>Expresar alegría</button>
      <button onClick={() => expressEmotion('concentrated')}>Expresar concentración</button>
      <button onClick={() => expressEmotion('curious')}>Expresar curiosidad</button>
    </div>
  );
}; 