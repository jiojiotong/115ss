import { Panel } from './Panel'
import type { SettingsFormValues, SettingsPayload, ValidateResult } from '../types'

interface SettingsPanelProps {
  settings: SettingsPayload | null
  settingsForm: SettingsFormValues
  apiBaseUrl: string
  validationResult: ValidateResult | null
  savingSettings: boolean
  validatingSettings: boolean
  formatTime: (value: string | null | undefined) => string
  onApiBaseUrlChange: (value: string) => void
  onSaveApiBaseUrl: () => void
  onSettingsFieldChange: (field: keyof SettingsFormValues, value: string) => void
  onSaveSettings: () => Promise<void>
  onValidateSettings: () => Promise<void>
  onClearCookieInput: () => void
  onClearStoredCookie: () => Promise<void>
  onClearStoredTargetFolder: () => Promise<void>
}

export function SettingsPanel({
  settings,
  settingsForm,
  apiBaseUrl,
  validationResult,
  savingSettings,
  validatingSettings,
  formatTime,
  onApiBaseUrlChange,
  onSaveApiBaseUrl,
  onSettingsFieldChange,
  onSaveSettings,
  onValidateSettings,
  onClearCookieInput,
  onClearStoredCookie,
  onClearStoredTargetFolder,
}: SettingsPanelProps) {
  return (
    <Panel
      eyebrow="System Settings"
      title="115设置"
      description="这里保存站点名称、115 Cookie 和固定转存地址。"
    >
      <div className="section-shell">
        <div className="section-shell-heading">
          <p className="panel-eyebrow">API Endpoint</p>
          <h3>前端 API 地址</h3>
        </div>
        <div className="form-grid settings-grid">
          <label>
            <span>API 地址</span>
            <input
              value={apiBaseUrl}
              onChange={(event) => onApiBaseUrlChange(event.target.value)}
              placeholder="留空则使用当前站点 /api"
            />
          </label>
          <div className="form-actions-inline">
            <button type="button" className="ghost-button" onClick={onSaveApiBaseUrl}>
              保存 API 地址
            </button>
          </div>
        </div>
      </div>

      <div className="section-shell">
        <div className="section-shell-heading">
          <p className="panel-eyebrow">115 Archive</p>
          <h3>115 连接与转存目录</h3>
        </div>
      <form
        className="form-grid settings-grid"
        onSubmit={async (event) => {
          event.preventDefault()
          await onSaveSettings()
        }}
      >
        <label>
          <span>站点名称</span>
          <input value={settingsForm.site_name} onChange={(event) => onSettingsFieldChange('site_name', event.target.value)} />
        </label>
        <label>
          <span>115 转存地址</span>
          <input
            value={settingsForm.target_folder_url}
            onChange={(event) => onSettingsFieldChange('target_folder_url', event.target.value)}
            placeholder="粘贴 115 文件夹页面地址，系统会自动解析目录 ID"
          />
        </label>
        <label>
          <span>目标目录名称</span>
          <input
            value={settingsForm.target_folder_name}
            onChange={(event) => onSettingsFieldChange('target_folder_name', event.target.value)}
            placeholder="仅用于后台展示"
          />
        </label>
        <label>
          <span>新的 115 Cookie</span>
          <textarea
            value={settingsForm.one_fifteen_cookie}
            onChange={(event) => onSettingsFieldChange('one_fifteen_cookie', event.target.value)}
            rows={6}
            placeholder={
              settings?.masked_one_fifteen_cookie
                ? `当前已保存：${settings.masked_one_fifteen_cookie}`
                : '粘贴完整 Cookie；留空时不会覆盖当前已保存值'
            }
          />
        </label>
        <div className="settings-meta">
          <p>上次更新时间：{formatTime(settings?.updated_at)}</p>
          <p>
            当前 Cookie 状态：
            {settings?.has_one_fifteen_cookie ? '已保存' : '未保存'}
          </p>
          <p>当前解析目录 ID：{settings?.target_folder_id || '--'}</p>
          <p>当前管理员：{settings?.admin_username || '--'}</p>
        </div>
        <div className="form-actions-inline">
          <button type="submit" className="primary-button" disabled={savingSettings}>
            {savingSettings ? '保存中...' : '保存设置'}
          </button>
          <button type="button" className="ghost-button" disabled={validatingSettings} onClick={() => void onValidateSettings()}>
            {validatingSettings ? '校验中...' : '校验 115 配置'}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={savingSettings || validatingSettings}
            onClick={onClearCookieInput}
          >
            清空输入区
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={savingSettings || !settings?.has_one_fifteen_cookie}
            onClick={() => void onClearStoredCookie()}
          >
            移除已保存 Cookie
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={savingSettings || !settings?.target_folder_id}
            onClick={() => void onClearStoredTargetFolder()}
          >
            移除已保存转存地址
          </button>
        </div>
      </form>
      </div>

      {validationResult ? (
        <div className="validation-box">
          <strong>校验通过</strong>
          <span>{validationResult.message}</span>
          <span>当前 115 用户 ID：{validationResult.userId}</span>
          <span>当前目录 ID：{validationResult.targetFolderId}</span>
        </div>
      ) : null}

    </Panel>
  )
}
