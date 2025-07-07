import { ethers } from 'ethers'
import { UniswapManager } from './protocols/UniswapManager'
import { AaveManager } from './protocols/AaveManager'
import { CompoundManager } from './protocols/CompoundManager'
import { CurveManager } from './protocols/CurveManager'
import { BalancerManager } from './protocols/BalancerManager'
import { SynthetixManager } from './protocols/SynthetixManager'
import { YearnManager } from './protocols/YearnManager'
import { Logger } from '../utils/Logger'

export interface DeFiConfig {
  uniswap?: {
    v2Router?: string
    v3Router?: string
    factory?: string
  }
  aave?: {
    lendingPool?: string
    dataProvider?: string
  }
  compound?: {
    comptroller?: string
    cToken?: string
  }
  curve?: {
    registry?: string
    factory?: string
  }
  balancer?: {
    vault?: string
    weightedPoolFactory?: string
  }
  synthetix?: {
    proxy?: string
    exchangeRates?: string
  }
  yearn?: {
    registry?: string
    vault?: string
  }
}

export interface DeFiProtocol {
  name: string
  version: string
  chainId: number
  tvl: string
  apy: string
  isActive: boolean
}

export interface DeFiPosition {
  protocol: string
  token: string
  amount: string
  value: string
  apy: string
  rewards: string[]
}

export class DeFiManager {
  private uniswapManager: UniswapManager
  private aaveManager: AaveManager
  private compoundManager: CompoundManager
  private curveManager: CurveManager
  private balancerManager: BalancerManager
  private synthetixManager: SynthetixManager
  private yearnManager: YearnManager
  private logger: Logger
  private config: DeFiConfig
  private isInitialized: boolean = false

  constructor(config?: DeFiConfig) {
    this.config = config || {}
    this.logger = new Logger('DeFiManager')
    this.uniswapManager = new UniswapManager()
    this.aaveManager = new AaveManager()
    this.compoundManager = new CompoundManager()
    this.curveManager = new CurveManager()
    this.balancerManager = new BalancerManager()
    this.synthetixManager = new SynthetixManager()
    this.yearnManager = new YearnManager()
  }

  /**
   * Inicializa el DeFi Manager
   */
  async initialize(config?: DeFiConfig): Promise<void> {
    try {
      this.logger.info('Initializing DeFi Manager...')
      
      this.config = { ...this.config, ...config }
      
      // Initialize all protocol managers
      await Promise.all([
        this.uniswapManager.initialize(this.config.uniswap),
        this.aaveManager.initialize(this.config.aave),
        this.compoundManager.initialize(this.config.compound),
        this.curveManager.initialize(this.config.curve),
        this.balancerManager.initialize(this.config.balancer),
        this.synthetixManager.initialize(this.config.synthetix),
        this.yearnManager.initialize(this.config.yearn)
      ])
      
      this.isInitialized = true
      this.logger.info('DeFi Manager initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize DeFi Manager:', error)
      throw error
    }
  }

  /**
   * Obtiene información de todos los protocolos
   */
  async getProtocols(): Promise<DeFiProtocol[]> {
    try {
      const protocols = await Promise.all([
        this.uniswapManager.getProtocolInfo(),
        this.aaveManager.getProtocolInfo(),
        this.compoundManager.getProtocolInfo(),
        this.curveManager.getProtocolInfo(),
        this.balancerManager.getProtocolInfo(),
        this.synthetixManager.getProtocolInfo(),
        this.yearnManager.getProtocolInfo()
      ])
      
      return protocols.filter(protocol => protocol !== null) as DeFiProtocol[]
    } catch (error) {
      this.logger.error('Failed to get protocols:', error)
      throw error
    }
  }

  /**
   * Obtiene las posiciones DeFi de una dirección
   */
  async getPositions(address: string): Promise<DeFiPosition[]> {
    try {
      this.logger.info(`Getting DeFi positions for ${address}`)
      
      const positions = await Promise.all([
        this.uniswapManager.getPositions(address),
        this.aaveManager.getPositions(address),
        this.compoundManager.getPositions(address),
        this.curveManager.getPositions(address),
        this.balancerManager.getPositions(address),
        this.synthetixManager.getPositions(address),
        this.yearnManager.getPositions(address)
      ])
      
      return positions.flat().filter(position => position !== null) as DeFiPosition[]
    } catch (error) {
      this.logger.error(`Failed to get positions for ${address}:`, error)
      throw error
    }
  }

  /**
   * Obtiene el valor total de las posiciones DeFi
   */
  async getTotalValue(address: string): Promise<string> {
    try {
      const positions = await this.getPositions(address)
      const totalValue = positions.reduce((sum, position) => {
        return sum + parseFloat(position.value || '0')
      }, 0)
      
      return totalValue.toString()
    } catch (error) {
      this.logger.error(`Failed to get total value for ${address}:`, error)
      throw error
    }
  }

  /**
   * Obtiene las mejores oportunidades de yield farming
   */
  async getYieldOpportunities(): Promise<any[]> {
    try {
      this.logger.info('Getting yield opportunities...')
      
      const opportunities = await Promise.all([
        this.uniswapManager.getYieldOpportunities(),
        this.aaveManager.getYieldOpportunities(),
        this.compoundManager.getYieldOpportunities(),
        this.curveManager.getYieldOpportunities(),
        this.balancerManager.getYieldOpportunities(),
        this.synthetixManager.getYieldOpportunities(),
        this.yearnManager.getYieldOpportunities()
      ])
      
      const allOpportunities = opportunities.flat().filter(opp => opp !== null)
      
      // Sort by APY
      return allOpportunities.sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy))
    } catch (error) {
      this.logger.error('Failed to get yield opportunities:', error)
      throw error
    }
  }

  /**
   * Ejecuta un swap en Uniswap
   */
  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    deadline: number,
    version: 'v2' | 'v3' = 'v3'
  ): Promise<any> {
    try {
      this.logger.info(`Swapping ${amountIn} of ${tokenIn} for ${tokenOut}`)
      
      if (version === 'v2') {
        return await this.uniswapManager.swapV2(tokenIn, tokenOut, amountIn, amountOutMin, deadline)
      } else {
        return await this.uniswapManager.swapV3(tokenIn, tokenOut, amountIn, amountOutMin, deadline)
      }
    } catch (error) {
      this.logger.error('Failed to swap tokens:', error)
      throw error
    }
  }

  /**
   * Deposita tokens en Aave
   */
  async depositToAave(asset: string, amount: string, onBehalfOf?: string): Promise<any> {
    try {
      this.logger.info(`Depositing ${amount} of ${asset} to Aave`)
      return await this.aaveManager.deposit(asset, amount, onBehalfOf)
    } catch (error) {
      this.logger.error('Failed to deposit to Aave:', error)
      throw error
    }
  }

  /**
   * Toma prestado de Aave
   */
  async borrowFromAave(asset: string, amount: string, interestRateMode: number, onBehalfOf?: string): Promise<any> {
    try {
      this.logger.info(`Borrowing ${amount} of ${asset} from Aave`)
      return await this.aaveManager.borrow(asset, amount, interestRateMode, onBehalfOf)
    } catch (error) {
      this.logger.error('Failed to borrow from Aave:', error)
      throw error
    }
  }

  /**
   * Deposita en Compound
   */
  async depositToCompound(cToken: string, amount: string): Promise<any> {
    try {
      this.logger.info(`Depositing ${amount} to Compound cToken ${cToken}`)
      return await this.compoundManager.deposit(cToken, amount)
    } catch (error) {
      this.logger.error('Failed to deposit to Compound:', error)
      throw error
    }
  }

  /**
   * Toma prestado de Compound
   */
  async borrowFromCompound(cToken: string, amount: string): Promise<any> {
    try {
      this.logger.info(`Borrowing ${amount} from Compound cToken ${cToken}`)
      return await this.compoundManager.borrow(cToken, amount)
    } catch (error) {
      this.logger.error('Failed to borrow from Compound:', error)
      throw error
    }
  }

  /**
   * Deposita en Curve
   */
  async depositToCurve(pool: string, amounts: string[], minLpTokens: string): Promise<any> {
    try {
      this.logger.info(`Depositing to Curve pool ${pool}`)
      return await this.curveManager.deposit(pool, amounts, minLpTokens)
    } catch (error) {
      this.logger.error('Failed to deposit to Curve:', error)
      throw error
    }
  }

  /**
   * Deposita en Balancer
   */
  async depositToBalancer(poolId: string, assets: string[], maxAmountsIn: string[], userData: string): Promise<any> {
    try {
      this.logger.info(`Depositing to Balancer pool ${poolId}`)
      return await this.balancerManager.deposit(poolId, assets, maxAmountsIn, userData)
    } catch (error) {
      this.logger.error('Failed to deposit to Balancer:', error)
      throw error
    }
  }

  /**
   * Deposita en Yearn
   */
  async depositToYearn(vault: string, amount: string): Promise<any> {
    try {
      this.logger.info(`Depositing ${amount} to Yearn vault ${vault}`)
      return await this.yearnManager.deposit(vault, amount)
    } catch (error) {
      this.logger.error('Failed to deposit to Yearn:', error)
      throw error
    }
  }

  /**
   * Obtiene precios de tokens desde múltiples fuentes
   */
  async getTokenPrices(tokens: string[]): Promise<Map<string, string>> {
    try {
      this.logger.info(`Getting prices for ${tokens.length} tokens`)
      
      const prices = new Map<string, string>()
      
      // Get prices from multiple sources for redundancy
      const [uniswapPrices, aavePrices, compoundPrices] = await Promise.all([
        this.uniswapManager.getTokenPrices(tokens),
        this.aaveManager.getTokenPrices(tokens),
        this.compoundManager.getTokenPrices(tokens)
      ])
      
      // Combine prices, preferring Uniswap for most tokens
      for (const token of tokens) {
        const price = uniswapPrices.get(token) || aavePrices.get(token) || compoundPrices.get(token)
        if (price) {
          prices.set(token, price)
        }
      }
      
      return prices
    } catch (error) {
      this.logger.error('Failed to get token prices:', error)
      throw error
    }
  }

  /**
   * Obtiene el estado de salud del DeFi Manager
   */
  async getHealthStatus(): Promise<any> {
    try {
      const protocols = await this.getProtocols()
      const activeProtocols = protocols.filter(p => p.isActive)
      
      return {
        isInitialized: this.isInitialized,
        totalProtocols: protocols.length,
        activeProtocols: activeProtocols.length,
        totalTVL: activeProtocols.reduce((sum, p) => sum + parseFloat(p.tvl || '0'), 0).toString(),
        averageAPY: activeProtocols.length > 0 
          ? (activeProtocols.reduce((sum, p) => sum + parseFloat(p.apy || '0'), 0) / activeProtocols.length).toString()
          : '0'
      }
    } catch (error) {
      this.logger.error('Failed to get health status:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas del DeFi Manager
   */
  async getStats(): Promise<any> {
    try {
      const protocols = await this.getProtocols()
      
      return {
        protocols: protocols.length,
        totalTVL: protocols.reduce((sum, p) => sum + parseFloat(p.tvl || '0'), 0).toString(),
        averageAPY: protocols.length > 0 
          ? (protocols.reduce((sum, p) => sum + parseFloat(p.apy || '0'), 0) / protocols.length).toString()
          : '0',
        topProtocol: protocols.sort((a, b) => parseFloat(b.tvl) - parseFloat(a.tvl))[0]?.name || 'None'
      }
    } catch (error) {
      this.logger.error('Failed to get stats:', error)
      throw error
    }
  }

  /**
   * Limpia recursos del DeFi Manager
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up DeFi Manager...')
      
      await Promise.all([
        this.uniswapManager.cleanup(),
        this.aaveManager.cleanup(),
        this.compoundManager.cleanup(),
        this.curveManager.cleanup(),
        this.balancerManager.cleanup(),
        this.synthetixManager.cleanup(),
        this.yearnManager.cleanup()
      ])
      
      this.isInitialized = false
      this.logger.info('DeFi Manager cleaned up successfully')
    } catch (error) {
      this.logger.error('Failed to cleanup DeFi Manager:', error)
      throw error
    }
  }

  /**
   * Verifica si el DeFi Manager está inicializado
   */
  isReady(): boolean {
    return this.isInitialized
  }
} 