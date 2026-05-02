import { Panel } from './Panel'
import type { TgDashboardPayload, TgScanResult, TgTargetItem } from '../types'

function formatSessionStatus(status: string | null | undefined) {
  switch (status) {
    case 'logged_out':
      return '未登录'
    case 'awaiting_code':
      return '等待验证码'
    case 'needs_password':
      return '需要二次密码'
    case 'authorized':
      return '已授权'
    default:
      return status || '--'
  }
}

function formatRuntimeStatus(status: string | null | undefined) {
  switch (status) {
    case 'idle':
      return '空闲'
    case 'starting':
      return '启动中'
    case 'fetching':
      return '抓取中'
    case 'monitoring':
      return '监控中'
    case 'monitoring_with_errors':
      return '监控中（有错误）'
    case 'scheduled':
      return '定时待命'
    case 'scheduled_with_errors':
      return '定时待命（有错误）'
    case 'scheduled_scanning':
      return '定时扫描中'
    default:
      return status || '--'
  }
}

interface TgTargetFormValue {
  chat_ref: string
  enabled_for_scan: boolean
  enabled_for_monitor: boolean
}

interface TgScanFormValue {
  target_id: string
  start_message_id: string
}

interface TgScanPanelProps {
  tgDashboard: TgDashboardPayload | null
  tgTargetForm: TgTargetFormValue
  tgScanForm: TgScanFormValue
  tgScanResult: TgScanResult | null
  scheduledScanEnabled: boolean
  scheduledScanTimes: string
  creatingTgTarget: boolean
  scanningTgTarget: boolean
  savingScheduledSettings: boolean
  updatingTgTargetId: number | null
  deletingTgTargetId: number | null
  clearingTgRuns: boolean
  formatTime: (value: string | null | undefined) => string
  onTargetFieldChange: (field: keyof TgTargetFormValue, value: string | boolean) => void
  onScanFieldChange: (field: keyof TgScanFormValue, value: string) => void
  onScheduledFieldChange: (field: 'scheduledScanEnabled' | 'scheduledScanTimes', value: string | boolean) => void
  onCreateTarget: () => Promise<void>
  onUpdateTarget: (
    target: TgTargetItem,
    field: 'enabled_for_scan' | 'enabled_for_monitor',
    value: boolean,
  ) => Promise<void>
  onDeleteTarget: (target: TgTargetItem) => Promise<void>
  onSelectScanTarget: (targetId: string) => void
  onSaveScheduledSettings: () => Promise<void>
  onScan: (scope: 'single_target' | 'all_targets', mode: 'incremental_500' | 'partial_5000' | 'full_history') => Promise<void>
  onConfigureNamingRule: (target: TgTargetItem) => void
  onClearAllRuns: () => Promise<void>
}

export function TgScanPanel({
  tgDashboard,
  tgTargetForm,
  tgScanForm,
  tgScanResult,
  scheduledScanEnabled,
  scheduledScanTimes,
  creatingTgTarget,
  scanningTgTarget,
  savingScheduledSettings,
  updatingTgTargetId,
  deletingTgTargetId,
  clearingTgRuns,
  formatTime,
  onTargetFieldChange,
  onScanFieldChange,
  onScheduledFieldChange,
  onCreateTarget,
  onUpdateTarget,
  onDeleteTarget,
  onSelectScanTarget,
  onSaveScheduledSettings,
  onScan,
  onConfigureNamingRule,
  onClearAllRuns,
}: TgScanPanelProps) {
  return (
    <Panel
      eyebrow="TG Scan"
      title="扫描模式"
      description="集中管理 TG 抓取目标、扫描模式和抓取记录，方便快速执行资源抓取。"
    >
      <div className="result-stack">
        <div className="runtime-grid">
          <article className="runtime-card">
            <span>会话状态</span>
            <strong>{formatSessionStatus(tgDashboard?.settings.session_status)}</strong>
          </article>
          <article className="runtime-card">
            <span>抓取状态</span>
            <strong>{formatRuntimeStatus(tgDashboard?.runtime.runtime_status)}</strong>
          </article>
          <article className="runtime-card">
            <span>目标数</span>
            <strong>{tgDashboard?.targets.length || 0}</strong>
          </article>
          <article className="runtime-card">
            <span>定时抓取</span>
            <strong>{tgDashboard?.settings.scheduled_scan_enabled ? '已启用' : '未启用'}</strong>
          </article>
        </div>

        {tgDashboard?.runtime.last_runtime_error || tgDashboard?.settings.last_error ? (
          <div className="validation-box">
            <strong>运行提示</strong>
            {tgDashboard?.runtime.last_runtime_error ? (
              <span>最近运行错误：{tgDashboard.runtime.last_runtime_error}</span>
            ) : null}
            {tgDashboard?.settings.last_error ? <span>最近配置错误：{tgDashboard.settings.last_error}</span> : null}
          </div>
        ) : null}

        <div className="section-shell">
          <div className="section-shell-heading">
            <p className="panel-eyebrow">Scheduled Scan</p>
            <h3>定时扫描</h3>
            <p className="panel-description">在扫描页统一管理定时开关、执行时刻与当前定时状态。</p>
          </div>
          <form
            className="form-grid settings-grid"
            onSubmit={async (event) => {
              event.preventDefault()
              await onSaveScheduledSettings()
            }}
          >
            <label className="checkbox-line">
              <span>启用定时扫描</span>
              <input
                type="checkbox"
                checked={scheduledScanEnabled}
                onChange={(event) => onScheduledFieldChange('scheduledScanEnabled', event.target.checked)}
              />
            </label>
            <label>
              <span>定时扫描时刻</span>
              <input
                value={scheduledScanTimes}
                onChange={(event) => onScheduledFieldChange('scheduledScanTimes', event.target.value)}
                placeholder="例如 09:00,21:00"
              />
            </label>
            <div className="validation-box">
              <span>当前定时状态：{tgDashboard?.runtime.scheduled_scan_running ? '运行中' : scheduledScanEnabled ? '待命中' : '未启用'}</span>
            </div>
            <div className="form-actions-inline">
              <button type="submit" className="primary-button" disabled={savingScheduledSettings}>
                {savingScheduledSettings ? '保存中...' : '保存定时设置'}
              </button>
            </div>
          </form>
        </div>

        <div className="section-shell quick-scan-shell">
          <div className="section-shell-heading quick-scan-heading">
            <p className="panel-eyebrow">Quick Scan</p>
            <h3>快捷抓取</h3>
            <p className="panel-description">日常最常用的是“全部目标增量扫描（500）”。这里单独提出来，方便你直接开抓。</p>
          </div>
          <div className="quick-scan-grid">
            <button
              type="button"
              className="quick-scan-primary"
              disabled={scanningTgTarget}
              onClick={() => void onScan('all_targets', 'incremental_500')}
            >
              <span className="quick-scan-label">常用入口</span>
              <strong>{scanningTgTarget ? '抓取中...' : '立即抓取全部目标（50）'}</strong>
              <span>适合日常补抓，速度快，默认覆盖所有启用手动抓取的 TG 目标。</span>
            </button>

            <div className="quick-scan-secondary">
              <button
                type="button"
                className="ghost-button"
                disabled={scanningTgTarget}
                onClick={() => void onScan('all_targets', 'partial_5000')}
              >
                全部局部扫描（5000）
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={scanningTgTarget}
                onClick={() => void onScan('all_targets', 'full_history')}
              >
                全部全量扫描
              </button>
              <div className="validation-box compact-hint">
                <span>当前可抓目标数：{tgDashboard?.targets.filter((target) => target.enabled_for_scan).length || 0}</span>
                <span>更细的单目标和起始消息控制，继续用下面的“扫描模式”。</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-settings-block section-shell">
          <div className="block-heading">
            <p className="panel-eyebrow">Targets</p>
            <h3>目标管理</h3>
            <p className="panel-description">公开频道优先走 `/s/` 网页抓取；公开群或抓不到历史消息的目标，会在已登录用户会话时自动回退到会话监控。</p>
          </div>

          <form
            className="form-grid settings-grid"
            onSubmit={async (event) => {
              event.preventDefault()
              await onCreateTarget()
            }}
          >
            <label>
              <span>公开链接或用户名</span>
              <input
                value={tgTargetForm.chat_ref}
                onChange={(event) => onTargetFieldChange('chat_ref', event.target.value)}
                placeholder="例如 @moviehub、https://t.me/moviehub 或 https://t.me/s/moviehub"
              />
            </label>
            <label className="checkbox-line">
              <span>允许手动抓取</span>
              <input
                type="checkbox"
                checked={tgTargetForm.enabled_for_scan}
                onChange={(event) => onTargetFieldChange('enabled_for_scan', event.target.checked)}
              />
            </label>
            <label className="checkbox-line">
              <span>启用自动抓取</span>
              <input
                type="checkbox"
                checked={tgTargetForm.enabled_for_monitor}
                onChange={(event) => onTargetFieldChange('enabled_for_monitor', event.target.checked)}
              />
            </label>
            <div className="form-actions-inline">
              <button type="submit" className="primary-button" disabled={creatingTgTarget}>
                {creatingTgTarget ? '添加中...' : '添加目标'}
              </button>
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>目标</th>
                  <th>模式</th>
                  <th>手动</th>
                  <th>自动</th>
                  <th>命名规则</th>
                  <th>上次手动</th>
                  <th>上次自动</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tgDashboard?.targets.length ? (
                  tgDashboard.targets.map((target) => (
                    <tr key={target.id}>
                      <td>
                        <strong>{target.chat_title}</strong>
                        <span>{target.chat_ref}</span>
                      </td>
                      <td>{target.chat_type === 'session_chat' ? '会话监控' : '公开抓取'}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={target.enabled_for_scan}
                          disabled={updatingTgTargetId === target.id}
                          onChange={(event) =>
                            void onUpdateTarget(target, 'enabled_for_scan', event.target.checked)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={target.enabled_for_monitor}
                          disabled={updatingTgTargetId === target.id}
                          onChange={(event) =>
                            void onUpdateTarget(target, 'enabled_for_monitor', event.target.checked)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ghost-button compact"
                          onClick={() => onConfigureNamingRule(target)}
                        >
                          {target.naming_rule ? '已配置' : '设置规则'}
                        </button>
                      </td>
                      <td>{target.last_scanned_message_id || '--'}</td>
                      <td>{target.last_seen_message_id || '--'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => onSelectScanTarget(String(target.id))}
                          >
                            设为抓取目标
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            disabled={deletingTgTargetId === target.id}
                            onClick={() => void onDeleteTarget(target)}
                          >
                            {deletingTgTargetId === target.id ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      还没有 TG 目标
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-settings-block section-shell">
          <div className="block-heading">
            <p className="panel-eyebrow">Manual Fetch</p>
            <h3>扫描模式</h3>
            <p className="panel-description">支持单目标和全部目标两种范围；公开频道和会话群统一按同一套命名规则抓取。</p>
          </div>

          <form className="form-grid settings-grid">
            <label>
              <span>目标链接</span>
              <select value={tgScanForm.target_id} onChange={(event) => onScanFieldChange('target_id', event.target.value)}>
                <option value="">请选择</option>
                {tgDashboard?.targets
                  .filter((target) => target.enabled_for_scan)
                  .map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.chat_title}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>起始消息 Key（可选）</span>
              <input
                value={tgScanForm.start_message_id}
                onChange={(event) => onScanFieldChange('start_message_id', event.target.value)}
              />
            </label>
            <div className="scan-mode-group">
              <strong>单目标扫描</strong>
              <div className="form-actions-inline">
                <button type="button" className="primary-button" disabled={scanningTgTarget} onClick={() => void onScan('single_target', 'incremental_500')}>
                  {scanningTgTarget ? '抓取中...' : '增量扫描（500）'}
                </button>
                <button type="button" className="ghost-button" disabled={scanningTgTarget} onClick={() => void onScan('single_target', 'partial_5000')}>
                  局部扫描（5000）
                </button>
                <button type="button" className="ghost-button" disabled={scanningTgTarget} onClick={() => void onScan('single_target', 'full_history')}>
                  全量扫描
                </button>
              </div>
            </div>
            <div className="scan-mode-group">
              <strong>全部目标扫描</strong>
              <div className="form-actions-inline">
                <button type="button" className="primary-button" disabled={scanningTgTarget} onClick={() => void onScan('all_targets', 'incremental_500')}>
                  {scanningTgTarget ? '抓取中...' : '全部增量扫描（500）'}
                </button>
                <button type="button" className="ghost-button" disabled={scanningTgTarget} onClick={() => void onScan('all_targets', 'partial_5000')}>
                  全部局部扫描（5000）
                </button>
                <button type="button" className="ghost-button" disabled={scanningTgTarget} onClick={() => void onScan('all_targets', 'full_history')}>
                  全部全量扫描
                </button>
              </div>
            </div>
          </form>

          {tgScanResult ? (
            <div className="validation-box">
              <strong>最近一次抓取结果</strong>
              <span>范围：{tgScanResult.scope === 'all_targets' ? '全部目标' : '单目标'}</span>
              <span>
                模式：
                {tgScanResult.scan_mode === 'incremental_500'
                  ? '增量扫描（500）'
                  : tgScanResult.scan_mode === 'partial_5000'
                    ? '局部扫描（5000）'
                    : '全量扫描'}
              </span>
              {tgScanResult.scan_mode === 'full_history' && tgScanResult.completion_reason ? (
                <span>
                  结束原因：
                  {tgScanResult.completion_reason === 'exhausted'
                    ? '已扫尽历史'
                    : tgScanResult.completion_reason === 'guard_limit'
                      ? '命中护栏停止'
                      : '达到固定上限'}
                </span>
              ) : null}
              <span>目标：{tgScanResult.target_chat_title}</span>
              {tgScanResult.target_count ? <span>目标数：{tgScanResult.target_count}</span> : null}
              <span>抓取消息数：{tgScanResult.message_count}</span>
              <span>提取链接数：{tgScanResult.link_count}</span>
              <span>新增资源数：{tgScanResult.inserted_count}</span>
              <span>重复跳过数：{tgScanResult.duplicate_count}</span>
              <span>失败数：{tgScanResult.failed_count}</span>
              {tgScanResult.error_message ? <span>错误：{tgScanResult.error_message}</span> : null}
            </div>
          ) : null}
        </div>

        <div className="admin-settings-block section-shell">
          <div className="block-heading">
            <p className="panel-eyebrow">Recent Runs</p>
            <h3>抓取记录</h3>
            <p className="panel-description">展示最近的手动抓取与自动抓取结果，便于追踪去重和失败情况。</p>
          </div>
          {tgDashboard?.runs.length ? (
            <div className="block-actions">
              <button
                type="button"
                className="danger-button"
                disabled={clearingTgRuns}
                onClick={onClearAllRuns}
              >
                {clearingTgRuns ? '清除中...' : '清除所有记录'}
              </button>
            </div>
          ) : null}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>时间</th>
                  <th>类型</th>
                  <th>目标</th>
                  <th>消息数</th>
                  <th>新增</th>
                  <th>重复</th>
                  <th>失败</th>
                  <th>错误</th>
                </tr>
              </thead>
              <tbody>
                {tgDashboard?.runs.length ? (
                  tgDashboard.runs.map((run) => (
                    <tr key={run.id}>
                      <td>{formatTime(run.finished_at || run.created_at)}</td>
                      <td>{run.run_type === 'manual_scan' ? '手动抓取' : '自动抓取'}</td>
                      <td>{run.target_chat_title}</td>
                      <td>{run.message_count}</td>
                      <td>{run.inserted_count}</td>
                      <td>{run.duplicate_count}</td>
                      <td>{run.failed_count}</td>
                      <td>{run.error_message || '--'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      还没有 TG 抓取记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Panel>
  )
}
