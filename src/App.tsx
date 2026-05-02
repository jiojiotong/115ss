import {
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
} from 'react'
import './App.css'
import {
  ApiError,
  changePassword,
  forgotPassword,
  getTgDashboard,
  getSession,
  getSettings,
  login,
  logout,
  getSavedApiBaseUrl,
  saveApiBaseUrl,
  testTgConnection,
  updateTgSettings,
  updateSettings,
  validateSettings,
} from './lib/api'
import { LoginView } from './components/LoginView'
import { ArchiveLogo } from './components/ArchiveLogo'
import { ProfilePanel } from './components/ProfilePanel'
import { SettingsPanel } from './components/SettingsPanel'
import { StatusBanner } from './components/StatusBanner'
import { TgIngestionPanel } from './components/TgIngestionPanel'
import type {
  BannerState,
  SessionUser,
  SettingsFormValues,
  SettingsUpdatePayload,
  SettingsPayload,
  TgDashboardPayload,
  ValidateResult,
  ViewKey,
} from './types'
const BANNER_AUTO_DISMISS_MS = 4000

const emptySettingsForm: SettingsFormValues = {
  site_name: '',
  tmdb_api_key: '',
  target_folder_url: '',
  target_folder_name: '',
  one_fifteen_cookie: '',
}

const emptyTgSettingsForm = {
  api_id: '',
  api_hash: '',
  phone_number: '',
  bot_token: '',
  admin_user_id: '',
  bot_proxy_type: 'none',
  bot_proxy_host: '',
  bot_proxy_port: '',
  bot_proxy_username: '',
  bot_proxy_password: '',
  bot_proxy_secret: '',
  poll_interval_seconds: '30',
  proxy_type: 'none',
  proxy_host: '',
  proxy_port: '',
  proxy_username: '',
  proxy_password: '',
  proxy_secret: '',
  monitor_enabled: false,
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function App() {
  const [authChecking, setAuthChecking] = useState(true)
  const [authSubmitting, setAuthSubmitting] = useState<'login' | 'change' | 'forgot' | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [banner, setBanner] = useState<BannerState | null>(null)
  const [activeView, setActiveView] = useState<ViewKey>('tg')

  const [settings, setSettings] = useState<SettingsPayload | null>(null)
  const [settingsForm, setSettingsForm] = useState<SettingsFormValues>(emptySettingsForm)
  const [apiBaseUrl, setApiBaseUrl] = useState(getSavedApiBaseUrl())
  const [tgDashboard, setTgDashboard] = useState<TgDashboardPayload | null>(null)
  const [tgSettingsForm, setTgSettingsForm] = useState(emptyTgSettingsForm)
  const [validationResult, setValidationResult] = useState<ValidateResult | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [validatingSettings, setValidatingSettings] = useState(false)
  const [savingTgSettings, setSavingTgSettings] = useState(false)
  const [testingTgConnection, setTestingTgConnection] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  function showBanner(tone: BannerState['tone'], text: string) {
    setBanner({ tone, text })
  }

  useEffect(() => {
    if (!banner || banner.tone === 'error') {
      return
    }

    const timer = window.setTimeout(() => {
      setBanner((current) => (current === banner ? null : current))
    }, BANNER_AUTO_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [banner])

  function handleApiError(error: unknown) {
    if (error instanceof ApiError && error.statusCode === 401) {
      setUser(null)
      setSettings(null)
      showBanner('error', '登录状态已失效，请重新登录')
      return
    }

    showBanner('error', error instanceof Error ? error.message : '操作失败')
  }

  async function loadSettingsData() {
    const result = await getSettings()
    setSettings(result)
    setSettingsForm((current) => ({
      ...current,
      site_name: result.site_name,
      tmdb_api_key: '',
      target_folder_url: result.target_folder_url || '',
      target_folder_name: result.target_folder_name || '',
      one_fifteen_cookie: '',
    }))
    setProfileForm((current) => ({
      ...current,
      username: result.admin_username || '',
    }))
  }

  async function loadTgData(options: { syncForms?: boolean } = {}) {
    const result = await getTgDashboard()
    setTgDashboard(result)
    if (options.syncForms === false) {
      return
    }

    setTgSettingsForm({
      api_id: result.settings.api_id || '',
      api_hash: result.settings.api_hash || '',
      phone_number: result.settings.phone_number || '',
      bot_token: result.settings.bot_token || '',
      admin_user_id: result.settings.admin_user_id || '',
      bot_proxy_type: result.settings.bot_proxy_type || 'none',
      bot_proxy_host: result.settings.bot_proxy_host || '',
      bot_proxy_port: result.settings.bot_proxy_port || '',
      bot_proxy_username: result.settings.bot_proxy_username || '',
      bot_proxy_password: result.settings.bot_proxy_password || '',
      bot_proxy_secret: result.settings.bot_proxy_secret || '',
      poll_interval_seconds: result.settings.poll_interval_seconds || '30',
      proxy_type: result.settings.proxy_type || 'none',
      proxy_host: result.settings.proxy_host || '',
      proxy_port: result.settings.proxy_port || '',
      proxy_username: result.settings.proxy_username || '',
      proxy_password: result.settings.proxy_password || '',
      proxy_secret: result.settings.proxy_secret || '',
      monitor_enabled: result.settings.monitor_enabled,
    })
  }

  async function loadDashboard() {
    await loadSettingsData()
  }

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        // 首次进入时先用 /me 判断当前会话是否还有效。
        const result = await getSession()
        if (!active) {
          return
        }
        setUser(result.user)
      } catch {
        if (!active) {
          return
        }
        setUser(null)
      } finally {
        if (active) {
          setAuthChecking(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const syncSettings = useEffectEvent(async () => {
    try {
      await loadSettingsData()
    } catch (error) {
      handleApiError(error)
    }
  })

  const syncTg = useEffectEvent(async (options?: { syncForms?: boolean }) => {
    try {
      await loadTgData(options)
    } catch (error) {
      handleApiError(error)
    }
  })

  useEffect(() => {
    if (!user) {
      return
    }

    const timer = window.setTimeout(() => {
      void syncSettings()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [user])

  useEffect(() => {
    if (!user || activeView !== 'tg') {
      return
    }

    const timer = window.setTimeout(() => {
      void syncTg({ syncForms: true })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [user, activeView])

  useEffect(() => {
    if (!user || activeView !== 'tg') {
      return
    }

    const interval = window.setInterval(() => {
      void syncTg({ syncForms: false })
    }, 15000)

    return () => window.clearInterval(interval)
  }, [user, activeView])

  async function handleLogin(username: string, password: string) {
    if (!username.trim() || !password.trim()) {
      showBanner('error', '用户名和密码不能为空')
      return
    }

    setAuthSubmitting('login')
    try {
      const result = await login(username, password)
      setUser(result.user)
      showBanner(result.notice ? 'neutral' : 'success', result.notice || '登录成功')
      startTransition(() => setActiveView('tg'))
      await loadDashboard()
    } catch (error) {
      handleApiError(error)
    } finally {
      setAuthSubmitting(null)
    }
  }

  async function handleStandalonePasswordChange(
    username: string,
    currentPassword: string,
    newPassword: string,
  ) {
    setAuthSubmitting('change')
    try {
      const result = await changePassword({
        username,
        current_password: currentPassword,
        new_password: newPassword,
      })
      setProfileForm((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      showBanner('success', result.message)
    } catch (error) {
      handleApiError(error)
    } finally {
      setAuthSubmitting(null)
    }
  }

  async function handleForgotPassword() {
    setAuthSubmitting('forgot')
    try {
      const result = await forgotPassword()
      showBanner('neutral', result.message)
    } catch (error) {
      handleApiError(error)
    } finally {
      setAuthSubmitting(null)
    }
  }

  async function handleLogout() {
    try {
      await logout()
      setUser(null)
      setSettings(null)
      setValidationResult(null)
      showBanner('success', '已退出登录')
    } catch (error) {
      handleApiError(error)
    }
  }

  async function handleSettingsSave() {
    if (!settingsForm.site_name.trim()) {
      showBanner('error', '站点名称不能为空')
      return
    }

    setSavingSettings(true)
    try {
      const result = await updateSettings(settingsForm)
      setSettings(result)
      setSettingsForm({
        site_name: result.site_name,
        tmdb_api_key: '',
        target_folder_url: result.target_folder_url || '',
        target_folder_name: result.target_folder_name || '',
        one_fifteen_cookie: '',
      })
      setValidationResult(null)
      showBanner('success', '系统设置已保存')
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleStoredCookieClear() {
    if (!settings?.has_one_fifteen_cookie) {
      showBanner('neutral', '当前没有已保存的 115 Cookie')
      return
    }

    const confirmed = window.confirm('确定移除当前保存的 115 Cookie 吗？')
    if (!confirmed) {
      return
    }

    const payload: SettingsUpdatePayload = {
      ...settingsForm,
      one_fifteen_cookie: '',
      clear_one_fifteen_cookie: true,
    }

    setSavingSettings(true)
    try {
      const result = await updateSettings(payload)
      setSettings(result)
      setSettingsForm({
        site_name: result.site_name,
        tmdb_api_key: '',
        target_folder_url: result.target_folder_url || '',
        target_folder_name: result.target_folder_name || '',
        one_fifteen_cookie: '',
      })
      setValidationResult(null)
      showBanner('success', '已移除保存的 115 Cookie')
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleStoredTargetFolderClear() {
    if (!settings?.target_folder_id) {
      showBanner('neutral', '当前没有已保存的 115 转存地址')
      return
    }

    const confirmed = window.confirm('确定移除当前保存的 115 转存地址吗？')
    if (!confirmed) {
      return
    }

    setSavingSettings(true)
    try {
      const result = await updateSettings({
        ...settingsForm,
        target_folder_url: '',
        target_folder_name: '',
        clear_target_folder: true,
      })
      setSettings(result)
      setSettingsForm({
        site_name: result.site_name,
        tmdb_api_key: '',
        target_folder_url: '',
        target_folder_name: '',
        one_fifteen_cookie: '',
      })
      setValidationResult(null)
      showBanner('success', '已移除保存的 115 转存地址')
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleSettingsValidate() {
    setValidatingSettings(true)
    try {
      const result = await validateSettings(settingsForm)
      setValidationResult(result)
      setSettingsForm((current) => ({
        ...current,
        target_folder_name: result.targetFolderName || current.target_folder_name,
      }))
      showBanner('success', result.message)
    } catch (error) {
      setValidationResult(null)
      handleApiError(error)
    } finally {
      setValidatingSettings(false)
    }
  }

  function handleApiBaseUrlSave() {
    const normalized = saveApiBaseUrl(apiBaseUrl)
    setApiBaseUrl(normalized)
    showBanner('success', normalized ? `前端 API 地址已切换为 ${normalized}` : '已恢复为当前站点 /api')
  }

  async function handleTgSettingsSave() {
    setSavingTgSettings(true)
    try {
      await updateTgSettings({
        bot_token: tgSettingsForm.bot_token,
        admin_user_id: tgSettingsForm.admin_user_id,
        bot_proxy_type: tgSettingsForm.bot_proxy_type,
        bot_proxy_host: tgSettingsForm.bot_proxy_host,
        bot_proxy_port: tgSettingsForm.bot_proxy_port,
        bot_proxy_username: tgSettingsForm.bot_proxy_username,
        bot_proxy_password: tgSettingsForm.bot_proxy_password,
        bot_proxy_secret: tgSettingsForm.bot_proxy_secret,
      })
      await loadTgData()
      showBanner('success', 'TG Bot 设置已保存并热生效')
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingTgSettings(false)
    }
  }

  async function handleTgTestConnection() {
    setTestingTgConnection(true)
    try {
      const result = await testTgConnection()
      await loadTgData({ syncForms: true })
      const latencyBits = [
        result.bot_latency_ms !== null && result.bot_latency_ms !== undefined ? `Bot ${result.bot_latency_ms}ms` : '',
        result.notify_latency_ms !== null && result.notify_latency_ms !== undefined ? `通知 ${result.notify_latency_ms}ms` : '',
        result.session_latency_ms !== null && result.session_latency_ms !== undefined ? `会话 ${result.session_latency_ms}ms` : '',
      ].filter(Boolean)
      showBanner('success', latencyBits.length > 0 ? `${result.message}｜延迟：${latencyBits.join('，')}` : result.message)
    } catch (error) {
      handleApiError(error)
    } finally {
      setTestingTgConnection(false)
    }
  }

  if (authChecking) {
    return <main className="loading-screen">正在检查登录状态...</main>
  }

  if (!user) {
    return (
      <>
        <StatusBanner banner={banner} onClose={() => setBanner(null)} />
        <LoginView
          loadingAction={authSubmitting}
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          kicker="Frontend Access"
          title="115 资源搜索系统"
          subtitle="115 RESOURCE SEARCH SYSTEM"
          usernamePlaceholder="输入前端管理员用户名"
          passwordPlaceholder="输入前端管理员密码"
          forgotPasswordTip="点击“忘记密码”会直接生成前端入口恢复密码，并仅写入后台日志。"
          footnote="前端入口账号与后台管理台账号已拆分；修改前端密码请在登录后的个人设置中完成。"
        />
      </>
    )
  }

  const viewMeta: Record<ViewKey, { title: string; description: string }> = {
    'tg-scan': {
      title: '扫描模式',
      description: '该页面已从主导航下线，日常扫描请通过 TG 命令触发。',
    },
    resources: {
      title: '资源库',
      description: '检索电影与剧集资源、核对来源信息，并直接发起 115 转存。',
    },
    import: {
      title: '表格导入',
      description: '导入已经整理好的 CSV 资源清单，快速补充正式馆藏。',
    },
    'link-import': {
      title: '链接导入',
      description: '从原始文本或文件中提取 115 分享链接，自动识别提取码并入库。',
    },
    transfers: {
      title: '转存记录',
      description: '按时间回看每一次接收动作，快速定位重复接收与失效链接。',
    },
    tg: {
      title: 'TG 设置',
      description: '维护 TG Bot、用户会话和后端定时抓取等连接配置。日常执行抓取请通过 TG 命令完成。',
    },
    settings: {
      title: '115设置',
      description: '统一管理 115 凭据、TMDB Key、转存目录和关键校验操作。',
    },
    profile: {
      title: '个人设置',
      description: '查看当前网页登录身份，并在独立安全区域中修改网页登录密码。',
    },
  }

  return (
    <div className="app-shell">
      <StatusBanner banner={banner} onClose={() => setBanner(null)} />

      <header className="topbar lightweight-topbar">
        <div className="topbar-copy-block">
          <div className="topbar-brand-lockup">
            <ArchiveLogo className="topbar-logo" />
            <div className="workspace-title-block">
              <div className="workspace-title-row">
                <h1 className="workspace-title">115 资源搜索系统</h1>
                <span className="workspace-version">v1.0.1</span>
              </div>
              <p className="workspace-title-english">115 RESOURCE SEARCH SYSTEM</p>
            </div>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => startTransition(() => setActiveView('profile'))}
          >
            {user.username}
          </button>
          <button type="button" className="ghost-button" onClick={() => void handleLogout()}>
            退出
          </button>
        </div>
      </header>

        <div className="dashboard-layout lightweight-dashboard-layout">
        <aside className="control-rail">
          <nav className="view-nav" aria-label="主导航">
              {[
                ['tg', 'TG 设置'],
                ['settings', '115设置'],
                ['profile', '个人设置'],
              ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                className={activeView === key ? 'nav-pill active' : 'nav-pill'}
                onClick={() => startTransition(() => setActiveView(key as ViewKey))}
              >
                <span className="nav-index">{String(Object.keys(viewMeta).indexOf(key as ViewKey) + 1).padStart(2, '0')}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="workspace-shell lightweight-workspace-shell">
          <div className="content-grid single-column">
            <div className="content-column main-column">
          {/* 左侧主区域根据当前导航切换不同业务面板。 */}
          {activeView === 'tg' ? (
            <TgIngestionPanel
              tgDashboard={tgDashboard}
              tgSettingsForm={tgSettingsForm}
              savingTgSettings={savingTgSettings}
              testingTgConnection={testingTgConnection}
              onSettingsFieldChange={(field, value) =>
                setTgSettingsForm((current) => ({ ...current, [field]: value }))
              }
              onSettingsSave={handleTgSettingsSave}
              onTestConnection={handleTgTestConnection}
            />
          ) : null}

          {activeView === 'settings' ? (
            <SettingsPanel
              settings={settings}
              settingsForm={settingsForm}
              apiBaseUrl={apiBaseUrl}
              validationResult={validationResult}
              savingSettings={savingSettings}
              validatingSettings={validatingSettings}
              formatTime={formatTime}
              onApiBaseUrlChange={setApiBaseUrl}
              onSaveApiBaseUrl={handleApiBaseUrlSave}
              onSettingsFieldChange={(field, value) =>
                setSettingsForm((current) => ({ ...current, [field]: value }))
              }
              onSaveSettings={handleSettingsSave}
              onValidateSettings={handleSettingsValidate}
              onClearCookieInput={() =>
                setSettingsForm((current) => ({
                  ...current,
                  one_fifteen_cookie: '',
                }))
              }
              onClearStoredCookie={handleStoredCookieClear}
              onClearStoredTargetFolder={handleStoredTargetFolderClear}
            />
          ) : null}

          {activeView === 'profile' ? (
            <ProfilePanel
              user={user}
              username={profileForm.username}
              currentPassword={profileForm.currentPassword}
              newPassword={profileForm.newPassword}
              confirmPassword={profileForm.confirmPassword}
              saving={authSubmitting === 'change'}
              onFieldChange={(field, value) =>
                setProfileForm((current) => ({
                  ...current,
                  [field]: value,
                }))
              }
              onSubmit={() =>
                handleStandalonePasswordChange(
                  profileForm.username,
                  profileForm.currentPassword,
                  profileForm.newPassword,
                )
              }
            />
          ) : null}

            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default App
