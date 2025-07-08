#!/usr/bin/env python3
"""
Blockchain WoldVirtual3D en Python
Puente entre Binance Smart Chain y WoldVirtual3D
"""

import json
import hashlib
import time
import threading
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('WoldVirtual3D_Python')

@dataclass
class BlockHeader:
    """Encabezado de bloque"""
    number: int
    parent_hash: str
    timestamp: int
    merkle_root: str
    difficulty: str
    nonce: int

@dataclass
class Transaction:
    """Transacción"""
    hash: str
    from_address: str
    to_address: str
    value: str
    data: str
    nonce: int
    timestamp: int
    gas_limit: int
    gas_price: str

@dataclass
class Block:
    """Bloque de la blockchain"""
    header: BlockHeader
    transactions: List[Transaction]
    hash: str

@dataclass
class Wallet:
    """Wallet de usuario"""
    address: str
    private_key: str
    balance: str
    nonce: int

@dataclass
class TokenTransfer:
    """Transferencia de token"""
    from_address: str
    to_address: str
    amount: str
    timestamp: int
    transaction_hash: str

@dataclass
class BridgeTransfer:
    """Transferencia del puente"""
    id: str
    from_address: str
    to_address: str
    amount: str
    source_chain: str
    target_chain: str
    status: str
    timestamp: int
    transaction_hash: str
    confirmation_hash: Optional[str] = None
    fee: str = "0"

class WCVToken:
    """Token WoldCoinVirtual (WCV)"""
    
    def __init__(self):
        self.name = "WoldCoinVirtual"
        self.symbol = "WCV"
        self.decimals = 3
        self.total_supply = "30000000000"  # 30 millones con 3 decimales
        self.balances: Dict[str, str] = {}
        self.allowances: Dict[str, Dict[str, str]] = {}
        self.transfers: List[TokenTransfer] = []
        self.holders: set = set()
        
        # Distribuir tokens iniciales
        self._distribute_initial_tokens()
        
        logger.info(f"Token {self.name} ({self.symbol}) inicializado")
    
    def _distribute_initial_tokens(self):
        """Distribuir tokens iniciales"""
        distribution = {
            "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6": "15000000000",  # 50% - Public Sale
            "0x8ba1f109551bD432803012645Hac136c772c3c7b": "3000000000",   # 10% - Team
            "0x147B8eb97fD247D06C4006D269c90C1908Fb5D54": "3000000000",   # 10% - Development
            "0x0000000000000000000000000000000000000007": "2000000000",   # 6.67% - Marketing
            "0x0000000000000000000000000000000000000008": "2000000000",   # 6.67% - Liquidity
            "0x0000000000000000000000000000000000000009": "5000000000"    # 16.66% - Reserve
        }
        
        for address, amount in distribution.items():
            self.balances[address] = amount
            self.holders.add(address)
            logger.info(f"Tokens distribuidos a {address}: {self.format_amount(amount)} WCV")
    
    def get_balance(self, address: str) -> str:
        """Obtener balance de una dirección"""
        return self.balances.get(address, "0")
    
    def transfer(self, from_address: str, to_address: str, amount: str, tx_hash: str) -> bool:
        """Transferir tokens"""
        try:
            from_balance = int(self.get_balance(from_address))
            amount_int = int(amount)
            
            if from_balance < amount_int:
                logger.warning(f"Saldo insuficiente en {from_address}")
                return False
            
            if amount_int <= 0:
                logger.warning("Cantidad debe ser mayor a 0")
                return False
            
            # Actualizar balances
            to_balance = int(self.get_balance(to_address))
            self.balances[from_address] = str(from_balance - amount_int)
            self.balances[to_address] = str(to_balance + amount_int)
            
            # Actualizar holders
            if int(self.balances[to_address]) > 0:
                self.holders.add(to_address)
            if int(self.balances[from_address]) == 0:
                self.holders.discard(from_address)
            
            # Registrar transferencia
            transfer = TokenTransfer(
                from_address=from_address,
                to_address=to_address,
                amount=amount,
                timestamp=int(time.time()),
                transaction_hash=tx_hash
            )
            self.transfers.append(transfer)
            
            logger.info(f"Transferencia: {self.format_amount(amount)} WCV de {from_address} a {to_address}")
            return True
            
        except Exception as e:
            logger.error(f"Error en transferencia: {e}")
            return False
    
    def mint(self, to_address: str, amount: str, minter: str, tx_hash: str) -> bool:
        """Acuñar tokens (solo para el puente)"""
        try:
            bridge_address = "0x0000000000000000000000000000000000000006"
            if minter != bridge_address:
                logger.warning(f"Solo el puente puede acuñar tokens. Minter: {minter}")
                return False
            
            to_balance = int(self.get_balance(to_address))
            amount_int = int(amount)
            new_balance = to_balance + amount_int
            
            # Actualizar balance
            self.balances[to_address] = str(new_balance)
            
            # Aumentar suministro total
            total_supply_int = int(self.total_supply)
            self.total_supply = str(total_supply_int + amount_int)
            
            # Agregar holder
            self.holders.add(to_address)
            
            logger.info(f"Acuñados {self.format_amount(amount)} WCV para {to_address}")
            return True
            
        except Exception as e:
            logger.error(f"Error acuñando tokens: {e}")
            return False
    
    def burn(self, from_address: str, amount: str, tx_hash: str) -> bool:
        """Quemar tokens"""
        try:
            from_balance = int(self.get_balance(from_address))
            amount_int = int(amount)
            
            if from_balance < amount_int:
                logger.warning(f"Saldo insuficiente en {from_address} para quemar")
                return False
            
            # Reducir balance
            self.balances[from_address] = str(from_balance - amount_int)
            
            # Reducir suministro total
            total_supply_int = int(self.total_supply)
            self.total_supply = str(total_supply_int - amount_int)
            
            logger.info(f"Quemados {self.format_amount(amount)} WCV de {from_address}")
            return True
            
        except Exception as e:
            logger.error(f"Error quemando tokens: {e}")
            return False
    
    def format_amount(self, amount: str) -> str:
        """Formatear cantidad para mostrar"""
        amount_int = int(amount)
        formatted = amount_int / (10 ** self.decimals)
        return f"{formatted:.3f}".rstrip('0').rstrip('.')
    
    def get_holders(self) -> List[Dict[str, Any]]:
        """Obtener holders del token"""
        holders_list = []
        total_supply_int = int(self.total_supply)
        
        for address in self.holders:
            balance = self.get_balance(address)
            balance_int = int(balance)
            
            if balance_int > 0:
                percentage = (balance_int / total_supply_int) * 100
                holders_list.append({
                    "address": address,
                    "balance": balance,
                    "percentage": percentage,
                    "last_transaction": int(time.time())
                })
        
        return sorted(holders_list, key=lambda x: int(x["balance"]), reverse=True)
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del token"""
        holders = self.get_holders()
        total_holders = len(holders)
        
        circulating_supply = sum(int(holder["balance"]) for holder in holders)
        burned_supply = int(self.total_supply) - circulating_supply
        
        return {
            "total_supply": self.total_supply,
            "circulating_supply": str(circulating_supply),
            "burned_supply": str(burned_supply),
            "total_holders": total_holders,
            "total_transfers": len(self.transfers),
            "total_approvals": 0
        }

class Bridge:
    """Puente entre BSC y WoldVirtual3D"""
    
    def __init__(self, wcv_token: WCVToken):
        self.wcv_token = wcv_token
        self.transfers: Dict[str, BridgeTransfer] = {}
        self.daily_transfers: Dict[str, int] = {}
        self.total_transfers = 0
        self.total_volume = "0"
        
        self.config = {
            "bsc_contract_address": "0x053532E91FFD6b8a21C925Da101C909A01106BBE",
            "woldvirtual_contract_address": "0x0000000000000000000000000000000000000004",
            "min_transfer_amount": "1000",  # 1 WCV
            "max_transfer_amount": "1000000000",  # 1M WCV
            "daily_limit": "10000000000",  # 10M WCV
            "transfer_fee": "100",  # 0.1 WCV
            "confirmation_blocks": {
                "bsc": 15,
                "woldvirtual": 5
            }
        }
        
        logger.info("Puente BSC ↔ WoldVirtual3D inicializado")
    
    def transfer_from_bsc(self, from_address: str, to_address: str, amount: str, tx_hash: str) -> str:
        """Transferir tokens de BSC a WoldVirtual3D"""
        try:
            # Validar transferencia
            if not self._validate_transfer(from_address, to_address, amount):
                raise ValueError("Transferencia inválida")
            
            # Verificar límite diario
            if not self._check_daily_limit(amount):
                raise ValueError("Límite diario excedido")
            
            # Crear transferencia
            transfer_id = self._generate_transfer_id(from_address, to_address, amount, "BSC")
            fee = self._calculate_fee(amount)
            net_amount = str(int(amount) - int(fee))
            
            transfer = BridgeTransfer(
                id=transfer_id,
                from_address=from_address,
                to_address=to_address,
                amount=net_amount,
                source_chain="BSC",
                target_chain="WOLDVIRTUAL",
                status="PENDING",
                timestamp=int(time.time()),
                transaction_hash=tx_hash,
                fee=fee
            )
            
            # Guardar transferencia
            self.transfers[transfer_id] = transfer
            self.total_transfers += 1
            self._update_daily_transfers(amount)
            
            logger.info(f"Transferencia iniciada desde BSC: {transfer_id}")
            return transfer_id
            
        except Exception as e:
            logger.error(f"Error iniciando transferencia desde BSC: {e}")
            raise
    
    def transfer_to_bsc(self, from_address: str, to_address: str, amount: str, tx_hash: str) -> str:
        """Transferir tokens de WoldVirtual3D a BSC"""
        try:
            # Validar transferencia
            if not self._validate_transfer(from_address, to_address, amount):
                raise ValueError("Transferencia inválida")
            
            # Verificar balance en WoldVirtual3D
            balance = self.wcv_token.get_balance(from_address)
            balance_int = int(balance)
            amount_int = int(amount)
            fee = int(self._calculate_fee(amount))
            total_required = amount_int + fee
            
            if balance_int < total_required:
                raise ValueError("Saldo insuficiente en WoldVirtual3D")
            
            # Verificar límite diario
            if not self._check_daily_limit(amount):
                raise ValueError("Límite diario excedido")
            
            # Quemar tokens en WoldVirtual3D
            self.wcv_token.burn(from_address, str(total_required), tx_hash)
            
            # Crear transferencia
            transfer_id = self._generate_transfer_id(from_address, to_address, amount, "WOLDVIRTUAL")
            
            transfer = BridgeTransfer(
                id=transfer_id,
                from_address=from_address,
                to_address=to_address,
                amount=amount,
                source_chain="WOLDVIRTUAL",
                target_chain="BSC",
                status="PENDING",
                timestamp=int(time.time()),
                transaction_hash=tx_hash,
                fee=str(fee)
            )
            
            # Guardar transferencia
            self.transfers[transfer_id] = transfer
            self.total_transfers += 1
            self._update_daily_transfers(amount)
            
            logger.info(f"Transferencia iniciada hacia BSC: {transfer_id}")
            return transfer_id
            
        except Exception as e:
            logger.error(f"Error iniciando transferencia hacia BSC: {e}")
            raise
    
    def confirm_transfer_from_bsc(self, transfer_id: str, confirmation_hash: str) -> bool:
        """Confirmar transferencia desde BSC"""
        try:
            transfer = self.transfers.get(transfer_id)
            if not transfer:
                raise ValueError("Transferencia no encontrada")
            
            if transfer.status != "PENDING":
                raise ValueError("Transferencia ya procesada")
            
            if transfer.source_chain != "BSC":
                raise ValueError("Transferencia no es desde BSC")
            
            # Actualizar estado
            transfer.status = "PROCESSING"
            transfer.confirmation_hash = confirmation_hash
            
            # Acuñar tokens en WoldVirtual3D
            mint_success = self.wcv_token.mint(
                transfer.to_address,
                transfer.amount,
                "0x0000000000000000000000000000000000000006",  # Bridge address
                confirmation_hash
            )
            
            if mint_success:
                transfer.status = "COMPLETED"
                
                # Actualizar estadísticas
                self.total_volume = str(int(self.total_volume) + int(transfer.amount))
                
                logger.info(f"Transferencia confirmada desde BSC: {transfer_id}")
                return True
            else:
                transfer.status = "FAILED"
                logger.error(f"Error acuñando tokens para transferencia: {transfer_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error confirmando transferencia desde BSC: {e}")
            return False
    
    def _validate_transfer(self, from_address: str, to_address: str, amount: str) -> bool:
        """Validar transferencia"""
        amount_int = int(amount)
        min_amount = int(self.config["min_transfer_amount"])
        max_amount = int(self.config["max_transfer_amount"])
        
        if amount_int < min_amount:
            logger.warning(f"Cantidad menor al mínimo: {amount} < {min_amount}")
            return False
        
        if amount_int > max_amount:
            logger.warning(f"Cantidad mayor al máximo: {amount} > {max_amount}")
            return False
        
        if from_address == to_address:
            logger.warning("Dirección origen y destino son iguales")
            return False
        
        return True
    
    def _check_daily_limit(self, amount: str) -> bool:
        """Verificar límite diario"""
        today = datetime.now().strftime("%Y-%m-%d")
        daily_amount = self.daily_transfers.get(today, 0)
        amount_int = int(amount)
        limit = int(self.config["daily_limit"])
        
        if daily_amount + amount_int > limit:
            logger.warning(f"Límite diario excedido: {daily_amount + amount_int} > {limit}")
            return False
        
        return True
    
    def _update_daily_transfers(self, amount: str):
        """Actualizar transferencias diarias"""
        today = datetime.now().strftime("%Y-%m-%d")
        current = self.daily_transfers.get(today, 0)
        self.daily_transfers[today] = current + int(amount)
    
    def _calculate_fee(self, amount: str) -> str:
        """Calcular fee"""
        amount_int = int(amount)
        fee_rate = int(self.config["transfer_fee"])
        return str(max(fee_rate, int(amount_int * 0.001)))  # Mínimo 0.1 WCV o 0.1%
    
    def _generate_transfer_id(self, from_address: str, to_address: str, amount: str, source_chain: str) -> str:
        """Generar ID de transferencia"""
        timestamp = str(int(time.time()))
        data = f"{from_address}-{to_address}-{amount}-{source_chain}-{timestamp}"
        return hashlib.md5(data.encode()).hexdigest()[:16]
    
    def get_transfer(self, transfer_id: str) -> Optional[BridgeTransfer]:
        """Obtener transferencia por ID"""
        return self.transfers.get(transfer_id)
    
    def get_bridge_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del puente"""
        pending_transfers = 0
        completed_transfers = 0
        failed_transfers = 0
        
        for transfer in self.transfers.values():
            if transfer.status in ["PENDING", "PROCESSING"]:
                pending_transfers += 1
            elif transfer.status == "COMPLETED":
                completed_transfers += 1
            elif transfer.status in ["FAILED", "CANCELLED"]:
                failed_transfers += 1
        
        return {
            "total_transfers": self.total_transfers,
            "total_volume": self.total_volume,
            "daily_transfers": self.daily_transfers,
            "pending_transfers": pending_transfers,
            "completed_transfers": completed_transfers,
            "failed_transfers": failed_transfers
        }

class BSCIntegration:
    """Integración con Binance Smart Chain"""
    
    def __init__(self, bridge: Bridge):
        self.bridge = bridge
        self.is_connected = False
        self.last_processed_block = 0
        
        self.config = {
            "rpc_url": "https://bsc-dataseed1.binance.org/",
            "ws_url": "wss://bsc-ws-node.nariox.org:443",
            "chain_id": 56,
            "contract_address": "0x053532E91FFD6b8a21C925Da101C909A01106BBE",
            "explorer_url": "https://bscscan.com",
            "gas_price": "5000000000",  # 5 Gwei
            "gas_limit": 300000
        }
        
        logger.info("Servicio de integración BSC inicializado")
    
    async def connect(self) -> bool:
        """Conectar a BSC"""
        try:
            logger.info("Conectando a Binance Smart Chain...")
            
            # Simular conexión
            await asyncio.sleep(1)
            
            self.is_connected = True
            logger.info("Conectado a Binance Smart Chain")
            return True
            
        except Exception as e:
            logger.error(f"Error conectando a BSC: {e}")
            self.is_connected = False
            return False
    
    async def disconnect(self):
        """Desconectar de BSC"""
        try:
            logger.info("Desconectando de Binance Smart Chain...")
            self.is_connected = False
            logger.info("Desconectado de Binance Smart Chain")
        except Exception as e:
            logger.error(f"Error desconectando de BSC: {e}")
    
    async def process_bsc_transactions(self):
        """Procesar transacciones de BSC"""
        try:
            if not self.is_connected:
                logger.warning("No conectado a BSC, saltando procesamiento")
                return
            
            # Simular procesamiento
            logger.info("Procesando transacciones de BSC...")
            await asyncio.sleep(2)
            
            # Simular algunas transferencias
            simulated_transfers = [
                {
                    "from": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                    "to": "0x8ba1f109551bD432803012645Hac136c772c3c7b",
                    "amount": "1000000",  # 1000 WCV
                    "tx_hash": hashlib.md5(f"bsc_tx_{int(time.time())}".encode()).hexdigest()
                }
            ]
            
            for transfer in simulated_transfers:
                transfer_id = self.bridge.transfer_from_bsc(
                    transfer["from"],
                    transfer["to"],
                    transfer["amount"],
                    transfer["tx_hash"]
                )
                
                await self.bridge.confirm_transfer_from_bsc(transfer_id, transfer["tx_hash"])
                logger.info(f"Transferencia BSC procesada: {transfer_id}")
            
        except Exception as e:
            logger.error(f"Error procesando transacciones de BSC: {e}")
    
    def get_integration_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de integración"""
        return {
            "is_connected": self.is_connected,
            "last_processed_block": self.last_processed_block,
            "pending_transactions": 0,
            "confirmed_transactions": len(self.bridge.transfers)
        }

class WoldVirtualChainPython:
    """Blockchain WoldVirtual3D en Python"""
    
    def __init__(self):
        self.wcv_token = WCVToken()
        self.bridge = Bridge(self.wcv_token)
        self.bsc_integration = BSCIntegration(self.bridge)
        self.is_running = False
        
        logger.info("Blockchain WoldVirtual3D (Python) inicializada")
    
    async def start(self):
        """Iniciar blockchain"""
        try:
            logger.info("🚀 Iniciando blockchain WoldVirtual3D (Python)...")
            
            # Conectar a BSC
            await self.bsc_integration.connect()
            
            self.is_running = True
            
            # Iniciar procesamiento de BSC
            asyncio.create_task(self._bsc_processing_loop())
            
            logger.info("✅ Blockchain iniciada exitosamente")
            
        except Exception as e:
            logger.error(f"❌ Error iniciando blockchain: {e}")
            raise
    
    async def stop(self):
        """Detener blockchain"""
        try:
            logger.info("🛑 Deteniendo blockchain...")
            
            self.is_running = False
            await self.bsc_integration.disconnect()
            
            logger.info("✅ Blockchain detenida")
            
        except Exception as e:
            logger.error(f"❌ Error deteniendo blockchain: {e}")
            raise
    
    async def _bsc_processing_loop(self):
        """Loop de procesamiento de BSC"""
        while self.is_running:
            try:
                await self.bsc_integration.process_bsc_transactions()
                await asyncio.sleep(30)  # Procesar cada 30 segundos
            except Exception as e:
                logger.error(f"Error en loop de procesamiento BSC: {e}")
                await asyncio.sleep(60)  # Esperar más tiempo en caso de error
    
    def get_wcv_token(self) -> WCVToken:
        """Obtener token WCV"""
        return self.wcv_token
    
    def get_bridge(self) -> Bridge:
        """Obtener puente"""
        return self.bridge
    
    def get_bsc_integration(self) -> BSCIntegration:
        """Obtener integración BSC"""
        return self.bsc_integration

async def run_python_demo():
    """Ejecutar demo de la blockchain en Python"""
    try:
        logger.info("🐍 Iniciando demo de blockchain Python...")
        
        # Crear e iniciar blockchain
        blockchain = WoldVirtualChainPython()
        await blockchain.start()
        
        # Obtener componentes
        wcv_token = blockchain.get_wcv_token()
        bridge = blockchain.get_bridge()
        bsc_integration = blockchain.get_bsc_integration()
        
        logger.info("💰 Información del token WCV:")
        logger.info(f"  Nombre: {wcv_token.name}")
        logger.info(f"  Símbolo: {wcv_token.symbol}")
        logger.info(f"  Decimales: {wcv_token.decimals}")
        logger.info(f"  Suministro total: {wcv_token.format_amount(wcv_token.total_supply)} WCV")
        
        # Simular transferencias
        logger.info("🔄 Simulando transferencias...")
        
        # Transferencia desde BSC
        transfer_id = bridge.transfer_from_bsc(
            "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            "0x8ba1f109551bD432803012645Hac136c772c3c7b",
            "1000000",  # 1000 WCV
            hashlib.md5("bsc_transfer".encode()).hexdigest()
        )
        
        await bridge.confirm_transfer_from_bsc(transfer_id, hashlib.md5("bsc_confirmation".encode()).hexdigest())
        
        # Transferencia interna
        wcv_token.transfer(
            "0x8ba1f109551bD432803012645Hac136c772c3c7b",
            "0x147B8eb97fD247D06C4006D269c90C1908Fb5D54",
            "500000",  # 500 WCV
            hashlib.md5("internal_transfer".encode()).hexdigest()
        )
        
        # Mostrar estadísticas
        logger.info("📊 Estadísticas del token:")
        token_stats = wcv_token.get_stats()
        logger.info(f"  Suministro total: {wcv_token.format_amount(token_stats['total_supply'])} WCV")
        logger.info(f"  Suministro en circulación: {wcv_token.format_amount(token_stats['circulating_supply'])} WCV")
        logger.info(f"  Total de holders: {token_stats['total_holders']}")
        logger.info(f"  Total de transferencias: {token_stats['total_transfers']}")
        
        logger.info("📊 Estadísticas del puente:")
        bridge_stats = bridge.get_bridge_stats()
        logger.info(f"  Total de transferencias: {bridge_stats['total_transfers']}")
        logger.info(f"  Volumen total: {wcv_token.format_amount(bridge_stats['total_volume'])} WCV")
        logger.info(f"  Transferencias completadas: {bridge_stats['completed_transfers']}")
        
        logger.info("🔗 Estadísticas de integración BSC:")
        bsc_stats = bsc_integration.get_integration_stats()
        logger.info(f"  Conectado a BSC: {bsc_stats['is_connected']}")
        logger.info(f"  Transacciones confirmadas: {bsc_stats['confirmed_transactions']}")
        
        # Esperar un poco para procesamiento
        await asyncio.sleep(5)
        
        logger.info("✅ Demo de blockchain Python completado")
        
        # Detener blockchain
        await blockchain.stop()
        
    except Exception as e:
        logger.error(f"💥 Error en demo Python: {e}")
        raise

if __name__ == "__main__":
    # Ejecutar demo
    asyncio.run(run_python_demo()) 