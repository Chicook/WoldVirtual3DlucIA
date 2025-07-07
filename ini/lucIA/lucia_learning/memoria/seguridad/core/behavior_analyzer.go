// behavior_analyzer.go
// Analizador de comportamiento para lucIA
// Detecta patrones anómalos en comportamiento del sistema y usuarios

package main

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
	"math"
)

// Evento de comportamiento del sistema
type BehaviorEvent struct {
	Timestamp   time.Time `json:"timestamp"`
	EventType   string    `json:"event_type"`
	UserID      string    `json:"user_id"`
	Resource    string    `json:"resource"`
	Action      string    `json:"action"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	Success     bool      `json:"success"`
	Duration    float64   `json:"duration"`
	DataSize    int64     `json:"data_size"`
}

// Anomalía detectada
type Anomaly struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Severity    int       `json:"severity"` // 1-10
	Description string    `json:"description"`
	UserID      string    `json:"user_id"`
	Timestamp   time.Time `json:"timestamp"`
	Evidence    []string  `json:"evidence"`
	Confidence  float64   `json:"confidence"`
}

// Perfil de comportamiento del usuario
type UserProfile struct {
	UserID           string                 `json:"user_id"`
	LoginTimes       []time.Time            `json:"login_times"`
	ResourceAccess   map[string]int         `json:"resource_access"`
	ActionPatterns   map[string]int         `json:"action_patterns"`
	IPAddresses      map[string]int         `json:"ip_addresses"`
	SessionDuration  []float64              `json:"session_duration"`
	FailedAttempts   int                    `json:"failed_attempts"`
	LastUpdate       time.Time              `json:"last_update"`
	RiskScore        float64                `json:"risk_score"`
	AnomalyHistory   []Anomaly              `json:"anomaly_history"`
}

// Analizador de comportamiento
type BehaviorAnalyzer struct {
	userProfiles map[string]*UserProfile
	anomalies    []Anomaly
	mu           sync.RWMutex
	config       BehaviorConfig
}

// Configuración del analizador
type BehaviorConfig struct {
	MaxFailedAttempts    int     `json:"max_failed_attempts"`
	AnomalyThreshold     float64 `json:"anomaly_threshold"`
	SessionTimeout       float64 `json:"session_timeout"`
	MaxResourceAccess    int     `json:"max_resource_access"`
	GeographicAnomaly    bool    `json:"geographic_anomaly"`
	TimeAnomaly          bool    `json:"time_anomaly"`
}

// Crear nuevo analizador
func NewBehaviorAnalyzer(config BehaviorConfig) *BehaviorAnalyzer {
	return &BehaviorAnalyzer{
		userProfiles: make(map[string]*UserProfile),
		anomalies:    make([]Anomaly, 0),
		config:       config,
	}
}

// Analizar evento de comportamiento
func (ba *BehaviorAnalyzer) AnalyzeEvent(event BehaviorEvent) *Anomaly {
	ba.mu.Lock()
	defer ba.mu.Unlock()

	// Obtener o crear perfil de usuario
	profile := ba.getOrCreateProfile(event.UserID)
	
	// Actualizar perfil con el evento
	ba.updateProfile(profile, event)
	
	// Detectar anomalías
	anomaly := ba.detectAnomalies(profile, event)
	
	if anomaly != nil {
		ba.anomalies = append(ba.anomalies, *anomaly)
		profile.AnomalyHistory = append(profile.AnomalyHistory, *anomaly)
	}
	
	return anomaly
}

// Obtener o crear perfil de usuario
func (ba *BehaviorAnalyzer) getOrCreateProfile(userID string) *UserProfile {
	if profile, exists := ba.userProfiles[userID]; exists {
		return profile
	}
	
	profile := &UserProfile{
		UserID:         userID,
		LoginTimes:     make([]time.Time, 0),
		ResourceAccess: make(map[string]int),
		ActionPatterns: make(map[string]int),
		IPAddresses:    make(map[string]int),
		SessionDuration: make([]float64, 0),
		FailedAttempts: 0,
		LastUpdate:     time.Now(),
		RiskScore:      0.0,
		AnomalyHistory: make([]Anomaly, 0),
	}
	
	ba.userProfiles[userID] = profile
	return profile
}

// Actualizar perfil con evento
func (ba *BehaviorAnalyzer) updateProfile(profile *UserProfile, event BehaviorEvent) {
	profile.LastUpdate = time.Now()
	
	// Actualizar intentos fallidos
	if !event.Success {
		profile.FailedAttempts++
	} else {
		profile.FailedAttempts = 0
	}
	
	// Actualizar acceso a recursos
	profile.ResourceAccess[event.Resource]++
	
	// Actualizar patrones de acción
	profile.ActionPatterns[event.Action]++
	
	// Actualizar direcciones IP
	profile.IPAddresses[event.IPAddress]++
	
	// Actualizar duración de sesión
	if event.Duration > 0 {
		profile.SessionDuration = append(profile.SessionDuration, event.Duration)
	}
	
	// Mantener solo las últimas 100 duraciones
	if len(profile.SessionDuration) > 100 {
		profile.SessionDuration = profile.SessionDuration[1:]
	}
}

// Detectar anomalías
func (ba *BehaviorAnalyzer) detectAnomalies(profile *UserProfile, event BehaviorEvent) *Anomaly {
	anomalies := make([]Anomaly, 0)
	
	// 1. Detectar intentos fallidos excesivos
	if profile.FailedAttempts > ba.config.MaxFailedAttempts {
		anomalies = append(anomalies, Anomaly{
			ID:          fmt.Sprintf("failed_attempts_%s_%d", event.UserID, time.Now().Unix()),
			Type:        "EXCESSIVE_FAILED_ATTEMPTS",
			Severity:    8,
			Description: fmt.Sprintf("Demasiados intentos fallidos: %d", profile.FailedAttempts),
			UserID:      event.UserID,
			Timestamp:   event.Timestamp,
			Evidence:    []string{fmt.Sprintf("Intentos fallidos: %d", profile.FailedAttempts)},
			Confidence:  0.9,
		})
	}
	
	// 2. Detectar acceso anómalo a recursos
	if profile.ResourceAccess[event.Resource] > ba.config.MaxResourceAccess {
		anomalies = append(anomalies, Anomaly{
			ID:          fmt.Sprintf("resource_access_%s_%d", event.UserID, time.Now().Unix()),
			Type:        "EXCESSIVE_RESOURCE_ACCESS",
			Severity:    6,
			Description: fmt.Sprintf("Acceso excesivo al recurso: %s", event.Resource),
			UserID:      event.UserID,
			Timestamp:   event.Timestamp,
			Evidence:    []string{fmt.Sprintf("Accesos a %s: %d", event.Resource, profile.ResourceAccess[event.Resource])},
			Confidence:  0.8,
		})
	}
	
	// 3. Detectar IP anómala
	if ba.detectIPAnomaly(profile, event.IPAddress) {
		anomalies = append(anomalies, Anomaly{
			ID:          fmt.Sprintf("ip_anomaly_%s_%d", event.UserID, time.Now().Unix()),
			Type:        "IP_ANOMALY",
			Severity:    7,
			Description: fmt.Sprintf("Acceso desde IP inusual: %s", event.IPAddress),
			UserID:      event.UserID,
			Timestamp:   event.Timestamp,
			Evidence:    []string{fmt.Sprintf("IP inusual: %s", event.IPAddress)},
			Confidence:  0.7,
		})
	}
	
	// 4. Detectar horario anómalo
	if ba.detectTimeAnomaly(profile, event.Timestamp) {
		anomalies = append(anomalies, Anomaly{
			ID:          fmt.Sprintf("time_anomaly_%s_%d", event.UserID, time.Now().Unix()),
			Type:        "TIME_ANOMALY",
			Severity:    5,
			Description: "Acceso en horario inusual",
			UserID:      event.UserID,
			Timestamp:   event.Timestamp,
			Evidence:    []string{fmt.Sprintf("Hora de acceso: %s", event.Timestamp.Format("15:04"))},
			Confidence:  0.6,
		})
	}
	
	// 5. Detectar comportamiento de bot
	if ba.detectBotBehavior(profile, event) {
		anomalies = append(anomalies, Anomaly{
			ID:          fmt.Sprintf("bot_behavior_%s_%d", event.UserID, time.Now().Unix()),
			Type:        "BOT_BEHAVIOR",
			Severity:    9,
			Description: "Comportamiento similar a bot detectado",
			UserID:      event.UserID,
			Timestamp:   event.Timestamp,
			Evidence:    []string{"Patrones de comportamiento automatizado"},
			Confidence:  0.85,
		})
	}
	
	// Retornar la anomalía más severa
	if len(anomalies) > 0 {
		maxSeverity := 0
		var maxAnomaly Anomaly
		for _, anomaly := range anomalies {
			if anomaly.Severity > maxSeverity {
				maxSeverity = anomaly.Severity
				maxAnomaly = anomaly
			}
		}
		return &maxAnomaly
	}
	
	return nil
}

// Detectar anomalía de IP
func (ba *BehaviorAnalyzer) detectIPAnomaly(profile *UserProfile, ip string) bool {
	if !ba.config.GeographicAnomaly {
		return false
	}
	
	// Lógica simplificada: si es una IP nueva y el usuario tiene muchas IPs previas
	if profile.IPAddresses[ip] == 0 && len(profile.IPAddresses) > 5 {
		return true
	}
	
	return false
}

// Detectar anomalía de tiempo
func (ba *BehaviorAnalyzer) detectTimeAnomaly(profile *UserProfile, timestamp time.Time) bool {
	if !ba.config.TimeAnomaly {
		return false
	}
	
	hour := timestamp.Hour()
	
	// Horario inusual: entre 2 AM y 6 AM
	if hour >= 2 && hour <= 6 {
		return true
	}
	
	return false
}

// Detectar comportamiento de bot
func (ba *BehaviorAnalyzer) detectBotBehavior(profile *UserProfile, event BehaviorEvent) bool {
	// Lógica simplificada para detectar bots
	// En implementación real usaría análisis más sofisticado
	
	// 1. Muchas acciones en poco tiempo
	if len(profile.ActionPatterns) > 20 {
		return true
	}
	
	// 2. User-Agent sospechoso
	if event.UserAgent == "" || len(event.UserAgent) < 10 {
		return true
	}
	
	// 3. Patrones de tiempo muy regulares
	if len(profile.LoginTimes) > 10 {
		intervals := make([]float64, 0)
		for i := 1; i < len(profile.LoginTimes); i++ {
			interval := profile.LoginTimes[i].Sub(profile.LoginTimes[i-1]).Seconds()
			intervals = append(intervals, interval)
		}
		
		// Calcular varianza de intervalos
		if len(intervals) > 5 {
			mean := 0.0
			for _, interval := range intervals {
				mean += interval
			}
			mean /= float64(len(intervals))
			
			variance := 0.0
			for _, interval := range intervals {
				variance += math.Pow(interval-mean, 2)
			}
			variance /= float64(len(intervals))
			
			// Si la varianza es muy baja, es un bot
			if variance < 1.0 {
				return true
			}
		}
	}
	
	return false
}

// Obtener estadísticas
func (ba *BehaviorAnalyzer) GetStats() map[string]interface{} {
	ba.mu.RLock()
	defer ba.mu.RUnlock()
	
	stats := make(map[string]interface{})
	stats["total_users"] = len(ba.userProfiles)
	stats["total_anomalies"] = len(ba.anomalies)
	
	// Calcular riesgo promedio
	totalRisk := 0.0
	for _, profile := range ba.userProfiles {
		totalRisk += profile.RiskScore
	}
	if len(ba.userProfiles) > 0 {
		stats["average_risk_score"] = totalRisk / float64(len(ba.userProfiles))
	}
	
	return stats
}

// Función principal para integración con lucIA
func AnalyzeBehaviorSecurity() string {
	config := BehaviorConfig{
		MaxFailedAttempts: 5,
		AnomalyThreshold:  0.7,
		SessionTimeout:    3600.0,
		MaxResourceAccess: 100,
		GeographicAnomaly: true,
		TimeAnomaly:       true,
	}
	
	analyzer := NewBehaviorAnalyzer(config)
	
	// Simular eventos
	mockEvent := BehaviorEvent{
		Timestamp: time.Now(),
		EventType: "LOGIN",
		UserID:    "user123",
		Resource:  "/api/admin",
		Action:    "GET",
		IPAddress: "192.168.1.100",
		UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
		Success:   true,
		Duration:  1.5,
		DataSize:  1024,
	}
	
	anomaly := analyzer.AnalyzeEvent(mockEvent)
	stats := analyzer.GetStats()
	
	if anomaly != nil {
		return fmt.Sprintf("Anomalía detectada: %s (Severidad: %d)", anomaly.Type, anomaly.Severity)
	}
	
	return fmt.Sprintf("Análisis completado. Usuarios: %v, Anomalías: %v", 
		stats["total_users"], stats["total_anomalies"])
}

func main() {
	result := AnalyzeBehaviorSecurity()
	fmt.Println(result)
} 