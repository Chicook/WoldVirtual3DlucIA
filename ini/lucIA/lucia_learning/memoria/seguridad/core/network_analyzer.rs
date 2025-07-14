// network_analyzer.rs
// Analizador de red de alta velocidad para lucIA
// Detecta tráfico sospechoso, conexiones anómalas y ataques de red

use std::collections::HashMap;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct NetworkConnection {
    pub source_ip: IpAddr,
    pub dest_ip: IpAddr,
    pub source_port: u16,
    pub dest_port: u16,
    pub protocol: String,
    pub timestamp: u64,
    pub packet_count: u32,
    pub byte_count: u64,
}

#[derive(Debug, Clone)]
pub struct SecurityAlert {
    pub alert_type: String,
    pub severity: u8, // 1-10
    pub description: String,
    pub source_ip: IpAddr,
    pub timestamp: u64,
    pub evidence: Vec<String>,
}

pub struct NetworkAnalyzer {
    connections: HashMap<String, NetworkConnection>,
    alerts: Vec<SecurityAlert>,
    suspicious_ips: Vec<IpAddr>,
    rate_limits: HashMap<IpAddr, u32>,
}

impl NetworkAnalyzer {
    pub fn new() -> Self {
        NetworkAnalyzer {
            connections: HashMap::new(),
            alerts: Vec::new(),
            suspicious_ips: Vec::new(),
            rate_limits: HashMap::new(),
        }
    }

    // Detectar conexiones sospechosas
    pub fn analyze_connection(&mut self, conn: NetworkConnection) -> Option<SecurityAlert> {
        let conn_key = format!("{}:{}->{}:{}", 
            conn.source_ip, conn.source_port, conn.dest_ip, conn.dest_port);
        
        // Verificar si es una IP sospechosa
        if self.suspicious_ips.contains(&conn.source_ip) {
            return Some(SecurityAlert {
                alert_type: "SUSPICIOUS_IP".to_string(),
                severity: 8,
                description: format!("Conexión desde IP sospechosa: {}", conn.source_ip),
                source_ip: conn.source_ip,
                timestamp: conn.timestamp,
                evidence: vec![format!("IP en lista negra: {}", conn.source_ip)],
            });
        }

        // Detectar rate limiting
        let current_rate = self.rate_limits.entry(conn.source_ip).or_insert(0);
        *current_rate += 1;
        
        if *current_rate > 100 { // Más de 100 conexiones por minuto
            return Some(SecurityAlert {
                alert_type: "RATE_LIMIT_EXCEEDED".to_string(),
                severity: 7,
                description: format!("Demasiadas conexiones desde: {}", conn.source_ip),
                source_ip: conn.source_ip,
                timestamp: conn.timestamp,
                evidence: vec![format!("Rate: {} conexiones/min", *current_rate)],
            });
        }

        // Detectar puertos sospechosos
        if self.is_suspicious_port(conn.dest_port) {
            return Some(SecurityAlert {
                alert_type: "SUSPICIOUS_PORT".to_string(),
                severity: 6,
                description: format!("Conexión a puerto sospechoso: {}", conn.dest_port),
                source_ip: conn.source_ip,
                timestamp: conn.timestamp,
                evidence: vec![format!("Puerto: {}", conn.dest_port)],
            });
        }

        // Detectar patrones de DDoS
        if self.detect_ddos_pattern(&conn) {
            return Some(SecurityAlert {
                alert_type: "DDOS_ATTEMPT".to_string(),
                severity: 9,
                description: "Posible intento de DDoS detectado".to_string(),
                source_ip: conn.source_ip,
                timestamp: conn.timestamp,
                evidence: vec!["Patrón de tráfico anómalo".to_string()],
            });
        }

        self.connections.insert(conn_key, conn);
        None
    }

    fn is_suspicious_port(&self, port: u16) -> bool {
        // Puertos comúnmente usados para ataques
        matches!(port, 
            22 | 23 | 25 | 53 | 80 | 443 | 1433 | 3306 | 3389 | 5432 | 6379 | 8080
        )
    }

    fn detect_ddos_pattern(&self, conn: &NetworkConnection) -> bool {
        // Lógica simplificada para detectar DDoS
        // En implementación real usaría análisis más sofisticado
        conn.packet_count > 1000 || conn.byte_count > 1_000_000
    }

    // Analizar tráfico en tiempo real
    pub fn analyze_traffic(&mut self, packets: Vec<NetworkConnection>) -> Vec<SecurityAlert> {
        let mut new_alerts = Vec::new();
        
        for packet in packets {
            if let Some(alert) = self.analyze_connection(packet) {
                new_alerts.push(alert);
            }
        }
        
        new_alerts
    }

    // Obtener estadísticas de seguridad
    pub fn get_security_stats(&self) -> HashMap<String, u32> {
        let mut stats = HashMap::new();
        stats.insert("total_connections".to_string(), self.connections.len() as u32);
        stats.insert("total_alerts".to_string(), self.alerts.len() as u32);
        stats.insert("suspicious_ips".to_string(), self.suspicious_ips.len() as u32);
        stats
    }

    // Añadir IP a lista sospechosa
    pub fn add_suspicious_ip(&mut self, ip: IpAddr) {
        if !self.suspicious_ips.contains(&ip) {
            self.suspicious_ips.push(ip);
        }
    }

    // Limpiar datos antiguos
    pub fn cleanup_old_data(&mut self, max_age: u64) {
        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        self.connections.retain(|_, conn| {
            current_time - conn.timestamp < max_age
        });
    }
}

// Función principal para integración con lucIA
pub fn analyze_network_security() -> String {
    let mut analyzer = NetworkAnalyzer::new();
    
    // Simular análisis de tráfico
    let mock_connections = vec![
        NetworkConnection {
            source_ip: IpAddr::V4(Ipv4Addr::new(192, 168, 1, 100)),
            dest_ip: IpAddr::V4(Ipv4Addr::new(10, 0, 0, 1)),
            source_port: 12345,
            dest_port: 80,
            protocol: "TCP".to_string(),
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
            packet_count: 50,
            byte_count: 5000,
        }
    ];
    
    let alerts = analyzer.analyze_traffic(mock_connections);
    let stats = analyzer.get_security_stats();
    
    format!("Análisis completado. Alertas: {}, Conexiones: {}", 
        alerts.len(), stats["total_connections"])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_suspicious_port_detection() {
        let analyzer = NetworkAnalyzer::new();
        assert!(analyzer.is_suspicious_port(22)); // SSH
        assert!(analyzer.is_suspicious_port(80)); // HTTP
        assert!(!analyzer.is_suspicious_port(8080)); // Puerto común
    }
} 