import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import * as api from './lib/api'

vi.mock('./lib/api', async () => {
  class ApiError extends Error {
    statusCode: number

    constructor(statusCode: number, message: string) {
      super(message)
      this.name = 'ApiError'
      this.statusCode = statusCode
    }
  }

  return {
    ApiError,
    changePassword: vi.fn(),
    createResource: vi.fn(),
    createTgTarget: vi.fn(),
    createTransfer: vi.fn(),
    deleteResource: vi.fn(),
    deleteTgTarget: vi.fn(),
    forgotPassword: vi.fn(),
    getResources: vi.fn(),
    getSeriesGroups: vi.fn(),
    getSession: vi.fn(),
    getSettings: vi.fn(),
    getTgDashboard: vi.fn(),
    getTransfers: vi.fn(),
    importLinksFromFile: vi.fn(),
    importLinksFromText: vi.fn(),
    importResources: vi.fn(),
    login: vi.fn(),
    loginTg: vi.fn(),
    logout: vi.fn(),
    logoutTg: vi.fn(),
    getSavedApiBaseUrl: vi.fn(() => ''),
    scanTgTarget: vi.fn(),
    saveApiBaseUrl: vi.fn((value: string) => value),
    sendTgCode: vi.fn(),
    testTgConnection: vi.fn(),
    updateResource: vi.fn(),
    updateSettings: vi.fn(),
    updateTgSettings: vi.fn(),
    updateTgTarget: vi.fn(),
    validateSettings: vi.fn(),
  }
})

function primeAuthenticatedMocks() {
  vi.mocked(api.getSession).mockResolvedValue({ user: { id: 1, username: 'admin' } })
  vi.mocked(api.getResources).mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, movieTotal: 0, seriesTotal: 0, overallTotal: 0 })
  vi.mocked(api.getSeriesGroups).mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, movieTotal: 0, seriesTotal: 0, overallTotal: 0 })
  vi.mocked(api.getTransfers).mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0 })
  vi.mocked(api.getSettings).mockResolvedValue({
    site_name: '115 NAS 转存管理台',
    admin_username: 'admin',
    target_folder_url: 'https://115.com/?cid=2001&offset=0&mode=wangpan',
    target_folder_id: '2001',
    target_folder_name: '电影',
    has_tmdb_api_key: false,
    has_one_fifteen_cookie: true,
    masked_one_fifteen_cookie: 'UID=***SEID',
    updated_at: '2026-04-24T10:00:00.000Z',
  })
  vi.mocked(api.getTgDashboard).mockResolvedValue({
    settings: {
      api_id: '123456',
      api_hash: '',
      has_api_hash: true,
      phone_number: '+8613800000000',
      has_session: false,
      session_status: 'logged_out',
      bot_token: '',
      has_bot_token: true,
      admin_user_id: '123456789',
      bot_proxy_type: 'none',
      bot_proxy_host: '',
      bot_proxy_port: '',
      bot_proxy_username: '',
      bot_proxy_password: '',
      has_bot_proxy_password: false,
      bot_proxy_secret: '',
      has_bot_proxy_secret: false,
      poll_interval_seconds: '30',
      proxy_type: 'none',
      proxy_host: '',
      proxy_port: '',
      proxy_username: '',
      proxy_password: '',
      proxy_secret: '',
      monitor_enabled: false,
      scheduled_scan_enabled: false,
      scheduled_scan_times: '',
      last_error: '',
      updated_at: '2026-04-24T10:00:00.000Z',
    },
    targets: [],
    runs: [],
    runtime: {
      runtime_status: 'idle',
      monitor_running: false,
      pending_login: false,
      last_runtime_error: '',
    },
  })
}

async function flushTimers() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('支持登录并默认进入 TG 设置页', async () => {
    vi.mocked(api.getSession).mockRejectedValue(new api.ApiError(401, '未登录'))
    vi.mocked(api.login).mockResolvedValue({ user: { id: 1, username: 'admin' }, notice: null })
    vi.mocked(api.getResources).mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, movieTotal: 0, seriesTotal: 0, overallTotal: 0 })
    vi.mocked(api.getSeriesGroups).mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0, movieTotal: 0, seriesTotal: 0, overallTotal: 0 })
    vi.mocked(api.getTransfers).mockResolvedValue({ items: [], page: 1, pageSize: 8, total: 0 })
    vi.mocked(api.getSettings).mockResolvedValue({
      site_name: '115 NAS 转存管理台',
      admin_username: 'admin',
      target_folder_url: 'https://115.com/?cid=2001&offset=0&mode=wangpan',
      target_folder_id: '2001',
      target_folder_name: '电影',
      has_tmdb_api_key: false,
      has_one_fifteen_cookie: true,
      masked_one_fifteen_cookie: 'UID=***SEID',
      updated_at: '2026-04-24T10:00:00.000Z',
    })
    vi.mocked(api.getTgDashboard).mockResolvedValue({
      settings: {
        api_id: '123456',
        api_hash: '',
        has_api_hash: true,
        phone_number: '+8613800000000',
        has_session: false,
        session_status: 'logged_out',
        bot_token: '',
        has_bot_token: true,
        admin_user_id: '123456789',
        bot_proxy_type: 'none',
        bot_proxy_host: '',
        bot_proxy_port: '',
        bot_proxy_username: '',
        bot_proxy_password: '',
        has_bot_proxy_password: false,
        bot_proxy_secret: '',
        has_bot_proxy_secret: false,
        poll_interval_seconds: '30',
        proxy_type: 'none',
        proxy_host: '',
        proxy_port: '',
        proxy_username: '',
        proxy_password: '',
        proxy_secret: '',
        monitor_enabled: false,
        scheduled_scan_enabled: false,
        scheduled_scan_times: '',
        last_error: '',
        updated_at: '2026-04-24T10:00:00.000Z',
      },
      targets: [],
      runs: [],
      runtime: {
        runtime_status: 'idle',
        monitor_running: false,
        pending_login: false,
        last_runtime_error: '',
      },
    })

    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByLabelText('用户名')).toBeInTheDocument())
    await user.type(screen.getByLabelText('用户名'), 'admin')
    await user.type(screen.getByLabelText('密码'), 'admin123456')
    await user.click(screen.getByRole('button', { name: '登录' }))

    await flushTimers()

    await waitFor(() => {
      expect(screen.getByText('Bot 设置')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: '资源库' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '扫描模式' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '表格导入' })).not.toBeInTheDocument()
  })

  it('点击忘记密码会触发恢复密码生成', async () => {
    vi.mocked(api.getSession).mockRejectedValue(new api.ApiError(401, '未登录'))
    vi.mocked(api.forgotPassword).mockResolvedValue({ ok: true, message: '已生成恢复密码并写入后台日志' })

    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByRole('button', { name: '忘记密码' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '忘记密码' }))

    await waitFor(() => expect(api.forgotPassword).toHaveBeenCalledTimes(1))
  })

  it('系统设置保存时会提交 115 和 TMDB 配置', async () => {
    primeAuthenticatedMocks()
    vi.mocked(api.updateSettings).mockResolvedValue({
      site_name: '家庭影音库',
      admin_username: 'admin',
      target_folder_url: 'https://115.com/?cid=556677&offset=0&mode=wangpan',
      target_folder_id: '556677',
      target_folder_name: '电影',
      has_tmdb_api_key: true,
      has_one_fifteen_cookie: true,
      masked_one_fifteen_cookie: 'UID=***SEID',
      updated_at: '2026-04-24T10:00:00.000Z',
    })

    const user = userEvent.setup()
    render(<App />)

    await flushTimers()

    await user.click(screen.getByRole('button', { name: '115设置' }))
    await user.clear(screen.getByLabelText('115 转存地址'))
    await user.type(screen.getByLabelText('115 转存地址'), 'https://115.com/?cid=556677&offset=0&mode=wangpan')
    await user.type(screen.getByLabelText('TMDB API Key'), 'tmdb-demo-key')
    await user.click(screen.getByRole('button', { name: '保存设置' }))

    await waitFor(() => {
      expect(api.updateSettings).toHaveBeenCalledWith({
        site_name: '115 NAS 转存管理台',
        tmdb_api_key: 'tmdb-demo-key',
        target_folder_url: 'https://115.com/?cid=556677&offset=0&mode=wangpan',
        target_folder_name: '电影',
        one_fifteen_cookie: '',
      })
    })
  })

  it('校验 115 配置成功后会自动回填目录名称', async () => {
    primeAuthenticatedMocks()
    vi.mocked(api.validateSettings).mockResolvedValue({
      ok: true,
      userId: '9988',
      targetFolderId: '2001',
      targetFolderName: '自动识别目录',
      message: '115 Cookie 可用，且转存目录“自动识别目录”可访问',
    })

    const user = userEvent.setup()
    render(<App />)

    await flushTimers()

    await user.click(screen.getByRole('button', { name: '115设置' }))
    await user.click(screen.getByRole('button', { name: '校验 115 配置' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('自动识别目录')).toBeInTheDocument()
    })
  })

  it('TG 设置页会加载并提交热设置', async () => {
    primeAuthenticatedMocks()
    vi.mocked(api.updateTgSettings).mockResolvedValue({
      api_id: '123456',
      api_hash: '',
      has_api_hash: true,
      phone_number: '+8613800000000',
      has_session: false,
      session_status: 'logged_out',
      bot_token: '',
      has_bot_token: true,
      admin_user_id: '987654321',
      bot_proxy_type: 'none',
      bot_proxy_host: '',
      bot_proxy_port: '',
      bot_proxy_username: '',
      bot_proxy_password: '',
      has_bot_proxy_password: false,
      bot_proxy_secret: '',
      has_bot_proxy_secret: false,
      poll_interval_seconds: '45',
      proxy_type: 'none',
      proxy_host: '',
      proxy_port: '',
      proxy_username: '',
      proxy_password: '',
      proxy_secret: '',
      monitor_enabled: false,
      scheduled_scan_enabled: false,
      scheduled_scan_times: '',
      last_error: '',
      updated_at: '2026-04-24T10:00:00.000Z',
    })

    const user = userEvent.setup()
    render(<App />)

    await flushTimers()

    await waitFor(() => expect(screen.getByText('Bot 设置')).toBeInTheDocument())
    await user.clear(screen.getByLabelText('管理员用户 ID'))
    await user.type(screen.getByLabelText('管理员用户 ID'), '987654321')
    await user.selectOptions(screen.getByLabelText('Bot 代理类型'), 'socks5')
    await user.type(screen.getByLabelText('Bot 代理主机'), '127.0.0.1')
    await user.type(screen.getByLabelText('Bot 代理端口'), '1080')
    await user.click(screen.getByRole('button', { name: '保存 Bot 设置' }))

    await waitFor(() => {
      expect(api.updateTgSettings).toHaveBeenCalledWith({
        bot_token: '',
        admin_user_id: '987654321',
        bot_proxy_type: 'socks5',
        bot_proxy_host: '127.0.0.1',
        bot_proxy_port: '1080',
        bot_proxy_username: '',
        bot_proxy_password: '',
        bot_proxy_secret: '',
      })
    })
  })

  it('个人中心仍可作为独立入口打开', async () => {
    primeAuthenticatedMocks()

    const user = userEvent.setup()
    render(<App />)

    await flushTimers()
    await user.click(screen.getByRole('button', { name: '个人设置' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '个人中心' })).toBeInTheDocument()
    })
  })
})
