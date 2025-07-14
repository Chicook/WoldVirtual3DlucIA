/**
 * @fileoverview Tipos para validación de utilidades del metaverso
 * @module @types/utilities/validation
 */

// ============================================================================
// TIPOS BÁSICOS DE VALIDACIÓN
// ============================================================================

/**
 * Resultado de validación
 */
export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, any>;
};

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  constraints?: Record<string, any>;
  timestamp: number;
  severity: 'error' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Advertencia de validación
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
  timestamp: number;
  severity: 'warning' | 'info';
  metadata?: Record<string, any>;
}

/**
 * Regla de validación
 */
export interface ValidationRule {
  id: string;
  type: ValidationRuleType;
  field: string;
  message: string;
  value?: any;
  enabled: boolean;
  async?: boolean;
  priority: number;
  validator?: ValidationFunction;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

/**
 * Tipos de reglas de validación
 */
export enum ValidationRuleType {
  // Validaciones básicas
  REQUIRED = 'required',
  NOT_EMPTY = 'not_empty',
  NOT_NULL = 'not_null',
  NOT_UNDEFINED = 'not_undefined',
  
  // Validaciones de tipo
  IS_STRING = 'is_string',
  IS_NUMBER = 'is_number',
  IS_BOOLEAN = 'is_boolean',
  IS_ARRAY = 'is_array',
  IS_OBJECT = 'is_object',
  IS_FUNCTION = 'is_function',
  IS_DATE = 'is_date',
  IS_EMAIL = 'is_email',
  IS_URL = 'is_url',
  IS_IP = 'is_ip',
  IS_UUID = 'is_uuid',
  IS_HEX = 'is_hex',
  IS_BASE64 = 'is_base64',
  IS_JSON = 'is_json',
  
  // Validaciones de longitud
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  LENGTH = 'length',
  MIN_SIZE = 'min_size',
  MAX_SIZE = 'max_size',
  SIZE = 'size',
  
  // Validaciones numéricas
  MIN = 'min',
  MAX = 'max',
  RANGE = 'range',
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  INTEGER = 'integer',
  FLOAT = 'float',
  DECIMAL = 'decimal',
  
  // Validaciones de formato
  PATTERN = 'pattern',
  FORMAT = 'format',
  CUSTOM = 'custom',
  
  // Validaciones de contenido
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  
  // Validaciones de estructura
  HAS_PROPERTY = 'has_property',
  HAS_PROPERTIES = 'has_properties',
  PROPERTY_TYPE = 'property_type',
  PROPERTY_REQUIRED = 'property_required',
  
  // Validaciones de metaverso
  VALID_WORLD_ID = 'valid_world_id',
  VALID_AVATAR_ID = 'valid_avatar_id',
  VALID_USER_ID = 'valid_user_id',
  VALID_NFT_ID = 'valid_nft_id',
  VALID_TRANSACTION_ID = 'valid_transaction_id',
  VALID_POSITION = 'valid_position',
  VALID_ROTATION = 'valid_rotation',
  VALID_COLOR = 'valid_color',
  VALID_ANIMATION = 'valid_animation',
  VALID_PERMISSION = 'valid_permission',
  VALID_CHAT_MESSAGE = 'valid_chat_message',
  VALID_TRADE_OFFER = 'valid_trade_offer',
  VALID_BUILD_REQUEST = 'valid_build_request',
  VALID_TELEPORT_REQUEST = 'valid_teleport_request',
  VALID_INTERACTION = 'valid_interaction',
  VALID_SCRIPT = 'valid_script',
  VALID_ASSET = 'valid_asset',
  VALID_METADATA = 'valid_metadata',
  VALID_CONFIG = 'valid_config',
  VALID_EVENT = 'valid_event'
}

/**
 * Función de validación
 */
export type ValidationFunction = (
  value: any,
  rule: ValidationRule,
  context?: ValidationContext
) => boolean | Promise<boolean> | ValidationResult | Promise<ValidationResult>;

/**
 * Contexto de validación
 */
export interface ValidationContext {
  field: string;
  parent?: any;
  root?: any;
  path: string[];
  index?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Validador
 */
export interface Validator {
  id: string;
  name: string;
  version: string;
  rules: ValidationRule[];
  schemas: ValidationSchema[];
  options: ValidatorOptions;
  metadata?: Record<string, any>;
  
  /**
   * Valida un valor
   */
  validate: (value: any, rules?: ValidationRule[]) => Promise<ValidationResult>;
  
  /**
   * Valida un objeto
   */
  validateObject: (object: any, schema?: ValidationSchema) => Promise<ValidationResult>;
  
  /**
   * Valida un array
   */
  validateArray: (array: any[], rules?: ValidationRule[]) => Promise<ValidationResult>;
  
  /**
   * Valida un formulario
   */
  validateForm: (form: any, schema?: ValidationSchema) => Promise<ValidationResult>;
  
  /**
   * Agrega una regla
   */
  addRule: (rule: ValidationRule) => void;
  
  /**
   * Remueve una regla
   */
  removeRule: (ruleId: string) => void;
  
  /**
   * Obtiene una regla
   */
  getRule: (ruleId: string) => ValidationRule | null;
  
  /**
   * Lista todas las reglas
   */
  listRules: () => ValidationRule[];
  
  /**
   * Agrega un esquema
   */
  addSchema: (schema: ValidationSchema) => void;
  
  /**
   * Remueve un esquema
   */
  removeSchema: (schemaId: string) => void;
  
  /**
   * Obtiene un esquema
   */
  getSchema: (schemaId: string) => ValidationSchema | null;
  
  /**
   * Lista todos los esquemas
   */
  listSchemas: () => ValidationSchema[];
  
  /**
   * Limpia errores
   */
  clearErrors: () => void;
  
  /**
   * Obtiene errores
   */
  getErrors: () => ValidationError[];
  
  /**
   * Obtiene advertencias
   */
  getWarnings: () => ValidationWarning[];
  
  /**
   * Verifica si es válido
   */
  isValid: () => boolean;
  
  /**
   * Exporta configuración
   */
  export: () => ValidatorExport;
  
  /**
   * Importa configuración
   */
  import: (data: ValidatorExport) => void;
}

/**
 * Esquema de validación
 */
export interface ValidationSchema {
  id: string;
  name: string;
  version: string;
  fields: Record<string, ValidationField>;
  rules: ValidationRule[];
  options: SchemaOptions;
  metadata?: Record<string, any>;
}

/**
 * Campo de validación
 */
export interface ValidationField {
  name: string;
  type: ValidationFieldType;
  required: boolean;
  rules: ValidationRule[];
  defaultValue?: any;
  transform?: (value: any) => any;
  validate?: ValidationFunction;
  metadata?: Record<string, any>;
}

/**
 * Tipos de campos de validación
 */
export enum ValidationFieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  DATE = 'date',
  EMAIL = 'email',
  URL = 'url',
  IP = 'ip',
  UUID = 'uuid',
  HEX = 'hex',
  BASE64 = 'base64',
  JSON = 'json',
  FILE = 'file',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  POSITION = 'position',
  ROTATION = 'rotation',
  COLOR = 'color',
  ANIMATION = 'animation',
  PERMISSION = 'permission',
  CHAT_MESSAGE = 'chat_message',
  TRADE_OFFER = 'trade_offer',
  BUILD_REQUEST = 'build_request',
  TELEPORT_REQUEST = 'teleport_request',
  INTERACTION = 'interaction',
  SCRIPT = 'script',
  ASSET = 'asset',
  METADATA = 'metadata',
  CONFIG = 'config',
  EVENT = 'event'
}

/**
 * Opciones del validador
 */
export interface ValidatorOptions {
  strict: boolean;
  abortEarly: boolean;
  allowUnknown: boolean;
  stripUnknown: boolean;
  convert: boolean;
  cache: boolean;
  cacheSize: number;
  timeout: number;
  maxErrors: number;
  maxWarnings: number;
  locale: string;
  metadata?: Record<string, any>;
}

/**
 * Opciones del esquema
 */
export interface SchemaOptions {
  strict: boolean;
  abortEarly: boolean;
  allowUnknown: boolean;
  stripUnknown: boolean;
  convert: boolean;
  metadata?: Record<string, any>;
}

/**
 * Exportación del validador
 */
export interface ValidatorExport {
  id: string;
  name: string;
  version: string;
  rules: ValidationRule[];
  schemas: ValidationSchema[];
  options: ValidatorOptions;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE VALIDACIÓN ESPECÍFICOS
// ============================================================================

/**
 * Validación de posición 3D
 */
export interface PositionValidation {
  x: {
    min: number;
    max: number;
    required: boolean;
  };
  y: {
    min: number;
    max: number;
    required: boolean;
  };
  z: {
    min: number;
    max: number;
    required: boolean;
  };
  worldId: {
    required: boolean;
    pattern?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de rotación 3D
 */
export interface RotationValidation {
  x: {
    min: number;
    max: number;
    required: boolean;
  };
  y: {
    min: number;
    max: number;
    required: boolean;
  };
  z: {
    min: number;
    max: number;
    required: boolean;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de color
 */
export interface ColorValidation {
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'name';
  alpha: boolean;
  required: boolean;
  metadata?: Record<string, any>;
}

/**
 * Validación de animación
 */
export interface AnimationValidation {
  name: {
    required: boolean;
    pattern?: string;
    maxLength: number;
  };
  duration: {
    min: number;
    max: number;
    required: boolean;
  };
  loop: boolean;
  easing: string[];
  metadata?: Record<string, any>;
}

/**
 * Validación de permiso
 */
export interface PermissionValidation {
  action: {
    required: boolean;
    allowed: string[];
  };
  resource: {
    required: boolean;
    pattern?: string;
  };
  user: {
    required: boolean;
    pattern?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de mensaje de chat
 */
export interface ChatMessageValidation {
  content: {
    required: boolean;
    maxLength: number;
    minLength: number;
    pattern?: string;
  };
  senderId: {
    required: boolean;
    pattern?: string;
  };
  type: {
    required: boolean;
    allowed: string[];
  };
  timestamp: {
    required: boolean;
    min: number;
    max: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de oferta de comercio
 */
export interface TradeOfferValidation {
  offerer: {
    required: boolean;
    pattern?: string;
  };
  offeree: {
    required: boolean;
    pattern?: string;
  };
  items: {
    required: boolean;
    minSize: number;
    maxSize: number;
  };
  price: {
    required: boolean;
    min: number;
    currency: string;
  };
  expiresAt: {
    required: boolean;
    min: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de solicitud de construcción
 */
export interface BuildRequestValidation {
  builder: {
    required: boolean;
    pattern?: string;
  };
  worldId: {
    required: boolean;
    pattern?: string;
  };
  position: PositionValidation;
  object: {
    type: {
      required: boolean;
      allowed: string[];
    };
    properties: {
      required: boolean;
      maxSize: number;
    };
  };
  permissions: {
    required: boolean;
    maxSize: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de solicitud de teletransporte
 */
export interface TeleportRequestValidation {
  avatar: {
    required: boolean;
    pattern?: string;
  };
  from: {
    worldId: {
      required: boolean;
      pattern?: string;
    };
    position: PositionValidation;
  };
  to: {
    worldId: {
      required: boolean;
      pattern?: string;
    };
    position: PositionValidation;
  };
  timestamp: {
    required: boolean;
    min: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de interacción
 */
export interface InteractionValidation {
  actor: {
    required: boolean;
    pattern?: string;
  };
  target: {
    required: boolean;
    pattern?: string;
  };
  type: {
    required: boolean;
    allowed: string[];
  };
  data: {
    required: boolean;
    maxSize: number;
  };
  timestamp: {
    required: boolean;
    min: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de script
 */
export interface ScriptValidation {
  name: {
    required: boolean;
    pattern?: string;
    maxLength: number;
  };
  code: {
    required: boolean;
    maxLength: number;
    minLength: number;
  };
  language: {
    required: boolean;
    allowed: string[];
  };
  version: {
    required: boolean;
    pattern?: string;
  };
  permissions: {
    required: boolean;
    maxSize: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de asset
 */
export interface AssetValidation {
  id: {
    required: boolean;
    pattern?: string;
  };
  name: {
    required: boolean;
    maxLength: number;
  };
  type: {
    required: boolean;
    allowed: string[];
  };
  url: {
    required: boolean;
    pattern?: string;
  };
  size: {
    required: boolean;
    min: number;
    max: number;
  };
  format: {
    required: boolean;
    allowed: string[];
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de metadatos
 */
export interface MetadataValidation {
  title: {
    required: boolean;
    maxLength: number;
  };
  description: {
    required: boolean;
    maxLength: number;
  };
  tags: {
    required: boolean;
    maxSize: number;
    maxLength: number;
  };
  properties: {
    required: boolean;
    maxSize: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de configuración
 */
export interface ConfigValidation {
  name: {
    required: boolean;
    pattern?: string;
  };
  version: {
    required: boolean;
    pattern?: string;
  };
  environment: {
    required: boolean;
    allowed: string[];
  };
  settings: {
    required: boolean;
    maxSize: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Validación de evento
 */
export interface EventValidation {
  type: {
    required: boolean;
    pattern?: string;
  };
  source: {
    required: boolean;
    pattern?: string;
  };
  target: {
    required: boolean;
    pattern?: string;
  };
  data: {
    required: boolean;
    maxSize: number;
  };
  timestamp: {
    required: boolean;
    min: number;
  };
  priority: {
    required: boolean;
    allowed: string[];
  };
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * Utilidades de validación
 */
export interface ValidationUtils {
  /**
   * Crea un validador
   */
  createValidator: (options?: Partial<ValidatorOptions>) => Validator;
  
  /**
   * Crea un esquema
   */
  createSchema: (options?: Partial<SchemaOptions>) => ValidationSchema;
  
  /**
   * Crea una regla
   */
  createRule: (type: ValidationRuleType, options?: Partial<ValidationRule>) => ValidationRule;
  
  /**
   * Valida un valor básico
   */
  validateValue: (value: any, rules: ValidationRule[]) => Promise<ValidationResult>;
  
  /**
   * Valida un objeto básico
   */
  validateObject: (object: any, schema: ValidationSchema) => Promise<ValidationResult>;
  
  /**
   * Valida un array básico
   */
  validateArray: (array: any[], rules: ValidationRule[]) => Promise<ValidationResult>;
  
  /**
   * Valida un formulario básico
   */
  validateForm: (form: any, schema: ValidationSchema) => Promise<ValidationResult>;
  
  /**
   * Combina resultados de validación
   */
  mergeResults: (results: ValidationResult[]) => ValidationResult;
  
  /**
   * Filtra errores por severidad
   */
  filterErrors: (errors: ValidationError[], severity: string) => ValidationError[];
  
  /**
   * Filtra advertencias por severidad
   */
  filterWarnings: (warnings: ValidationWarning[], severity: string) => ValidationWarning[];
  
  /**
   * Agrupa errores por campo
   */
  groupErrorsByField: (errors: ValidationError[]) => Record<string, ValidationError[]>;
  
  /**
   * Agrupa advertencias por campo
   */
  groupWarningsByField: (warnings: ValidationWarning[]) => Record<string, ValidationWarning[]>;
  
  /**
   * Genera mensaje de error
   */
  generateErrorMessage: (error: ValidationError) => string;
  
  /**
   * Genera mensaje de advertencia
   */
  generateWarningMessage: (warning: ValidationWarning) => string;
  
  /**
   * Serializa resultado de validación
   */
  serializeResult: (result: ValidationResult) => string;
  
  /**
   * Deserializa resultado de validación
   */
  deserializeResult: (data: string) => ValidationResult;
  
  /**
   * Exporta validador
   */
  exportValidator: (validator: Validator) => string;
  
  /**
   * Importa validador
   */
  importValidator: (data: string) => Validator;
  
  /**
   * Valida esquema
   */
  validateSchema: (schema: ValidationSchema) => ValidationResult;
  
  /**
   * Optimiza esquema
   */
  optimizeSchema: (schema: ValidationSchema) => ValidationSchema;
  
  /**
   * Genera documentación de esquema
   */
  generateSchemaDocs: (schema: ValidationSchema) => string;
  
  /**
   * Ejecuta validación en paralelo
   */
  validateParallel: (values: any[], rules: ValidationRule[]) => Promise<ValidationResult[]>;
  
  /**
   * Ejecuta validación en serie
   */
  validateSerial: (values: any[], rules: ValidationRule[]) => Promise<ValidationResult[]>;
  
  /**
   * Valida con timeout
   */
  validateWithTimeout: (value: any, rules: ValidationRule[], timeout: number) => Promise<ValidationResult>;
  
  /**
   * Valida con retry
   */
  validateWithRetry: (value: any, rules: ValidationRule[], maxRetries: number) => Promise<ValidationResult>;
  
  /**
   * Valida con cache
   */
  validateWithCache: (value: any, rules: ValidationRule[], cacheKey: string) => Promise<ValidationResult>;
  
  /**
   * Limpia cache
   */
  clearCache: () => void;
  
  /**
   * Obtiene estadísticas de cache
   */
  getCacheStats: () => CacheStats;
  
  /**
   * Registra validador personalizado
   */
  registerCustomValidator: (name: string, validator: ValidationFunction) => void;
  
  /**
   * Desregistra validador personalizado
   */
  unregisterCustomValidator: (name: string) => void;
  
  /**
   * Lista validadores personalizados
   */
  listCustomValidators: () => string[];
  
  /**
   * Ejecuta validador personalizado
   */
  executeCustomValidator: (name: string, value: any, context?: ValidationContext) => Promise<ValidationResult>;
}

/**
 * Estadísticas de cache
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

/**
 * Evento de validación
 */
export interface ValidationEvent {
  type: 'started' | 'completed' | 'failed' | 'cached' | 'timeout' | 'retry';
  validator: Validator;
  value: any;
  result?: ValidationResult;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Listener de eventos de validación
 */
export interface ValidationEventListener {
  onValidationStarted: (event: ValidationEvent) => void;
  onValidationCompleted: (event: ValidationEvent) => void;
  onValidationFailed: (event: ValidationEvent) => void;
  onValidationCached: (event: ValidationEvent) => void;
  onValidationTimeout: (event: ValidationEvent) => void;
  onValidationRetry: (event: ValidationEvent) => void;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationRule,
  ValidationFunction,
  ValidationContext,
  Validator,
  ValidationSchema,
  ValidationField,
  ValidatorOptions,
  SchemaOptions,
  ValidatorExport,
  PositionValidation,
  RotationValidation,
  ColorValidation,
  AnimationValidation,
  PermissionValidation,
  ChatMessageValidation,
  TradeOfferValidation,
  BuildRequestValidation,
  TeleportRequestValidation,
  InteractionValidation,
  ScriptValidation,
  AssetValidation,
  MetadataValidation,
  ConfigValidation,
  EventValidation,
  ValidationUtils,
  CacheStats,
  ValidationEvent,
  ValidationEventListener
};

export {
  ValidationRuleType,
  ValidationFieldType
}; 