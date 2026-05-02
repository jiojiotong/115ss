import type {
  AdminFormValues,
  ImportResult,
  LinkImportResult,
  LoginResult,
  PaginatedResult,
  ResourceItem,
  SessionUser,
  SettingsFormValues,
  SettingsUpdatePayload,
  SettingsPayload,
  SeriesGroupItem,
  TgConnectionResult,
  TgDashboardPayload,
  TgScanResult,
  TgSettingsPayload,
  TgTargetItem,
  TransferLog,
  ValidateResult,
} from '../types'

const API_BASE_STORAGE_KEY = 'frontend_api_base_url'

export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export function normalizeApiBaseUrl(value: string) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '')
  if (!trimmed) {
    return ''
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

export function getSavedApiBaseUrl() {
  if (typeof window === 'undefined') {
    return ''
  }

  return normalizeApiBaseUrl(window.localStorage.getItem(API_BASE_STORAGE_KEY) || '')
}

export function saveApiBaseUrl(value: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  const normalized = normalizeApiBaseUrl(value)
  if (!normalized) {
    window.localStorage.removeItem(API_BASE_STORAGE_KEY)
    return ''
  }

  window.localStorage.setItem(API_BASE_STORAGE_KEY, normalized)
  return normalized
}

function resolveApiUrl(path: string) {
  const savedBase = getSavedApiBaseUrl()
  if (!savedBase) {
    return path
  }

  const relative = path.startsWith('/api') ? path.slice(4) : path
  return `${savedBase}${relative}`
}

function buildApiUrl(path: string, searchParams?: URLSearchParams) {
  const basePath = resolveApiUrl(path)
  if (!searchParams || !Array.from(searchParams.keys()).length) {
    return basePath
  }

  const separator = basePath.includes('?') ? '&' : '?'
  return `${basePath}${separator}${searchParams.toString()}`
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveApiUrl(input), {
    credentials: 'include',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = (await response.json().catch(() => null)) as { message?: string } | null

  if (!response.ok) {
    throw new ApiError(response.status, data?.message || '请求失败')
  }

  return data as T
}

export function getSession() {
  return request<{ user: SessionUser }>('/api/auth/me')
}

export function login(username: string, password: string) {
  return request<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function forgotPassword() {
  return request<{ ok: boolean; message: string }>('/api/auth/forgot-password', {
    method: 'POST',
  })
}

export function changePassword(payload: {
  username: string
  current_password: string
  new_password: string
}) {
  return request<{ user: SessionUser; message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request<{ ok: boolean }>('/api/auth/logout', {
    method: 'POST',
  })
}

export function getResources(params: { query: string; page: number; pageSize: number; mediaType: 'movie' | 'series' }) {
  const searchParams = new URLSearchParams()
  if (params.query) {
    searchParams.set('query', params.query)
  }
  searchParams.set('page', String(params.page))
  searchParams.set('pageSize', String(params.pageSize))
  searchParams.set('mediaType', params.mediaType)
  return request<PaginatedResult<ResourceItem>>(buildApiUrl('/api/resources', searchParams))
}

export function getSeriesGroups(params: { query: string; page: number; pageSize: number }) {
  const searchParams = new URLSearchParams()
  if (params.query) {
    searchParams.set('query', params.query)
  }
  searchParams.set('page', String(params.page))
  searchParams.set('pageSize', String(params.pageSize))
  return request<PaginatedResult<SeriesGroupItem>>(buildApiUrl('/api/resources/series-groups', searchParams))
}

export function createResource(payload: {
  title: string
  media_type: 'movie' | 'series'
  resource_size: string
  quality_label: string
  resource_url: string
  access_code: string
  note: string
  release_year: string
}) {
  return request<ResourceItem>('/api/resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateResource(
  id: number,
  payload: { title: string; media_type: 'movie' | 'series'; resource_size: string; quality_label: string; resource_url: string; access_code: string; note: string; release_year: string },
) {
  return request<ResourceItem>(`/api/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteResource(id: number) {
  return request<void>(`/api/resources/${id}`, {
    method: 'DELETE',
  })
}

export function clearAllResources() {
  return request<{ ok: boolean; deletedCount: number }>('/api/resources/clear-all', {
    method: 'POST',
  })
}

export function importResources(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<ImportResult>('/api/resources/import', {
    method: 'POST',
    body: formData,
  })
}

export function importLinksFromText(text: string) {
  return request<LinkImportResult>('/api/resources/import-links/text', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function importLinksFromFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<LinkImportResult>('/api/resources/import-links/file', {
    method: 'POST',
    body: formData,
  })
}

export function createTransfer(resourceId: number) {
  return request<TransferLog & { resource: ResourceItem }>('/api/transfers', {
    method: 'POST',
    body: JSON.stringify({ resourceId }),
  })
}

export function getTransfers(params: { page: number; pageSize: number }) {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('pageSize', String(params.pageSize))
  return request<PaginatedResult<TransferLog>>(buildApiUrl('/api/transfers', searchParams))
}

export function getSettings() {
  return request<SettingsPayload>('/api/settings')
}

export function updateSettings(payload: SettingsUpdatePayload) {
  return request<SettingsPayload>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function updateAdmin(payload: AdminFormValues) {
  return request<{ user: SessionUser }>('/api/settings/admin', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function validateSettings(payload: Partial<SettingsFormValues>) {
  return request<ValidateResult>('/api/settings/validate-115', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTgDashboard() {
  return request<TgDashboardPayload>('/api/tg')
}

export function updateTgSettings(payload: Partial<TgSettingsPayload>) {
  return request<TgSettingsPayload>('/api/tg/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function sendTgCode(payload: Partial<TgSettingsPayload>) {
  return request<TgConnectionResult>('/api/tg/send-code', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginTg(payload: { phone_code: string; password: string }) {
  return request<TgConnectionResult>('/api/tg/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutTg() {
  return request<{ ok: boolean }>('/api/tg/logout', {
    method: 'POST',
  })
}

export function testTgConnection() {
  return request<TgConnectionResult>('/api/tg/test-connection', {
    method: 'POST',
  })
}

export function createTgTarget(payload: {
  chat_ref: string
  enabled_for_scan: boolean
  enabled_for_monitor: boolean
}) {
  return request<TgTargetItem>('/api/tg/targets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTgTarget(
  id: number,
  payload: { enabled_for_scan: boolean; enabled_for_monitor: boolean },
) {
  return request<TgTargetItem>(`/api/tg/targets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTgTarget(id: number) {
  return request<void>(`/api/tg/targets/${id}`, {
    method: 'DELETE',
  })
}

export function scanTgTarget(payload: {
  scope: 'single_target' | 'all_targets'
  mode: 'incremental_500' | 'partial_5000' | 'full_history'
  target_id?: number
  start_message_id?: string
}) {
  return request<TgScanResult>('/api/tg/scan', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function clearAllTgRuns() {
  return request<{ deleted_count: number }>('/api/tg/runs', {
    method: 'DELETE',
  })
}
