import { ethers } from 'ethers'
import { Logger } from '../../utils/Logger'

export interface UniswapConfig {
  v2Router?: string
  v3Router?: string
  factory?: string
  quoter?: string
}

export interface UniswapPool {
  address: string
  token0: string
  token1: string
  reserve0: string
  reserve1: string
  fee: number
  version: 'v2' | 'v3'
}

export interface UniswapPosition {
  pool: string
  liquidity: string
  token0: string
  token1: string
  amount0: string
  amount1: string
  fee: number
  version: 'v2' | 'v3'
}

export class UniswapManager {
  private config: UniswapConfig
  private logger: Logger
  private isInitialized: boolean = false
  private v2Router: ethers.Contract | null = null
  private v3Router: ethers.Contract | null = null
  private factory: ethers.Contract | null = null
  private quoter: ethers.Contract | null = null

  constructor() {
    this.logger = new Logger('UniswapManager')
  }

  /**
   * Inicializa el Uniswap Manager
   */
  async initialize(config?: UniswapConfig): Promise<void> {
    try {
      this.logger.info('Initializing Uniswap Manager...')
      
      this.config = config || {}
      
      // Initialize contracts if addresses are provided
      if (this.config.v2Router) {
        this.v2Router = new ethers.Contract(
          this.config.v2Router,
          this.getV2RouterABI(),
          null
        )
      }
      
      if (this.config.v3Router) {
        this.v3Router = new ethers.Contract(
          this.config.v3Router,
          this.getV3RouterABI(),
          null
        )
      }
      
      if (this.config.factory) {
        this.factory = new ethers.Contract(
          this.config.factory,
          this.getFactoryABI(),
          null
        )
      }
      
      if (this.config.quoter) {
        this.quoter = new ethers.Contract(
          this.config.quoter,
          this.getQuoterABI(),
          null
        )
      }
      
      this.isInitialized = true
      this.logger.info('Uniswap Manager initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize Uniswap Manager:', error)
      throw error
    }
  }

  /**
   * Obtiene información del protocolo
   */
  async getProtocolInfo(): Promise<any> {
    try {
      return {
        name: 'Uniswap',
        version: 'V2/V3',
        chainId: 1, // Will be updated based on current network
        tvl: '1000000000', // Placeholder
        apy: '15.5', // Placeholder
        isActive: true
      }
    } catch (error) {
      this.logger.error('Failed to get protocol info:', error)
      return null
    }
  }

  /**
   * Obtiene las posiciones de una dirección
   */
  async getPositions(address: string): Promise<UniswapPosition[]> {
    try {
      this.logger.info(`Getting Uniswap positions for ${address}`)
      
      const positions: UniswapPosition[] = []
      
      // Get V2 positions
      if (this.factory) {
        const v2Positions = await this.getV2Positions(address)
        positions.push(...v2Positions)
      }
      
      // Get V3 positions
      if (this.v3Router) {
        const v3Positions = await this.getV3Positions(address)
        positions.push(...v3Positions)
      }
      
      return positions
    } catch (error) {
      this.logger.error(`Failed to get positions for ${address}:`, error)
      return []
    }
  }

  /**
   * Obtiene posiciones V2
   */
  private async getV2Positions(address: string): Promise<UniswapPosition[]> {
    try {
      // This would require querying all pairs and checking balances
      // For now, return empty array
      return []
    } catch (error) {
      this.logger.error('Failed to get V2 positions:', error)
      return []
    }
  }

  /**
   * Obtiene posiciones V3
   */
  private async getV3Positions(address: string): Promise<UniswapPosition[]> {
    try {
      // This would require querying the NFT manager contract
      // For now, return empty array
      return []
    } catch (error) {
      this.logger.error('Failed to get V3 positions:', error)
      return []
    }
  }

  /**
   * Ejecuta un swap en Uniswap V2
   */
  async swapV2(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    deadline: number
  ): Promise<any> {
    try {
      if (!this.v2Router) {
        throw new Error('V2 Router not initialized')
      }
      
      this.logger.info(`Swapping ${amountIn} of ${tokenIn} for ${tokenOut} on V2`)
      
      const path = [tokenIn, tokenOut]
      const tx = await this.v2Router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        await this.v2Router.signer.getAddress(),
        deadline
      )
      
      return await tx.wait()
    } catch (error) {
      this.logger.error('Failed to swap on V2:', error)
      throw error
    }
  }

  /**
   * Ejecuta un swap en Uniswap V3
   */
  async swapV3(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    deadline: number,
    fee: number = 3000
  ): Promise<any> {
    try {
      if (!this.v3Router) {
        throw new Error('V3 Router not initialized')
      }
      
      this.logger.info(`Swapping ${amountIn} of ${tokenIn} for ${tokenOut} on V3`)
      
      const params = {
        tokenIn,
        tokenOut,
        fee,
        recipient: await this.v3Router.signer.getAddress(),
        deadline,
        amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0
      }
      
      const tx = await this.v3Router.exactInputSingle(params)
      return await tx.wait()
    } catch (error) {
      this.logger.error('Failed to swap on V3:', error)
      throw error
    }
  }

  /**
   * Obtiene la cantidad de salida estimada para un swap
   */
  async getAmountOut(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    version: 'v2' | 'v3' = 'v3'
  ): Promise<string> {
    try {
      if (version === 'v2') {
        if (!this.v2Router) {
          throw new Error('V2 Router not initialized')
        }
        
        const path = [tokenIn, tokenOut]
        const amounts = await this.v2Router.getAmountsOut(amountIn, path)
        return amounts[1].toString()
      } else {
        if (!this.quoter) {
          throw new Error('Quoter not initialized')
        }
        
        const amountOut = await this.quoter.quoteExactInputSingle(
          tokenIn,
          tokenOut,
          3000, // fee
          amountIn,
          0 // sqrtPriceLimitX96
        )
        
        return amountOut.toString()
      }
    } catch (error) {
      this.logger.error('Failed to get amount out:', error)
      throw error
    }
  }

  /**
   * Obtiene precios de tokens
   */
  async getTokenPrices(tokens: string[]): Promise<Map<string, string>> {
    try {
      const prices = new Map<string, string>()
      
      // Use WETH as base token for price calculation
      const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      
      for (const token of tokens) {
        if (token.toLowerCase() === wethAddress.toLowerCase()) {
          prices.set(token, '1') // WETH is base token
          continue
        }
        
        try {
          // Try to get price from V2 first
          const amountOut = await this.getAmountOut(
            token,
            wethAddress,
            ethers.parseEther('1'),
            'v2'
          )
          
          const price = ethers.formatEther(amountOut)
          prices.set(token, price)
        } catch (error) {
          // Try V3 if V2 fails
          try {
            const amountOut = await this.getAmountOut(
              token,
              wethAddress,
              ethers.parseEther('1'),
              'v3'
            )
            
            const price = ethers.formatEther(amountOut)
            prices.set(token, price)
          } catch (v3Error) {
            this.logger.warn(`Failed to get price for ${token}:`, v3Error)
            prices.set(token, '0')
          }
        }
      }
      
      return prices
    } catch (error) {
      this.logger.error('Failed to get token prices:', error)
      throw error
    }
  }

  /**
   * Obtiene oportunidades de yield farming
   */
  async getYieldOpportunities(): Promise<any[]> {
    try {
      // This would require integration with farming contracts
      // For now, return placeholder data
      return [
        {
          protocol: 'Uniswap V2',
          pair: 'ETH/USDC',
          apy: '12.5',
          tvl: '1000000',
          risk: 'Low'
        },
        {
          protocol: 'Uniswap V3',
          pair: 'ETH/USDC',
          apy: '18.2',
          tvl: '5000000',
          risk: 'Medium'
        }
      ]
    } catch (error) {
      this.logger.error('Failed to get yield opportunities:', error)
      return []
    }
  }

  /**
   * Obtiene pools disponibles
   */
  async getPools(): Promise<UniswapPool[]> {
    try {
      const pools: UniswapPool[] = []
      
      // This would require querying the factory contract
      // For now, return placeholder data
      
      return pools
    } catch (error) {
      this.logger.error('Failed to get pools:', error)
      return []
    }
  }

  /**
   * Limpia recursos
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Uniswap Manager...')
      this.isInitialized = false
      this.logger.info('Uniswap Manager cleaned up successfully')
    } catch (error) {
      this.logger.error('Failed to cleanup Uniswap Manager:', error)
      throw error
    }
  }

  /**
   * Obtiene ABI del V2 Router
   */
  private getV2RouterABI(): any[] {
    return [
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
      'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
      'function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)'
    ]
  }

  /**
   * Obtiene ABI del V3 Router
   */
  private getV3RouterABI(): any[] {
    return [
      'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
      'function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)'
    ]
  }

  /**
   * Obtiene ABI del Factory
   */
  private getFactoryABI(): any[] {
    return [
      'function allPairs(uint) external view returns (address pair)',
      'function allPairsLength() external view returns (uint)',
      'function getPair(address tokenA, address tokenB) external view returns (address pair)'
    ]
  }

  /**
   * Obtiene ABI del Quoter
   */
  private getQuoterABI(): any[] {
    return [
      'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
      'function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) external returns (uint256 amountIn)'
    ]
  }
} 