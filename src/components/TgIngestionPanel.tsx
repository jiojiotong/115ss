import { Panel } from './Panel'
import type { TgDashboardPayload } from '../types'

interface TgSettingsFormValue {
  api_id: string
  api_hash: string
  phone_number: string
  bot_token: string
  admin_user_id: string
  poll_interval_seconds: string
  bot_proxy_type: string
  bot_proxy_host: string
  bot_proxy_port: string
  bot_proxy_username: string
  bot_proxy_password: string
  bot_proxy_secret: string
  monitor_enabled: boolean
}

interface TgIngestionPanelProps {
  tgDashboard: TgDashboardPayload | null
  tgSettingsForm: TgSettingsFormValue
  savingTgSettings: boolean
  testingTgConnection: boolean
  onSettingsFieldChange: (field: keyof TgSettingsFormValue, value: string | boolean) => void
  onSettingsSave: () => Promise<void>
  onTestConnection: () => Promise<void>
}

export function TgIngestionPanel({
  tgDashboard,
  tgSettingsForm,
  savingTgSettings,
  testingTgConnection,
  onSettingsFieldChange,
  onSettingsSave,
  onTestConnection,
}: TgIngestionPanelProps) {
  const showSocks5Fields = tgSettingsForm.bot_proxy_type === 'socks5'
  const hasBotProxy =
    tgDashboard?.settings.bot_proxy_type === 'socks5' &&
    Boolean(tgDashboard.settings.bot_proxy_host) &&
    Boolean(tgDashboard.settings.bot_proxy_port)

  return (
    <Panel
      eyebrow="TG Settings"
      title="TG 设置"
      description="前端仅保留 TG Bot 配置。群抓取会话、运行状态与调度只在后端维护。"
    >
      <div className="result-stack">
        <div className="collection-bar">
          <article className="collection-stat">
            <span>Bot 状态</span>
            <strong>{tgDashboard?.settings.has_bot_token ? '已配置' : '未配置'}</strong>
          </article>
          <article className="collection-stat">
            <span>管理员目标</span>
            <strong>{tgDashboard?.settings.admin_user_id || '--'}</strong>
          </article>
          <article className="collection-stat">
            <span>Bot 代理</span>
            <strong>{hasBotProxy ? '已配置' : '未配置'}</strong>
          </article>
        </div>

        <div className="section-shell">
          <div className="section-shell-heading">
            <p className="panel-eyebrow">Bot Access</p>
            <h3>Bot 设置</h3>
            <p className="panel-description">只用于 TG 搜索、命令入口和管理员提醒。群抓取历史与调度状态不在前端展示。</p>
          </div>
          <form
            className="form-grid settings-grid"
            onSubmit={async (event) => {
              event.preventDefault()
              await onSettingsSave()
            }}
          >
            <label>
              <span>TG Bot Token</span>
              <input
                type="password"
                value={tgSettingsForm.bot_token}
                onChange={(event) => onSettingsFieldChange('bot_token', event.target.value)}
                placeholder={tgDashboard?.settings.has_bot_token ? '已保存，留空表示保持当前值' : ''}
              />
            </label>
            <label>
              <span>管理员用户 ID</span>
              <input
                value={tgSettingsForm.admin_user_id}
                onChange={(event) => onSettingsFieldChange('admin_user_id', event.target.value)}
                placeholder="例如 123456789"
              />
            </label>
            <label>
              <span>Bot 代理类型</span>
              <select
                value={tgSettingsForm.bot_proxy_type}
                onChange={(event) => onSettingsFieldChange('bot_proxy_type', event.target.value)}
              >
                <option value="none">无代理</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </label>
            {showSocks5Fields ? (
              <label>
                <span>Bot 代理主机</span>
                <input
                  value={tgSettingsForm.bot_proxy_host}
                  onChange={(event) => onSettingsFieldChange('bot_proxy_host', event.target.value)}
                  placeholder="例如 127.0.0.1"
                />
              </label>
            ) : null}
            {showSocks5Fields ? (
              <label>
                <span>Bot 代理端口</span>
                <input
                  value={tgSettingsForm.bot_proxy_port}
                  onChange={(event) => onSettingsFieldChange('bot_proxy_port', event.target.value)}
                  placeholder="例如 1080"
                />
              </label>
            ) : null}
            {showSocks5Fields ? (
              <label>
                <span>Bot 代理用户名</span>
                <input
                  value={tgSettingsForm.bot_proxy_username}
                  onChange={(event) => onSettingsFieldChange('bot_proxy_username', event.target.value)}
                  placeholder="可选"
                />
              </label>
            ) : null}
            {showSocks5Fields ? (
              <label>
                <span>Bot 代理密码</span>
                <input
                  type="password"
                  value={tgSettingsForm.bot_proxy_password}
                  onChange={(event) => onSettingsFieldChange('bot_proxy_password', event.target.value)}
                  placeholder={tgDashboard?.settings.has_bot_proxy_password ? '已保存，留空表示保持当前值' : '可选'}
                />
              </label>
            ) : null}
            <div className="validation-box">
              <span>说明：这里的代理只用于 TG Bot 访问 Telegram Bot API；后端 TG 会话抓取代理在后台管理台单独配置。</span>
            </div>
            <div className="form-actions-inline">
              <button type="submit" className="primary-button" disabled={savingTgSettings}>
                {savingTgSettings ? '保存中...' : '保存 Bot 设置'}
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={testingTgConnection}
                onClick={() => void onTestConnection()}
              >
                {testingTgConnection ? '检测中...' : '测试 TG'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </Panel>
  )
}
