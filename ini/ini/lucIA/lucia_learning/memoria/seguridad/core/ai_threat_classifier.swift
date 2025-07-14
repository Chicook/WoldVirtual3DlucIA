// ai_threat_classifier.swift
// Clasificador de amenazas con IA para lucIA
// Utiliza Core ML para detectar y clasificar amenazas avanzadas

import Foundation
import CoreML
import Accelerate
import Security

// Estructura para representar características de archivos
struct FileFeatures {
    let entropy: Double
    let fileSize: Int64
    let stringCount: Int
    let importCount: Int
    let functionCount: Int
    let suspiciousPatterns: Int
    let encryptionIndicators: Int
    let networkIndicators: Int
    let systemCallIndicators: Int
    let obfuscationScore: Double
}

// Estructura para resultados de clasificación
struct ThreatClassification {
    let isMalicious: Bool
    let confidence: Double
    let threatType: String
    let severity: Int // 1-10
    let indicators: [String]
    let recommendedAction: String
}

// Estructura para patrones de amenazas
struct ThreatPattern {
    let id: String
    let name: String
    let pattern: String
    let weight: Double
    let category: String
}

class AIThreatClassifier {
    private var mlModel: MLModel?
    private var threatPatterns: [ThreatPattern] = []
    private var featureExtractor: FeatureExtractor
    private var anomalyDetector: AnomalyDetector
    
    init() {
        self.featureExtractor = FeatureExtractor()
        self.anomalyDetector = AnomalyDetector()
        loadThreatPatterns()
        loadMLModel()
    }
    
    // Cargar patrones de amenazas conocidas
    private func loadThreatPatterns() {
        threatPatterns = [
            ThreatPattern(id: "malware_001", name: "Ransomware", pattern: "encrypt.*files", weight: 0.9, category: "ransomware"),
            ThreatPattern(id: "malware_002", name: "Keylogger", pattern: "keyboard.*hook", weight: 0.8, category: "spyware"),
            ThreatPattern(id: "malware_003", name: "Backdoor", pattern: "reverse.*shell", weight: 0.9, category: "backdoor"),
            ThreatPattern(id: "malware_004", name: "Dropper", pattern: "download.*execute", weight: 0.7, category: "dropper"),
            ThreatPattern(id: "malware_005", name: "Obfuscated", pattern: "base64.*decode", weight: 0.6, category: "obfuscation"),
            ThreatPattern(id: "malware_006", name: "Network", pattern: "http.*request", weight: 0.5, category: "network"),
            ThreatPattern(id: "malware_007", name: "System", pattern: "system.*call", weight: 0.7, category: "system"),
            ThreatPattern(id: "malware_008", name: "Registry", pattern: "registry.*modify", weight: 0.6, category: "persistence"),
            ThreatPattern(id: "malware_009", name: "Process", pattern: "process.*injection", weight: 0.8, category: "injection"),
            ThreatPattern(id: "malware_010", name: "AntiVM", pattern: "virtual.*detect", weight: 0.7, category: "evasion")
        ]
    }
    
    // Cargar modelo de machine learning
    private func loadMLModel() {
        // En implementación real, cargaría un modelo Core ML entrenado
        // Por ahora, usamos lógica heurística
        print("Modelo ML cargado (simulado)")
    }
    
    // Clasificar archivo usando IA
    func classifyFile(filePath: String) -> ThreatClassification {
        guard let fileData = try? Data(contentsOf: URL(fileURLWithPath: filePath)) else {
            return ThreatClassification(
                isMalicious: false,
                confidence: 0.0,
                threatType: "unknown",
                severity: 0,
                indicators: ["No se pudo leer el archivo"],
                recommendedAction: "skip"
            )
        }
        
        // Extraer características del archivo
        let features = featureExtractor.extractFeatures(from: fileData)
        
        // Detectar anomalías
        let anomalyScore = anomalyDetector.detectAnomalies(features: features)
        
        // Analizar patrones de amenazas
        let patternMatches = analyzeThreatPatterns(fileData: fileData)
        
        // Clasificar usando IA
        let classification = performMLClassification(
            features: features,
            patternMatches: patternMatches,
            anomalyScore: anomalyScore
        )
        
        return classification
    }
    
    // Analizar patrones de amenazas en el archivo
    private func analyzeThreatPatterns(fileData: Data) -> [ThreatPattern] {
        let fileString = String(data: fileData, encoding: .utf8) ?? ""
        var matches: [ThreatPattern] = []
        
        for pattern in threatPatterns {
            if fileString.range(of: pattern.pattern, options: .regularExpression) != nil {
                matches.append(pattern)
            }
        }
        
        return matches
    }
    
    // Realizar clasificación con machine learning
    private func performMLClassification(
        features: FileFeatures,
        patternMatches: [ThreatPattern],
        anomalyScore: Double
    ) -> ThreatClassification {
        
        // Calcular puntuación de amenaza
        let patternScore = Double(patternMatches.count) * 0.2
        let entropyScore = features.entropy > 7.0 ? 0.3 : 0.0
        let obfuscationScore = features.obfuscationScore * 0.4
        let anomalyScoreWeighted = anomalyScore * 0.3
        
        let totalScore = patternScore + entropyScore + obfuscationScore + anomalyScoreWeighted
        let confidence = min(totalScore, 1.0)
        
        // Determinar tipo de amenaza
        let threatType = determineThreatType(patternMatches: patternMatches, features: features)
        
        // Calcular severidad
        let severity = Int(confidence * 10)
        
        // Generar indicadores
        let indicators = generateIndicators(
            patternMatches: patternMatches,
            features: features,
            anomalyScore: anomalyScore
        )
        
        // Recomendar acción
        let recommendedAction = recommendAction(confidence: confidence, threatType: threatType)
        
        return ThreatClassification(
            isMalicious: confidence > 0.6,
            confidence: confidence,
            threatType: threatType,
            severity: severity,
            indicators: indicators,
            recommendedAction: recommendedAction
        )
    }
    
    // Determinar tipo de amenaza
    private func determineThreatType(patternMatches: [ThreatPattern], features: FileFeatures) -> String {
        if patternMatches.isEmpty {
            return "unknown"
        }
        
        // Contar categorías
        var categoryCounts: [String: Int] = [:]
        for pattern in patternMatches {
            categoryCounts[pattern.category, default: 0] += 1
        }
        
        // Retornar categoría más frecuente
        return categoryCounts.max(by: { $0.value < $1.value })?.key ?? "unknown"
    }
    
    // Generar indicadores de amenaza
    private func generateIndicators(
        patternMatches: [ThreatPattern],
        features: FileFeatures,
        anomalyScore: Double
    ) -> [String] {
        var indicators: [String] = []
        
        for pattern in patternMatches {
            indicators.append("Patrón detectado: \(pattern.name)")
        }
        
        if features.entropy > 7.0 {
            indicators.append("Entropía alta: \(String(format: "%.2f", features.entropy))")
        }
        
        if features.obfuscationScore > 0.5 {
            indicators.append("Ofuscación detectada: \(String(format: "%.2f", features.obfuscationScore))")
        }
        
        if anomalyScore > 0.7 {
            indicators.append("Anomalía detectada: \(String(format: "%.2f", anomalyScore))")
        }
        
        return indicators
    }
    
    // Recomendar acción basada en clasificación
    private func recommendAction(confidence: Double, threatType: String) -> String {
        if confidence > 0.8 {
            return "quarantine"
        } else if confidence > 0.6 {
            return "sandbox"
        } else if confidence > 0.4 {
            return "monitor"
        } else {
            return "allow"
        }
    }
    
    // Analizar comportamiento dinámico
    func analyzeBehavior(events: [String]) -> ThreatClassification {
        let behaviorFeatures = featureExtractor.extractBehaviorFeatures(events: events)
        let anomalyScore = anomalyDetector.detectBehaviorAnomalies(events: events)
        
        // Clasificar comportamiento
        let isSuspicious = anomalyScore > 0.6 || behaviorFeatures.suspiciousActions > 5
        
        return ThreatClassification(
            isMalicious: isSuspicious,
            confidence: anomalyScore,
            threatType: "behavioral",
            severity: Int(anomalyScore * 10),
            indicators: ["Análisis de comportamiento completado"],
            recommendedAction: isSuspicious ? "block" : "allow"
        )
    }
}

// Extractor de características
class FeatureExtractor {
    
    func extractFeatures(from data: Data) -> FileFeatures {
        let entropy = calculateEntropy(data: data)
        let fileSize = Int64(data.count)
        let stringCount = extractStringCount(data: data)
        let importCount = extractImportCount(data: data)
        let functionCount = extractFunctionCount(data: data)
        let suspiciousPatterns = extractSuspiciousPatterns(data: data)
        let encryptionIndicators = extractEncryptionIndicators(data: data)
        let networkIndicators = extractNetworkIndicators(data: data)
        let systemCallIndicators = extractSystemCallIndicators(data: data)
        let obfuscationScore = calculateObfuscationScore(data: data)
        
        return FileFeatures(
            entropy: entropy,
            fileSize: fileSize,
            stringCount: stringCount,
            importCount: importCount,
            functionCount: functionCount,
            suspiciousPatterns: suspiciousPatterns,
            encryptionIndicators: encryptionIndicators,
            networkIndicators: networkIndicators,
            systemCallIndicators: systemCallIndicators,
            obfuscationScore: obfuscationScore
        )
    }
    
    private func calculateEntropy(data: Data) -> Double {
        var byteCounts = Array(repeating: 0, count: 256)
        
        for byte in data {
            byteCounts[Int(byte)] += 1
        }
        
        var entropy = 0.0
        let dataSize = Double(data.count)
        
        for count in byteCounts {
            if count > 0 {
                let probability = Double(count) / dataSize
                entropy -= probability * log2(probability)
            }
        }
        
        return entropy
    }
    
    private func extractStringCount(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        return string.components(separatedBy: .whitespacesAndNewlines).count
    }
    
    private func extractImportCount(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        let importPattern = "import\\s+\\w+"
        let regex = try? NSRegularExpression(pattern: importPattern)
        return regex?.matches(in: string, range: NSRange(string.startIndex..., in: string)).count ?? 0
    }
    
    private func extractFunctionCount(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        let functionPattern = "def\\s+\\w+\\s*\\("
        let regex = try? NSRegularExpression(pattern: functionPattern)
        return regex?.matches(in: string, range: NSRange(string.startIndex..., in: string)).count ?? 0
    }
    
    private func extractSuspiciousPatterns(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        let suspiciousPatterns = [
            "eval\\s*\\(",
            "exec\\s*\\(",
            "os\\.system",
            "subprocess",
            "base64\\.b64decode",
            "__import__",
            "marshal",
            "compile\\s*\\("
        ]
        
        var count = 0
        for pattern in suspiciousPatterns {
            let regex = try? NSRegularExpression(pattern: pattern)
            count += regex?.matches(in: string, range: NSRange(string.startIndex..., in: string)).count ?? 0
        }
        
        return count
    }
    
    private func extractEncryptionIndicators(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        let encryptionPatterns = [
            "encrypt",
            "decrypt",
            "cipher",
            "hash",
            "md5",
            "sha",
            "aes",
            "rsa"
        ]
        
        var count = 0
        for pattern in encryptionPatterns {
            if string.lowercased().contains(pattern) {
                count += 1
            }
        }
        
        return count
    }
    
    private func extractNetworkIndicators(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        let networkPatterns = [
            "http://",
            "https://",
            "ftp://",
            "socket",
            "urllib",
            "requests"
        ]
        
        var count = 0
        for pattern in networkPatterns {
            if string.lowercased().contains(pattern) {
                count += 1
            }
        }
        
        return count
    }
    
    private func extractSystemCallIndicators(data: Data) -> Int {
        let string = String(data: data, encoding: .utf8) ?? ""
        let systemPatterns = [
            "system\\s*\\(",
            "popen",
            "fork",
            "exec",
            "spawn"
        ]
        
        var count = 0
        for pattern in systemPatterns {
            let regex = try? NSRegularExpression(pattern: pattern)
            count += regex?.matches(in: string, range: NSRange(string.startIndex..., in: string)).count ?? 0
        }
        
        return count
    }
    
    private func calculateObfuscationScore(data: Data) -> Double {
        let string = String(data: data, encoding: .utf8) ?? ""
        var score = 0.0
        
        // Detectar ofuscación
        if string.contains("\\x") { score += 0.3 }
        if string.contains("\\u") { score += 0.2 }
        if string.contains("base64") { score += 0.2 }
        if string.contains("rot13") { score += 0.1 }
        if string.contains("[::-1]") { score += 0.1 }
        
        return min(score, 1.0)
    }
    
    func extractBehaviorFeatures(events: [String]) -> (suspiciousActions: Int, anomalyScore: Double) {
        let suspiciousActions = events.filter { event in
            event.contains("delete") || event.contains("modify") || event.contains("access")
        }.count
        
        let anomalyScore = Double(suspiciousActions) / Double(events.count)
        
        return (suspiciousActions, anomalyScore)
    }
}

// Detector de anomalías
class AnomalyDetector {
    
    func detectAnomalies(features: FileFeatures) -> Double {
        var anomalyScore = 0.0
        
        // Anomalías basadas en características
        if features.entropy > 7.5 { anomalyScore += 0.3 }
        if features.fileSize > 100_000_000 { anomalyScore += 0.2 }
        if features.suspiciousPatterns > 5 { anomalyScore += 0.4 }
        if features.obfuscationScore > 0.5 { anomalyScore += 0.3 }
        
        return min(anomalyScore, 1.0)
    }
    
    func detectBehaviorAnomalies(events: [String]) -> Double {
        let suspiciousEvents = events.filter { event in
            event.contains("suspicious") || event.contains("anomaly") || event.contains("threat")
        }.count
        
        return Double(suspiciousEvents) / Double(events.count)
    }
}

// Función principal para integración con lucIA
func analyzeWithAISecurity(filePath: String) -> String {
    let classifier = AIThreatClassifier()
    let classification = classifier.classifyFile(filePath: filePath)
    
    return """
    Análisis IA completado:
    - Malicioso: \(classification.isMalicious)
    - Confianza: \(String(format: "%.2f", classification.confidence))
    - Tipo: \(classification.threatType)
    - Severidad: \(classification.severity)
    - Acción: \(classification.recommendedAction)
    """
} 