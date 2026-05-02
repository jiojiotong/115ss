import { Panel } from './Panel'
import type { PaginatedResult, ResourceItem } from '../types'

interface ResourceListPanelProps {
  resources: PaginatedResult<ResourceItem>
  activeMediaType: 'movie' | 'series'
  searchInput: string
  runningTransferId: number | null
  onExportAll?: () => void
  onClearAll?: () => void
  onMediaTypeChange: (nextValue: 'movie' | 'series') => void
  onSearchChange: (value: string) => void
  onPageChange: (nextPage: number) => void
  onEdit: (resource: ResourceItem) => void
  onViewNote: (resource: ResourceItem) => void
  onDelete: (resource: ResourceItem) => Promise<void>
  onTransfer: (resource: ResourceItem) => Promise<void>
}

export function ResourceListPanel({
  resources,
  activeMediaType,
  searchInput,
  runningTransferId,
  onExportAll,
  onClearAll,
  onMediaTypeChange,
  onSearchChange,
  onPageChange,
  onEdit,
  onViewNote,
  onDelete,
  onTransfer,
}: ResourceListPanelProps) {
  return (
    <Panel
      className="resource-list-panel"
      eyebrow="Resource Library"
      title="资源列表"
      actions={
        <>
          <div className="resource-type-tabs" role="tablist" aria-label="资源分类标签">
            <button
              type="button"
              role="tab"
              aria-selected={activeMediaType === 'movie'}
              className={activeMediaType === 'movie' ? 'tab-button active' : 'tab-button'}
              onClick={() => onMediaTypeChange('movie')}
            >
              电影
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMediaType === 'series'}
              className={activeMediaType === 'series' ? 'tab-button active' : 'tab-button'}
              onClick={() => onMediaTypeChange('series')}
            >
              电视剧
            </button>
          </div>
          <label className="search-box">
            <span>搜索</span>
            <input
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="输入资源名进行检索"
            />
          </label>
        </>
      }
    >
      <div className="table-wrap resource-table-wrap">
        <table className="resource-table">
          <colgroup>
            <col className="resource-col-title" />
            <col className="resource-col-link" />
            <col className="resource-col-year" />
            <col className="resource-col-size" />
            <col className="resource-col-quality" />
            <col className="resource-col-note" />
            <col className="resource-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>资源名称</th>
              <th>链接</th>
              <th>上映时间</th>
              <th>大小</th>
              <th>清晰度</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {resources.items.length > 0 ? (
              resources.items.map((resource) => (
                <tr key={resource.id}>
                  <td className="resource-title-cell">
                    <div className="resource-title-line">
                      <strong>{resource.title}</strong>
                    </div>
                  </td>
                  <td className="resource-link-cell">
                    <a
                      className="resource-inline-link"
                      href={resource.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      title={resource.resource_url}
                    >
                      115链接
                    </a>
                  </td>
                  <td>{resource.release_year || '--'}</td>
                  <td>{resource.resource_size || '--'}</td>
                  <td className="resource-quality-cell">
                    <span className="resource-quality-text" title={resource.quality_label || undefined}>
                      {resource.quality_label || '--'}
                    </span>
                  </td>
                  <td>
                    {resource.note ? (
                      <button type="button" className="ghost-button detail-trigger" onClick={() => onViewNote(resource)}>
                        详情
                      </button>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="ghost-button" onClick={() => onEdit(resource)}>
                        编辑
                      </button>
                      <button type="button" className="ghost-button" onClick={() => void onDelete(resource)}>
                        删除
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={runningTransferId === resource.id}
                        onClick={() => void onTransfer(resource)}
                      >
                        {runningTransferId === resource.id ? '转存中...' : '立即转存'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-row">
                  暂无匹配资源
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <span>
          第 {resources.page} 页 / 共 {Math.max(1, Math.ceil(resources.total / resources.pageSize))} 页
        </span>
        <div className="table-actions">
          <button
            type="button"
            className="ghost-button"
            disabled={resources.page <= 1}
            onClick={() => onPageChange(Math.max(1, resources.page - 1))}
          >
            上一页
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={resources.page >= Math.ceil(resources.total / resources.pageSize)}
            onClick={() => onPageChange(resources.page + 1)}
          >
            下一页
          </button>
          {onExportAll ? (
            <button type="button" className="ghost-button" onClick={onExportAll}>
              全部导出
            </button>
          ) : null}
          {onClearAll ? (
            <button type="button" className="ghost-button danger-button" onClick={onClearAll}>
              全部清除
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  )
}
