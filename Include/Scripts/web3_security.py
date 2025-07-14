#!/usr/bin/env python3
"""
Sistema de Seguridad Web3 para Metaverso Crypto World Virtual 3D
Protecciones específicas para blockchain, wallets, NFTs y contratos inteligentes
"""

import json
import logging
import argparse
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path
import hashlib
import hmac
import secrets

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class Web3Security:
    """Sistema de seguridad Web3 para el metaverso"""
    
    def __init__(self, config_path: str = "../metaverse_security.json"):
        self.config_path = Path(config_path)
        self.config = self.load_config()
        self.blocked_addresses = set()
        self.suspicious_contracts = set()
        self.frozen_wallets = set()
        
        # Métricas de seguridad
        self.security_metrics = {
            "transactions_blocked": 0,
            "contracts_audited": 0,
            "wallets_frozen": 0,
            "attacks_prevented": 0,
            "mev_detected": 0,
            "flash_loans_blocked": 0
        }
        
        logging.info("🔗 Sistema de Seguridad Web3 iniciado")
    
    def load_config(self) -> Dict[str, Any]:
        """Cargar configuración de seguridad"""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            logging.info("✅ Configuración Web3 cargada")
            return config
        except Exception as e:
            logging.error(f"❌ Error cargando configuración: {e}")
            return {}
    
    async def check_blockchain_connection(self) -> bool:
        """Verificar conectividad con blockchain"""
        logging.info("🔍 Verificando conectividad blockchain...")
        
        # Endpoints de prueba
        test_endpoints = [
            "https://mainnet.infura.io/v3/",
            "https://polygon-rpc.com",
            "https://bsc-dataseed.binance.org"
        ]
        
        for endpoint in test_endpoints:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        endpoint,
                        json={"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1},
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        if response.status == 200:
                            logging.info(f"✅ Conectividad verificada: {endpoint}")
                            return True
            except Exception as e:
                logging.warning(f"⚠️ Error conectando a {endpoint}: {e}")
        
        logging.error("❌ No se pudo conectar a ningún endpoint blockchain")
        return False
    
    def setup_secure_wallet(self, wallet_type: str = "multisig") -> Dict[str, Any]:
        """Configurar wallet seguro"""
        logging.info(f"🔐 Configurando wallet seguro tipo: {wallet_type}")
        
        wallet_config = {
            "type": wallet_type,
            "created_at": datetime.now().isoformat(),
            "security_level": "high",
            "features": []
        }
        
        if wallet_type == "multisig":
            wallet_config["features"] = [
                "multi_signature",
                "timeout_protection",
                "cold_storage",
                "backup_encryption"
            ]
            wallet_config["min_signers"] = self.config.get("blockchain_security", {}).get("wallets", {}).get("min_signers", 2)
            wallet_config["max_signers"] = self.config.get("blockchain_security", {}).get("wallets", {}).get("max_signers", 5)
        
        elif wallet_type == "hardware":
            wallet_config["features"] = [
                "hardware_security",
                "offline_storage",
                "pin_protection",
                "backup_phrase"
            ]
        
        logging.info("✅ Wallet seguro configurado")
        return wallet_config
    
    async def audit_smart_contract(self, contract_address: str, contract_abi: List[Dict]) -> Dict[str, Any]:
        """Auditar contrato inteligente"""
        logging.info(f"🔍 Auditando contrato: {contract_address}")
        
        audit_result = {
            "contract_address": contract_address,
            "audit_date": datetime.now().isoformat(),
            "security_score": 0,
            "vulnerabilities": [],
            "recommendations": [],
            "is_safe": False
        }
        
        # Verificar funciones peligrosas
        dangerous_functions = [
            "delegatecall", "selfdestruct", "suicide", "call", "send", "transfer"
        ]
        
        for function in contract_abi:
            if function.get("type") == "function":
                function_name = function.get("name", "").lower()
                for dangerous in dangerous_functions:
                    if dangerous in function_name:
                        audit_result["vulnerabilities"].append(f"Función peligrosa: {function_name}")
                        audit_result["security_score"] -= 10
        
        # Verificar reentrancy
        if self._check_reentrancy_vulnerability(contract_abi):
            audit_result["vulnerabilities"].append("Vulnerabilidad de reentrancy detectada")
            audit_result["security_score"] -= 20
        
        # Verificar access control
        if not self._check_access_control(contract_abi):
            audit_result["vulnerabilities"].append("Falta control de acceso")
            audit_result["security_score"] -= 15
        
        # Verificar overflow/underflow
        if self._check_overflow_vulnerability(contract_abi):
            audit_result["vulnerabilities"].append("Posible overflow/underflow")
            audit_result["security_score"] -= 10
        
        # Calcular score final
        audit_result["security_score"] = max(0, audit_result["security_score"] + 50)
        audit_result["is_safe"] = audit_result["security_score"] >= 70
        
        if audit_result["is_safe"]:
            logging.info(f"✅ Contrato seguro: {contract_address}")
        else:
            logging.warning(f"⚠️ Contrato inseguro: {contract_address}")
            self.suspicious_contracts.add(contract_address)
        
        return audit_result
    
    def _check_reentrancy_vulnerability(self, contract_abi: List[Dict]) -> bool:
        """Verificar vulnerabilidad de reentrancy"""
        # Implementar lógica de detección de reentrancy
        return False
    
    def _check_access_control(self, contract_abi: List[Dict]) -> bool:
        """Verificar control de acceso"""
        # Buscar funciones de control de acceso
        access_control_functions = ["onlyOwner", "onlyAdmin", "onlyAuthorized"]
        return any(func.get("name") in access_control_functions for func in contract_abi)
    
    def _check_overflow_vulnerability(self, contract_abi: List[Dict]) -> bool:
        """Verificar vulnerabilidades de overflow"""
        # Implementar detección de overflow
        return False
    
    async def validate_nft_metadata(self, metadata_uri: str) -> Dict[str, Any]:
        """Validar metadata de NFT"""
        logging.info(f"🔍 Validando metadata NFT: {metadata_uri}")
        
        validation_result = {
            "metadata_uri": metadata_uri,
            "validation_date": datetime.now().isoformat(),
            "is_valid": False,
            "issues": [],
            "recommendations": []
        }
        
        try:
            # Verificar URI
            if not metadata_uri.startswith(("http://", "https://", "ipfs://")):
                validation_result["issues"].append("URI inválida")
                return validation_result
            
            # Obtener metadata
            async with aiohttp.ClientSession() as session:
                async with session.get(metadata_uri, timeout=30) as response:
                    if response.status != 200:
                        validation_result["issues"].append("No se pudo acceder a la metadata")
                        return validation_result
                    
                    metadata = await response.json()
            
            # Validar campos requeridos
            required_fields = ["name", "description", "image"]
            for field in required_fields:
                if field not in metadata:
                    validation_result["issues"].append(f"Campo requerido faltante: {field}")
            
            # Validar royalties
            if "royalties" in metadata:
                royalty_percentage = metadata["royalties"].get("percentage", 0)
                min_royalty = self.config.get("blockchain_security", {}).get("nfts", {}).get("royalty_percentage_min", 2.5)
                max_royalty = self.config.get("blockchain_security", {}).get("nfts", {}).get("royalty_percentage_max", 10.0)
                
                if not (min_royalty <= royalty_percentage <= max_royalty):
                    validation_result["issues"].append(f"Royalty fuera de rango: {royalty_percentage}%")
            
            # Validar imagen
            if "image" in metadata:
                image_uri = metadata["image"]
                if not self._validate_image_uri(image_uri):
                    validation_result["issues"].append("URI de imagen inválida")
            
            validation_result["is_valid"] = len(validation_result["issues"]) == 0
            
            if validation_result["is_valid"]:
                logging.info(f"✅ Metadata NFT válida: {metadata_uri}")
            else:
                logging.warning(f"⚠️ Metadata NFT inválida: {metadata_uri}")
            
        except Exception as e:
            validation_result["issues"].append(f"Error validando metadata: {e}")
            logging.error(f"❌ Error validando metadata: {e}")
        
        return validation_result
    
    def _validate_image_uri(self, image_uri: str) -> bool:
        """Validar URI de imagen"""
        valid_protocols = ["http://", "https://", "ipfs://"]
        valid_extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"]
        
        if not any(image_uri.startswith(protocol) for protocol in valid_protocols):
            return False
        
        if not any(image_uri.lower().endswith(ext) for ext in valid_extensions):
            return False
        
        return True
    
    async def detect_mev_attack(self, transaction_data: Dict[str, Any]) -> bool:
        """Detectar ataques MEV"""
        logging.info("🔍 Detectando ataques MEV...")
        
        # Verificar patrones de MEV
        mev_indicators = [
            "high_gas_price",
            "front_running",
            "back_running",
            "sandwich_attack",
            "arbitrage"
        ]
        
        for indicator in mev_indicators:
            if self._check_mev_indicator(transaction_data, indicator):
                logging.warning(f"⚠️ Indicador MEV detectado: {indicator}")
                self.security_metrics["mev_detected"] += 1
                return True
        
        return False
    
    def _check_mev_indicator(self, transaction_data: Dict[str, Any], indicator: str) -> bool:
        """Verificar indicador específico de MEV"""
        # Implementar lógica de detección específica
        return False
    
    async def block_suspicious_address(self, address: str, reason: str) -> bool:
        """Bloquear dirección sospechosa"""
        logging.warning(f"🚫 Bloqueando dirección sospechosa: {address} - Razón: {reason}")
        
        self.blocked_addresses.add(address)
        self.security_metrics["transactions_blocked"] += 1
        
        # Guardar en archivo de bloqueo
        block_file = Path("blocked_addresses.json")
        blocked_data = {
            "address": address,
            "reason": reason,
            "blocked_at": datetime.now().isoformat(),
            "blocked_by": "web3_security_system"
        }
        
        try:
            if block_file.exists():
                with open(block_file, 'r') as f:
                    existing_blocks = json.load(f)
            else:
                existing_blocks = []
            
            existing_blocks.append(blocked_data)
            
            with open(block_file, 'w') as f:
                json.dump(existing_blocks, f, indent=2)
            
            logging.info(f"✅ Dirección bloqueada: {address}")
            return True
            
        except Exception as e:
            logging.error(f"❌ Error bloqueando dirección: {e}")
            return False
    
    async def freeze_wallet(self, wallet_address: str, reason: str) -> bool:
        """Congelar wallet comprometido"""
        logging.warning(f"🧊 Congelando wallet: {wallet_address} - Razón: {reason}")
        
        self.frozen_wallets.add(wallet_address)
        self.security_metrics["wallets_frozen"] += 1
        
        # Implementar lógica de congelamiento
        freeze_data = {
            "wallet_address": wallet_address,
            "reason": reason,
            "frozen_at": datetime.now().isoformat(),
            "frozen_by": "web3_security_system"
        }
        
        try:
            freeze_file = Path("frozen_wallets.json")
            if freeze_file.exists():
                with open(freeze_file, 'r') as f:
                    existing_frozen = json.load(f)
            else:
                existing_frozen = []
            
            existing_frozen.append(freeze_data)
            
            with open(freeze_file, 'w') as f:
                json.dump(existing_frozen, f, indent=2)
            
            logging.info(f"✅ Wallet congelado: {wallet_address}")
            return True
            
        except Exception as e:
            logging.error(f"❌ Error congelando wallet: {e}")
            return False
    
    async def generate_security_report(self) -> Dict[str, Any]:
        """Generar reporte de seguridad Web3"""
        logging.info("📊 Generando reporte de seguridad Web3...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "security_metrics": self.security_metrics.copy(),
            "blocked_addresses_count": len(self.blocked_addresses),
            "suspicious_contracts_count": len(self.suspicious_contracts),
            "frozen_wallets_count": len(self.frozen_wallets),
            "system_status": "secure" if self.security_metrics["attacks_prevented"] == 0 else "compromised"
        }
        
        # Guardar reporte
        report_file = Path(f"web3_security_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"✅ Reporte guardado: {report_file}")
        return report

async def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Sistema de Seguridad Web3")
    parser.add_argument("--check-connection", action="store_true", help="Verificar conectividad blockchain")
    parser.add_argument("--setup-wallet", type=str, help="Configurar wallet seguro")
    parser.add_argument("--audit-contract", type=str, help="Auditar contrato inteligente")
    parser.add_argument("--validate-nft", type=str, help="Validar metadata de NFT")
    parser.add_argument("--block-address", type=str, help="Bloquear dirección sospechosa")
    parser.add_argument("--freeze-wallet", type=str, help="Congelar wallet")
    parser.add_argument("--generate-report", action="store_true", help="Generar reporte de seguridad")
    
    args = parser.parse_args()
    
    security = Web3Security()
    
    try:
        if args.check_connection:
            await security.check_blockchain_connection()
        
        elif args.setup_wallet:
            wallet_config = security.setup_secure_wallet(args.setup_wallet)
            print(f"Wallet configurado: {json.dumps(wallet_config, indent=2)}")
        
        elif args.audit_contract:
            # Simular ABI para prueba
            contract_abi = [{"type": "function", "name": "transfer", "inputs": []}]
            audit_result = await security.audit_smart_contract(args.audit_contract, contract_abi)
            print(f"Resultado de auditoría: {json.dumps(audit_result, indent=2)}")
        
        elif args.validate_nft:
            validation_result = await security.validate_nft_metadata(args.validate_nft)
            print(f"Resultado de validación: {json.dumps(validation_result, indent=2)}")
        
        elif args.block_address:
            await security.block_suspicious_address(args.block_address, "Actividad sospechosa")
        
        elif args.freeze_wallet:
            await security.freeze_wallet(args.freeze_wallet, "Comprometido")
        
        elif args.generate_report:
            report = await security.generate_security_report()
            print(f"Reporte generado: {json.dumps(report, indent=2)}")
        
        else:
            print("🔗 Sistema de Seguridad Web3 - Metaverso Crypto World Virtual 3D")
            print("=" * 60)
            print("Comandos disponibles:")
            print("  --check-connection     Verificar conectividad blockchain")
            print("  --setup-wallet TYPE    Configurar wallet seguro")
            print("  --audit-contract ADDR  Auditar contrato inteligente")
            print("  --validate-nft URI     Validar metadata de NFT")
            print("  --block-address ADDR   Bloquear dirección sospechosa")
            print("  --freeze-wallet ADDR   Congelar wallet")
            print("  --generate-report      Generar reporte de seguridad")
    
    except Exception as e:
        logging.error(f"Error en sistema de seguridad Web3: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(asyncio.run(main())) 