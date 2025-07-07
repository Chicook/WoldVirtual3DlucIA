const { gql } = require('graphql-tag');

const typeDefs = gql`
  # Tipos escalares personalizados
  scalar DateTime
  scalar JSON

  # Tipos principales
  type Package {
    id: ID!
    name: String!
    version: String!
    description: String
    homepage: String
    repository: String
    license: String
    author: String
    dependencies: [Dependency!]!
    devDependencies: [Dependency!]!
    peerDependencies: [Dependency!]!
    optionalDependencies: [Dependency!]!
    scripts: JSON
    keywords: [String!]
    engines: JSON
    os: [String!]
    cpu: [String!]
    status: PackageStatus!
    lastUpdated: DateTime!
    size: Int
    vulnerabilities: [Vulnerability!]!
  }

  type Dependency {
    id: ID!
    name: String!
    version: String!
    requiredVersion: String!
    installedVersion: String
    isInstalled: Boolean!
    isMissing: Boolean!
    isOutdated: Boolean!
    isVulnerable: Boolean!
    package: Package
    module: Module
    type: DependencyType!
    status: DependencyStatus!
    lastChecked: DateTime!
  }

  type Module {
    id: ID!
    name: String!
    path: String!
    type: ModuleType!
    packageJson: JSON
    dependencies: [Dependency!]!
    devDependencies: [Dependency!]!
    peerDependencies: [Dependency!]!
    optionalDependencies: [Dependency!]!
    missingDependencies: [Dependency!]!
    outdatedDependencies: [Dependency!]!
    vulnerableDependencies: [Dependency!]!
    status: ModuleStatus!
    lastAnalyzed: DateTime!
    size: Int
    fileCount: Int
  }

  type Vulnerability {
    id: ID!
    packageName: String!
    severity: VulnerabilitySeverity!
    title: String!
    description: String!
    cve: String
    cvss: Float
    affectedVersions: [String!]!
    fixedVersions: [String!]!
    publishedDate: DateTime!
    lastUpdated: DateTime!
    references: [String!]!
  }

  type RestoreOperation {
    id: ID!
    type: RestoreType!
    status: RestoreStatus!
    packages: [String!]!
    modules: [String!]!
    startedAt: DateTime!
    completedAt: DateTime
    duration: Float
    successCount: Int!
    failureCount: Int!
    errors: [String!]!
    warnings: [String!]!
  }

  type DependencyReport {
    id: ID!
    generatedAt: DateTime!
    summary: DependencySummary!
    modules: [ModuleReport!]!
    packages: [PackageReport!]!
    vulnerabilities: [VulnerabilityReport!]!
    recommendations: [Recommendation!]!
  }

  type DependencySummary {
    totalModules: Int!
    totalPackages: Int!
    totalDependencies: Int!
    missingDependencies: Int!
    outdatedDependencies: Int!
    vulnerableDependencies: Int!
    overallHealth: Float!
    riskLevel: RiskLevel!
  }

  type ModuleReport {
    moduleId: ID!
    moduleName: String!
    modulePath: String!
    dependencyCount: Int!
    missingCount: Int!
    outdatedCount: Int!
    vulnerableCount: Int!
    healthScore: Float!
    status: ModuleStatus!
  }

  type PackageReport {
    packageName: String!
    currentVersion: String!
    latestVersion: String!
    isOutdated: Boolean!
    vulnerabilityCount: Int!
    downloadCount: Int!
    lastUpdated: DateTime!
    status: PackageStatus!
  }

  type VulnerabilityReport {
    packageName: String!
    severity: VulnerabilitySeverity!
    count: Int!
    affectedModules: [String!]!
    recommendations: [String!]!
  }

  type Recommendation {
    id: ID!
    type: RecommendationType!
    priority: RecommendationPriority!
    title: String!
    description: String!
    action: String!
    affectedPackages: [String!]!
    estimatedTime: Int!
    impact: RecommendationImpact!
  }

  type DependencyMetrics {
    id: ID!
    timestamp: DateTime!
    totalPackages: Int!
    totalDependencies: Int!
    missingDependencies: Int!
    outdatedDependencies: Int!
    vulnerableDependencies: Int!
    averageHealthScore: Float!
    topVulnerablePackages: [String!]!
    mostOutdatedPackages: [String!]!
    dependencyGrowth: [DependencyGrowthPoint!]!
  }

  type DependencyGrowthPoint {
    date: DateTime!
    totalDependencies: Int!
    newDependencies: Int!
    removedDependencies: Int!
  }

  # Enums
  enum PackageStatus {
    ACTIVE
    DEPRECATED
    VULNERABLE
    OUTDATED
    MISSING
    UNKNOWN
  }

  enum DependencyType {
    PRODUCTION
    DEVELOPMENT
    PEER
    OPTIONAL
  }

  enum DependencyStatus {
    INSTALLED
    MISSING
    OUTDATED
    VULNERABLE
    CONFLICTING
  }

  enum ModuleType {
    NODE_MODULE
    REACT_COMPONENT
    ANGULAR_MODULE
    VUE_COMPONENT
    PYTHON_PACKAGE
    JAVA_MODULE
    DOTNET_PACKAGE
    OTHER
  }

  enum ModuleStatus {
    HEALTHY
    WARNING
    CRITICAL
    UNKNOWN
  }

  enum VulnerabilitySeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum RestoreType {
    ALL
    SELECTIVE
    MODULE
    PACKAGE
  }

  enum RestoreStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    FAILED
    CANCELLED
  }

  enum RiskLevel {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum RecommendationType {
    UPDATE_PACKAGE
    REMOVE_PACKAGE
    ADD_PACKAGE
    FIX_VULNERABILITY
    RESOLVE_CONFLICT
    OPTIMIZE_DEPENDENCIES
  }

  enum RecommendationPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum RecommendationImpact {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  # Input types
  input PackageInput {
    name: String!
    version: String!
    description: String
    homepage: String
    repository: String
    license: String
    author: String
  }

  input DependencyInput {
    name: String!
    version: String!
    type: DependencyType!
    moduleId: ID!
  }

  input ModuleInput {
    name: String!
    path: String!
    type: ModuleType!
  }

  input RestoreInput {
    type: RestoreType!
    packages: [String!]
    modules: [ID!]
    force: Boolean
  }

  input DependencyFilter {
    moduleId: ID
    type: DependencyType
    status: DependencyStatus
    isMissing: Boolean
    isOutdated: Boolean
    isVulnerable: Boolean
  }

  input PackageFilter {
    status: PackageStatus
    hasVulnerabilities: Boolean
    isOutdated: Boolean
  }

  # Queries
  type Query {
    # Paquetes
    packages(filter: PackageFilter): [Package!]!
    package(name: String!): Package
    packageByName(name: String!): Package
    
    # Dependencias
    dependencies(filter: DependencyFilter): [Dependency!]!
    dependency(id: ID!): Dependency
    missingDependencies: [Dependency!]!
    outdatedDependencies: [Dependency!]!
    vulnerableDependencies: [Dependency!]!
    
    # Módulos
    modules: [Module!]!
    module(id: ID!): Module
    moduleByPath(path: String!): Module
    analyzeModule(moduleId: ID!): Module!
    
    # Vulnerabilidades
    vulnerabilities: [Vulnerability!]!
    vulnerability(id: ID!): Vulnerability
    vulnerabilitiesByPackage(packageName: String!): [Vulnerability!]!
    
    # Operaciones de restauración
    restoreOperations: [RestoreOperation!]!
    restoreOperation(id: ID!): RestoreOperation
    
    # Reportes
    dependencyReport: DependencyReport!
    generateReport: DependencyReport!
    
    # Métricas
    dependencyMetrics: DependencyMetrics!
    dependencyMetricsHistory(days: Int): [DependencyMetrics!]!
    
    # Análisis
    analyzeAllModules: [Module!]!
    scanDependencies: [Dependency!]!
    checkVulnerabilities: [Vulnerability!]!
    
    # Salud del sistema
    systemHealth: SystemHealth!
    dependencyHealth: DependencyHealth!
  }

  type SystemHealth {
    status: String!
    uptime: Float!
    memoryUsage: Float!
    activeOperations: Int!
    lastError: String
  }

  type DependencyHealth {
    overallScore: Float!
    riskLevel: RiskLevel!
    totalIssues: Int!
    criticalIssues: Int!
    recommendations: [Recommendation!]!
  }

  # Mutations
  type Mutation {
    # Gestión de paquetes
    installPackage(input: PackageInput!): Package!
    updatePackage(name: String!, version: String!): Package!
    removePackage(name: String!): Boolean!
    
    # Gestión de dependencias
    addDependency(input: DependencyInput!): Dependency!
    updateDependency(id: ID!, version: String!): Dependency!
    removeDependency(id: ID!): Boolean!
    
    # Gestión de módulos
    addModule(input: ModuleInput!): Module!
    updateModule(id: ID!, input: ModuleInput!): Module!
    removeModule(id: ID!): Boolean!
    
    # Operaciones de restauración
    restoreDependencies(input: RestoreInput!): RestoreOperation!
    cancelRestore(operationId: ID!): RestoreOperation!
    
    # Gestión de vulnerabilidades
    fixVulnerability(vulnerabilityId: ID!): Vulnerability!
    ignoreVulnerability(vulnerabilityId: ID!, reason: String!): Vulnerability!
    
    # Operaciones de limpieza
    cleanupCache: Boolean!
    cleanupNodeModules: Boolean!
    cleanupLockFiles: Boolean!
    
    # Operaciones de análisis
    forceAnalyzeModules: [Module!]!
    forceScanDependencies: [Dependency!]!
    forceCheckVulnerabilities: [Vulnerability!]!
  }

  # Subscriptions
  type Subscription {
    packageInstalled: Package!
    dependencyUpdated: Dependency!
    vulnerabilityDetected: Vulnerability!
    restoreOperationUpdated: RestoreOperation!
    moduleAnalyzed: Module!
  }
`;

module.exports = { typeDefs }; 