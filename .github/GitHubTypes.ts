/**
 * 🐙 GitHubTypes - Tipos e Interfaces de GitHub
 * 
 * Responsabilidades:
 * - Definición de tipos TypeScript para GitHub
 * - Interfaces de workflows y CI/CD
 * - Tipos de releases y deployments
 * - Estructuras de datos de GitHub
 */

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

export interface GitHubConfig {
  repository: string;
  owner: string;
  branch: string;
  token: string;
  apiUrl: string;
  webhookSecret: string;
  autoMerge: boolean;
  requireReviews: number;
  enableDependabot: boolean;
}

export interface WorkflowConfig {
  name: string;
  trigger: WorkflowTrigger;
  jobs: JobConfig[];
  environment: string;
  concurrency: ConcurrencyConfig;
  permissions: PermissionConfig;
}

export interface WorkflowTrigger {
  push?: PushTrigger;
  pull_request?: PullRequestTrigger;
  schedule?: ScheduleTrigger;
  workflow_dispatch?: WorkflowDispatchTrigger;
}

export interface PushTrigger {
  branches: string[];
  paths?: string[];
  tags?: string[];
}

export interface PullRequestTrigger {
  branches: string[];
  types: string[];
}

export interface ScheduleTrigger {
  cron: string;
}

export interface WorkflowDispatchTrigger {
  inputs: WorkflowInput[];
}

export interface WorkflowInput {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  default?: any;
}

// ============================================================================
// INTERFACES DE JOBS Y STEPS
// ============================================================================

export interface JobConfig {
  name: string;
  runs_on: string;
  steps: StepConfig[];
  needs?: string[];
  if?: string;
  timeout_minutes?: number;
  strategy?: StrategyConfig;
}

export interface StepConfig {
  name: string;
  uses?: string;
  run?: string;
  with?: Record<string, any>;
  env?: Record<string, string>;
  if?: string;
  continue_on_error?: boolean;
}

export interface StrategyConfig {
  matrix: Record<string, any[]>;
  fail_fast?: boolean;
  max_parallel?: number;
}

export interface ConcurrencyConfig {
  group: string;
  cancel_in_progress?: boolean;
}

export interface PermissionConfig {
  contents?: 'read' | 'write';
  issues?: 'read' | 'write';
  pull_requests?: 'read' | 'write';
  actions?: 'read' | 'write';
  packages?: 'read' | 'write';
}

// ============================================================================
// INTERFACES DE RELEASES
// ============================================================================

export interface ReleaseConfig {
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  target_commitish: string;
  assets: ReleaseAsset[];
}

export interface ReleaseAsset {
  name: string;
  path: string;
  content_type: string;
}

export interface Release {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: ReleaseAsset[];
  url: string;
  html_url: string;
}

// ============================================================================
// INTERFACES DE ISSUES Y PULL REQUESTS
// ============================================================================

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Label[];
  assignees: User[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  user: User;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  head: Branch;
  base: Branch;
  user: User;
  assignees: User[];
  labels: Label[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface User {
  id: number;
  login: string;
  avatar_url: string;
  type: 'User' | 'Organization';
}

export interface Branch {
  ref: string;
  sha: string;
  repo: Repository;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description?: string;
  fork: boolean;
  url: string;
  html_url: string;
}

// ============================================================================
// INTERFACES DE WORKFLOW RUNS
// ============================================================================

export interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  run_number: number;
  event: string;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  workflow_id: number;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  jobs_url: string;
  logs_url: string;
  check_suite_url: string;
  artifacts_url: string;
  cancel_url: string;
  rerun_url: string;
  workflow_url: string;
  head_commit: Commit;
  repository: Repository;
  head_repository: Repository;
}

export interface Commit {
  id: string;
  tree_id: string;
  message: string;
  timestamp: string;
  author: CommitAuthor;
  committer: CommitAuthor;
}

export interface CommitAuthor {
  name: string;
  email: string;
  date: string;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type WorkflowStatus = 'queued' | 'in_progress' | 'completed' | 'waiting';
export type WorkflowConclusion = 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
export type IssueState = 'open' | 'closed';
export type PullRequestState = 'open' | 'closed' | 'merged';
export type Permission = 'read' | 'write';

// ============================================================================
// INTERFACES DE EVENTOS
// ============================================================================

export interface GitHubEvent {
  type: string;
  payload: any;
  timestamp: string;
  delivery: string;
}

export interface PushEvent extends GitHubEvent {
  type: 'push';
  payload: {
    ref: string;
    before: string;
    after: string;
    repository: Repository;
    pusher: User;
    commits: Commit[];
  };
}

export interface PullRequestEvent extends GitHubEvent {
  type: 'pull_request';
  payload: {
    action: 'opened' | 'closed' | 'synchronize' | 'reopened' | 'assigned' | 'unassigned' | 'labeled' | 'unlabeled';
    pull_request: PullRequest;
    repository: Repository;
    sender: User;
  };
}

export interface ReleaseEvent extends GitHubEvent {
  type: 'release';
  payload: {
    action: 'published' | 'unpublished' | 'created' | 'edited' | 'deleted' | 'prereleased';
    release: Release;
    repository: Repository;
    sender: User;
  };
} 