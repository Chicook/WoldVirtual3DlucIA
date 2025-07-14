package main

import (
	"bufio"
	"context"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// ============================================================================
// ESTRUCTURAS Y TIPOS
// ============================================================================

// CLIConfig representa la configuración del procesador Go CLI
type CLIConfig struct {
	MaxWorkers     int           `json:"max_workers"`
	Timeout        time.Duration `json:"timeout"`
	RetryAttempts  int           `json:"retry_attempts"`
	LogLevel       string        `json:"log_level"`
	CacheDir       string        `json:"cache_dir"`
	TemplatesDir   string        `json:"templates_dir"`
	ReportsDir     string        `json:"reports_dir"`
	WebhookURL     string        `json:"webhook_url"`
	APIKeys        map[string]string `json:"api_keys"`
}

// FileAnalysis representa el análisis de un archivo
type FileAnalysis struct {
	Path         string            `json:"path"`
	Size         int64             `json:"size"`
	Lines        int               `json:"lines"`
	Language     string            `json:"language"`
	Complexity   float64           `json:"complexity"`
	MD5Hash      string            `json:"md5_hash"`
	LastModified time.Time         `json:"last_modified"`
	Metadata     map[string]string `json:"metadata"`
}

// ProjectAnalysis representa el análisis completo de un proyecto
type ProjectAnalysis struct {
	ProjectPath   string                 `json:"project_path"`
	Timestamp     time.Time              `json:"timestamp"`
	Files         []FileAnalysis         `json:"files"`
	Languages     map[string]int         `json:"languages"`
	TotalFiles    int                    `json:"total_files"`
	TotalLines    int                    `json:"total_lines"`
	TotalSize     int64                  `json:"total_size"`
	Complexity    float64                `json:"complexity"`
	Recommendations []string             `json:"recommendations"`
	Errors        []string               `json:"errors"`
}

// CLIGoProcessor es el procesador principal de Go para CLI
type CLIGoProcessor struct {
	config      *CLIConfig
	logger      *log.Logger
	cache       map[string]interface{}
	mu          sync.RWMutex
	activeTasks map[string]context.CancelFunc
}

// ============================================================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================================================

// NewCLIConfig crea una nueva configuración por defecto
func NewCLIConfig() *CLIConfig {
	return &CLIConfig{
		MaxWorkers:    4,
		Timeout:       30 * time.Second,
		RetryAttempts: 3,
		LogLevel:      "info",
		CacheDir:      ".cli_cache",
		TemplatesDir:  "templates",
		ReportsDir:    "reports",
		APIKeys:       make(map[string]string),
	}
}

// NewCLIGoProcessor crea una nueva instancia del procesador
func NewCLIGoProcessor(config *CLIConfig) *CLIGoProcessor {
	if config == nil {
		config = NewCLIConfig()
	}

	processor := &CLIGoProcessor{
		config:      config,
		logger:      log.New(os.Stdout, "[CLI-GO] ", log.LstdFlags),
		cache:       make(map[string]interface{}),
		activeTasks: make(map[string]context.CancelFunc),
	}

	processor.setupDirectories()
	return processor
}

// setupDirectories configura los directorios necesarios
func (p *CLIGoProcessor) setupDirectories() {
	directories := []string{
		p.config.CacheDir,
		p.config.TemplatesDir,
		p.config.ReportsDir,
	}

	for _, dir := range directories {
		if err := os.MkdirAll(dir, 0755); err != nil {
			p.logger.Printf("Error creando directorio %s: %v", dir, err)
		} else {
			p.logger.Printf("Directorio configurado: %s", dir)
		}
	}
}

// ============================================================================
// FUNCIONES DE ANÁLISIS DE PROYECTO
// ============================================================================

// AnalyzeProject analiza la estructura completa de un proyecto
func (p *CLIGoProcessor) AnalyzeProject(projectPath string) (*ProjectAnalysis, error) {
	p.logger.Printf("Analizando proyecto: %s", projectPath)

	analysis := &ProjectAnalysis{
		ProjectPath:   projectPath,
		Timestamp:     time.Now(),
		Files:         []FileAnalysis{},
		Languages:     make(map[string]int),
		Recommendations: []string{},
		Errors:        []string{},
	}

	// Analizar archivos concurrentemente
	files, err := p.scanFiles(projectPath)
	if err != nil {
		analysis.Errors = append(analysis.Errors, fmt.Sprintf("Error escaneando archivos: %v", err))
		return analysis, err
	}

	// Procesar archivos con workers
	fileChan := make(chan string, len(files))
	resultChan := make(chan FileAnalysis, len(files))
	
	// Iniciar workers
	var wg sync.WaitGroup
	for i := 0; i < p.config.MaxWorkers; i++ {
		wg.Add(1)
		go p.fileWorker(&wg, fileChan, resultChan)
	}

	// Enviar archivos a procesar
	go func() {
		defer close(fileChan)
		for _, file := range files {
			fileChan <- file
		}
	}()

	// Recolectar resultados
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// Procesar resultados
	for fileAnalysis := range resultChan {
		analysis.Files = append(analysis.Files, fileAnalysis)
		analysis.TotalFiles++
		analysis.TotalLines += fileAnalysis.Lines
		analysis.TotalSize += fileAnalysis.Size
		analysis.Languages[fileAnalysis.Language]++
	}

	// Calcular complejidad total
	analysis.Complexity = p.calculateProjectComplexity(analysis.Files)

	// Generar recomendaciones
	analysis.Recommendations = p.generateRecommendations(analysis)

	// Guardar en caché
	p.mu.Lock()
	p.cache[fmt.Sprintf("analysis_%s", projectPath)] = analysis
	p.mu.Unlock()

	p.logger.Printf("Análisis completado: %d archivos, %d líneas", analysis.TotalFiles, analysis.TotalLines)
	return analysis, nil
}

// scanFiles escanea recursivamente todos los archivos del proyecto
func (p *CLIGoProcessor) scanFiles(root string) ([]string, error) {
	var files []string
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && p.isCodeFile(path) {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}

// isCodeFile determina si un archivo es de código
func (p *CLIGoProcessor) isCodeFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	codeExtensions := map[string]bool{
		".go": true, ".js": true, ".ts": true, ".py": true, ".java": true,
		".cpp": true, ".c": true, ".php": true, ".rb": true, ".swift": true,
		".kt": true, ".rs": true, ".cs": true, ".scala": true,
	}
	return codeExtensions[ext]
}

// fileWorker procesa archivos individuales
func (p *CLIGoProcessor) fileWorker(wg *sync.WaitGroup, fileChan <-chan string, resultChan chan<- FileAnalysis) {
	defer wg.Done()
	
	for filePath := range fileChan {
		analysis, err := p.analyzeFile(filePath)
		if err != nil {
			p.logger.Printf("Error analizando archivo %s: %v", filePath, err)
			continue
		}
		resultChan <- analysis
	}
}

// analyzeFile analiza un archivo individual
func (p *CLIGoProcessor) analyzeFile(filePath string) (FileAnalysis, error) {
	analysis := FileAnalysis{
		Path:         filePath,
		Language:     p.getLanguageFromExtension(filepath.Ext(filePath)),
		Metadata:     make(map[string]string),
	}

	// Obtener información del archivo
	info, err := os.Stat(filePath)
	if err != nil {
		return analysis, err
	}

	analysis.Size = info.Size()
	analysis.LastModified = info.ModTime()

	// Calcular MD5 hash
	hash, err := p.calculateMD5(filePath)
	if err != nil {
		return analysis, err
	}
	analysis.MD5Hash = hash

	// Contar líneas y calcular complejidad
	lines, complexity, err := p.analyzeFileContent(filePath)
	if err != nil {
		return analysis, err
	}

	analysis.Lines = lines
	analysis.Complexity = complexity

	return analysis, nil
}

// calculateMD5 calcula el hash MD5 de un archivo
func (p *CLIGoProcessor) calculateMD5(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

// analyzeFileContent analiza el contenido de un archivo
func (p *CLIGoProcessor) analyzeFileContent(filePath string) (int, float64, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, 0, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lines := 0
	complexity := 0.0

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		lines++

		// Calcular complejidad basada en patrones
		if strings.Contains(line, "if ") || strings.Contains(line, "for ") || strings.Contains(line, "while ") {
			complexity += 1.0
		}
		if strings.Contains(line, "switch ") || strings.Contains(line, "case ") {
			complexity += 0.5
		}
		if strings.Contains(line, "try ") || strings.Contains(line, "catch ") {
			complexity += 0.8
		}
		if strings.Contains(line, "async ") || strings.Contains(line, "await ") {
			complexity += 0.3
		}
	}

	return lines, complexity, scanner.Err()
}

// getLanguageFromExtension obtiene el lenguaje desde la extensión
func (p *CLIGoProcessor) getLanguageFromExtension(ext string) string {
	ext = strings.ToLower(ext)
	languageMap := map[string]string{
		".go": "Go", ".js": "JavaScript", ".ts": "TypeScript", ".py": "Python",
		".java": "Java", ".cpp": "C++", ".c": "C", ".php": "PHP",
		".rb": "Ruby", ".swift": "Swift", ".kt": "Kotlin", ".rs": "Rust",
		".cs": "C#", ".scala": "Scala",
	}
	
	if lang, exists := languageMap[ext]; exists {
		return lang
	}
	return "Unknown"
}

// calculateProjectComplexity calcula la complejidad total del proyecto
func (p *CLIGoProcessor) calculateProjectComplexity(files []FileAnalysis) float64 {
	if len(files) == 0 {
		return 0.0
	}

	totalComplexity := 0.0
	for _, file := range files {
		totalComplexity += file.Complexity
	}

	return totalComplexity / float64(len(files))
}

// generateRecommendations genera recomendaciones basadas en el análisis
func (p *CLIGoProcessor) generateRecommendations(analysis *ProjectAnalysis) []string {
	var recommendations []string

	// Recomendaciones basadas en distribución de lenguajes
	for language, count := range analysis.Languages {
		if count > 100 {
			recommendations = append(recommendations, 
				fmt.Sprintf("Considerar distribución en múltiples lenguajes: %s tiene %d archivos", language, count))
		}
	}

	// Recomendaciones basadas en complejidad
	if analysis.Complexity > 5.0 {
		recommendations = append(recommendations, 
			"Complejidad alta detectada - considerar refactorización y modularización")
	}

	// Recomendaciones basadas en tamaño
	if analysis.TotalFiles > 1000 {
		recommendations = append(recommendations, 
			"Proyecto grande detectado - considerar arquitectura modular")
	}

	return recommendations
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

// SaveAnalysis guarda el análisis en formato JSON
func (p *CLIGoProcessor) SaveAnalysis(analysis *ProjectAnalysis, format string) error {
	filename := fmt.Sprintf("analysis_%s.%s", 
		time.Now().Format("20060102_150405"), format)
	
	filepath := filepath.Join(p.config.ReportsDir, filename)
	
	file, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	
	return encoder.Encode(analysis)
}

// GetStatus obtiene el estado actual del procesador
func (p *CLIGoProcessor) GetStatus() map[string]interface{} {
	p.mu.RLock()
	defer p.mu.RUnlock()

	return map[string]interface{}{
		"go_version":    "1.21+",
		"config":        p.config,
		"active_tasks":  len(p.activeTasks),
		"cache_size":    len(p.cache),
		"uptime":        time.Since(time.Now()).String(),
	}
}

// CleanupCache limpia el caché antiguo
func (p *CLIGoProcessor) CleanupCache(olderThanDays int) (int, error) {
	p.logger.Printf("Limpiando caché más antiguo que %d días", olderThanDays)
	
	cacheDir := p.config.CacheDir
	entries, err := os.ReadDir(cacheDir)
	if err != nil {
		return 0, err
	}

	deletedCount := 0
	cutoffTime := time.Now().AddDate(0, 0, -olderThanDays)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoffTime) {
			filepath := filepath.Join(cacheDir, entry.Name())
			if err := os.Remove(filepath); err == nil {
				deletedCount++
			}
		}
	}

	p.logger.Printf("Archivos eliminados del caché: %d", deletedCount)
	return deletedCount, nil
}

// ============================================================================
// FUNCIÓN PRINCIPAL PARA TESTING
// ============================================================================

func main() {
	processor := NewCLIGoProcessor(nil)
	
	// Ejemplo de uso
	projectPath := "."
	analysis, err := processor.AnalyzeProject(projectPath)
	if err != nil {
		log.Fatalf("Error analizando proyecto: %v", err)
	}

	// Guardar análisis
	if err := processor.SaveAnalysis(analysis, "json"); err != nil {
		log.Printf("Error guardando análisis: %v", err)
	}

	// Limpiar caché
	deleted, err := processor.CleanupCache(7)
	if err != nil {
		log.Printf("Error limpiando caché: %v", err)
	} else {
		log.Printf("Archivos eliminados del caché: %d", deleted)
	}

	// Mostrar estado
	status := processor.GetStatus()
	statusJSON, _ := json.MarshalIndent(status, "", "  ")
	fmt.Printf("Estado del procesador:\n%s\n", statusJSON)
} 