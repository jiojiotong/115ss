import { Panel } from './Panel'
import type { SessionUser } from '../types'

interface ProfilePanelProps {
  user: SessionUser
  username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  saving: boolean
  onFieldChange: (field: 'username' | 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => void
  onSubmit: () => Promise<void>
}

export function ProfilePanel({
  user,
  username,
  currentPassword,
  newPassword,
  confirmPassword,
  saving,
  onFieldChange,
  onSubmit,
}: ProfilePanelProps) {
  const mismatch = Boolean(confirmPassword) && newPassword !== confirmPassword

  return (
    <Panel
      eyebrow="Profile Center"
      title="个人中心"
      description="维护管理员账号与密码。修改成功后，任何待激活恢复密码都会一并失效。"
    >
      <div className="collection-bar">
        <article className="collection-stat">
          <span>当前身份</span>
          <strong>{user.username}</strong>
        </article>
        <article className="collection-stat">
          <span>修改范围</span>
          <strong>账号凭据</strong>
        </article>
        <article className="collection-stat">
          <span>恢复密码</span>
          <strong>自动失效</strong>
        </article>
      </div>

      <div className="section-shell">
        <div className="section-shell-heading">
          <p className="panel-eyebrow">Account Maintenance</p>
          <h3>修改登录密码</h3>
        </div>

        <form
          className="form-grid settings-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            if (mismatch) {
              return
            }
            await onSubmit()
          }}
        >
          <label>
            <span>管理员用户名</span>
            <input value={username} onChange={(event) => onFieldChange('username', event.target.value)} />
          </label>
          <label>
            <span>当前密码</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => onFieldChange('currentPassword', event.target.value)}
              placeholder="输入当前密码"
            />
          </label>
          <label>
            <span>新密码</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => onFieldChange('newPassword', event.target.value)}
              placeholder="新密码至少 8 位"
            />
          </label>
          <label>
            <span>确认新密码</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => onFieldChange('confirmPassword', event.target.value)}
              placeholder="再次输入新密码"
            />
          </label>
          <div className="validation-box">
            <strong>安全提示</strong>
            {mismatch ? (
              <span className="auth-inline-error">两次输入的新密码不一致</span>
            ) : (
              <span>修改密码后，旧密码与任何待激活恢复密码都会立即失效。</span>
            )}
          </div>
          <div className="form-actions-inline">
            <button
              type="submit"
              className="primary-button"
              disabled={saving || !currentPassword || !newPassword || mismatch}
            >
              {saving ? '保存中...' : '保存新密码'}
            </button>
          </div>
        </form>
      </div>
    </Panel>
  )
}
