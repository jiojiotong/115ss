import { Panel } from './Panel'
import type { PaginatedResult, TransferLog } from '../types'

interface TransferLogsPanelProps {
  transfers: PaginatedResult<TransferLog>
  formatTime: (value: string | null | undefined) => string
  statusLabel: (status: TransferLog['status']) => string
  onPageChange: (nextPage: number) => void
}

export function TransferLogsPanel({
  transfers,
  formatTime,
  statusLabel,
  onPageChange,
}: TransferLogsPanelProps) {
  const successCount = transfers.items.filter((item) => item.status === 'success').length
  const duplicateCount = transfers.items.filter((item) => item.status === 'duplicate').length
  const errorCount = transfers.items.filter((item) => item.status === 'error').length

  return (
    <Panel
      eyebrow="Transfer Logs"
      title="转存记录"
      description="每次转存尝试都会记录结果，方便确认重复接收和失败原因。"
    >
      <div className="collection-bar log-summary-bar">
        <article className="collection-stat">
          <span>本页成功</span>
          <strong>{successCount}</strong>
        </article>
        <article className="collection-stat">
          <span>本页重复</span>
          <strong>{duplicateCount}</strong>
        </article>
        <article className="collection-stat">
          <span>本页失败</span>
          <strong>{errorCount}</strong>
        </article>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>资源</th>
              <th>状态</th>
              <th>说明</th>
              <th>目标目录</th>
            </tr>
          </thead>
          <tbody>
            {transfers.items.length > 0 ? (
              transfers.items.map((log) => (
                <tr key={log.id}>
                  <td>{formatTime(log.created_at)}</td>
                  <td>{log.resource_title || log.title_snapshot}</td>
                  <td>
                    <span className={`status-chip ${log.status}`}>{statusLabel(log.status)}</span>
                  </td>
                  <td>{log.message}</td>
                  <td>{log.target_folder_id || '--'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-row">
                  还没有转存记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <span>
          第 {transfers.page} 页 / 共 {Math.max(1, Math.ceil(transfers.total / transfers.pageSize))} 页
        </span>
        <div className="table-actions">
          <button
            type="button"
            className="ghost-button"
            disabled={transfers.page <= 1}
            onClick={() => onPageChange(Math.max(1, transfers.page - 1))}
          >
            上一页
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={transfers.page >= Math.ceil(transfers.total / transfers.pageSize)}
            onClick={() => onPageChange(transfers.page + 1)}
          >
            下一页
          </button>
        </div>
      </div>
    </Panel>
  )
}
