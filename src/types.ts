export type ViewKey = 'tg-scan' | 'resources' | 'import' | 'link-import' | 'transfers' | 'settings' | 'tg' | 'profile'

export interface SessionUser {
  id: number
  username: string
}

export interface LoginResult {
  user: SessionUser
  notice: string | null
}

export interface ResourceItem {
  id: number
  title: string
  title_normalized: string
  media_type: 'movie' | 'series' | null
  series_group_title?: string | null
  series_episode_label?: string | null
  tmdb_media_id?: string | null
  tmdb_media_name?: string | null
  tmdb_total_seasons?: number | null
  tmdb_total_episodes?: number | null
  tmdb_match_status?: string | null
  tmdb_matched_at?: string | null
  resource_size: string | null
  quality_label: string | null
  resource_url: string
  access_code: string | null
  note: string | null
  release_year: string | null
  source_type?: string | null
  source_chat_title?: string | null
  source_message_id?: string | null
  created_at: string
  updated_at: string
}

export interface TransferLog {
  id: number
  resource_id: number
  resource_title: string | null
  title_snapshot: string
  status: 'success' | 'duplicate' | 'error'
  message: string
  target_folder_id: string | null
  created_at: string
}

export interface SettingsPayload {
  site_name: string
  admin_username: string
  has_tmdb_api_key: boolean
  target_folder_url: string
  target_folder_id: string | null
  target_folder_name: string | null
  has_one_fifteen_cookie: boolean
  masked_one_fifteen_cookie: string
  updated_at: string
}

export interface AdminFormValues {
  username: string
  current_password: string
  new_password: string
}

export interface SettingsFormValues {
  site_name: string
  tmdb_api_key: string
  target_folder_url: string
  target_folder_name: string
  one_fifteen_cookie: string
}

export interface SettingsUpdatePayload extends SettingsFormValues {
  clear_one_fifteen_cookie?: boolean
  clear_target_folder?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  movieTotal?: number
  seriesTotal?: number
  overallTotal?: number
}

export interface SeriesGroupItem {
  group_title: string
  release_year: string | null
  episode_count: number
  latest_episode_label: string | null
  tmdb_total_seasons?: number | null
  tmdb_total_episodes?: number | null
  tmdb_match_status?: string | null
  children: ResourceItem[]
}

export interface ImportFailure {
  line: number
  reason: string
}

export interface ImportResult {
  total: number
  successCount: number
  failureCount: number
  failures: ImportFailure[]
}

export interface LinkImportResult {
  total: number
  successCount: number
  duplicateCount: number
  failureCount: number
  failures: Array<{
    index: number
    snippet: string
    reason: string
  }>
}

export interface ValidateResult {
  ok: boolean
  userId: string
  targetFolderId: string
  targetFolderName: string
  message: string
}

export interface BannerState {
  tone: 'neutral' | 'success' | 'error'
  text: string
}

export interface TgSettingsPayload {
  api_id: string
  api_hash: string
  has_api_hash?: boolean
  phone_number: string
  has_session: boolean
  session_status: string
  bot_token: string
  has_bot_token?: boolean
  admin_user_id: string
  bot_proxy_type: string
  bot_proxy_host: string
  bot_proxy_port: string
  bot_proxy_username: string
  bot_proxy_password: string
  has_bot_proxy_password?: boolean
  bot_proxy_secret: string
  has_bot_proxy_secret?: boolean
  poll_interval_seconds: string
  proxy_type: string
  proxy_host: string
  proxy_port: string
  proxy_username: string
  proxy_password: string
  has_proxy_password?: boolean
  proxy_secret: string
  has_proxy_secret?: boolean
  monitor_enabled: boolean
  scheduled_scan_enabled: boolean
  scheduled_scan_times: string
  last_error: string
  updated_at: string
}

export interface TgTargetItem {
  id: number
  chat_ref: string
  chat_id: string
  chat_title: string
  chat_username: string
  chat_type: string
  enabled_for_scan: boolean
  enabled_for_monitor: boolean
  last_scanned_message_id: string | null
  last_seen_message_id: string | null
  naming_rule: string | null
  updated_at: string
}

export interface TgScanRunItem {
  id: number
  run_type: string
  target_chat_id: string
  target_chat_title: string
  message_count: number
  link_count: number
  inserted_count: number
  duplicate_count: number
  failed_count: number
  error_message: string | null
  created_at: string
  finished_at: string | null
}

export interface TgRuntimePayload {
  runtime_status: string
  monitor_running: boolean
  scheduled_scan_running?: boolean
  pending_login: boolean
  last_runtime_error: string
}

export interface TgDashboardPayload {
  settings: TgSettingsPayload
  targets: TgTargetItem[]
  runs: TgScanRunItem[]
  runtime: TgRuntimePayload
}

export interface TgConnectionResult {
  ok: boolean
  message: string
  user_id?: string
  display_name?: string
  is_code_via_app?: boolean
  bot_latency_ms?: number | null
  notify_latency_ms?: number | null
  session_latency_ms?: number | null
}

export interface TgScanResult {
  target_chat_title: string
  message_count: number
  link_count: number
  inserted_count: number
  duplicate_count: number
  failed_count: number
  error_message: string
  last_message_id: string | null
  source_mode?: string
  scope?: string
  scan_mode?: string
  completion_reason?: string | null
  target_count?: number
  results?: TgScanResult[]
}
