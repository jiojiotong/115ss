import { useState } from 'react'
import { ArchiveLogo } from './ArchiveLogo'

interface LoginViewProps {
  loadingAction: 'login' | 'change' | 'forgot' | null
  onLogin: (username: string, password: string) => Promise<void>
  onForgotPassword: () => Promise<void>
  kicker?: string
  title?: string
  subtitle?: string
  usernamePlaceholder?: string
  passwordPlaceholder?: string
  forgotPasswordTip?: string
  footnote?: string
}

export function LoginView({
  loadingAction,
  onLogin,
  onForgotPassword,
  kicker = 'Archive Access',
  title = '115 资源搜索系统',
  subtitle = '115 RESOURCE SEARCH SYSTEM',
  usernamePlaceholder = '输入管理员用户名',
  passwordPlaceholder = '输入管理员密码',
  forgotPasswordTip = '点击“忘记密码”会直接生成一条随机恢复密码，并仅写入后台日志。',
  footnote = '首次初始化管理员只会在数据库内写入一次；修改密码请在登录后的个人中心\n中完成。',
}: LoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [footnoteFirstLine = '', footnoteSecondLine = ''] = footnote.split('\n')

  return (
    <main className="login-shell">
      <div className="login-shell-noise" aria-hidden="true" />

      <section className="login-story login-display-shell" aria-label="档案核心展示">
        <ArchiveLogo showCaption />
      </section>

      <section className="login-panel">
        <div className="login-intro">
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="login-intro-english">{subtitle}</p>
        </div>

        <div className="login-card auth-card">
          <form
            className="form-grid auth-form"
            onSubmit={async (event) => {
              event.preventDefault()
              await onLogin(username, password)
            }}
          >
            <label className="auth-field auth-field-highlight">
              <span>用户名</span>
              <div className="auth-input-shell">
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder={usernamePlaceholder}
                />
              </div>
            </label>
            <label className="auth-field">
              <span>密码</span>
              <div className="auth-input-shell password-input-shell">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder={passwordPlaceholder}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <span className="auth-password-eye" aria-hidden="true">
                    <span className="auth-password-eye-pupil" />
                  </span>
                </button>
              </div>
            </label>
            <div className="login-action-row">
              <button type="submit" className="primary-button" disabled={loadingAction !== null}>
                {loadingAction === 'login' ? '登录中...' : '登录'}
              </button>
              <button
                type="button"
                className="auth-link-button"
                disabled={loadingAction !== null}
                onClick={() => void onForgotPassword()}
              >
                {loadingAction === 'forgot' ? '生成中...' : '忘记密码'}
              </button>
            </div>
            <p className="auth-action-tip">{forgotPasswordTip}</p>
          </form>
        </div>

        <p className="login-footnote">
          {footnoteFirstLine}
          {footnoteSecondLine ? <><br />{footnoteSecondLine}</> : null}
        </p>
      </section>
    </main>
  )
}
