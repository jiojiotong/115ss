import { useState } from 'react'
import { Panel } from './Panel'
import type { PaginatedResult, ResourceItem, SeriesGroupItem } from '../types'

interface SeriesGroupListPanelProps {
  groups: PaginatedResult<SeriesGroupItem>
  searchInput: string
  runningTransferId: number | null
  onMediaTypeChange: (nextValue: 'movie' | 'series') => void
  onSearchChange: (value: string) => void
  onPageChange: (nextPage: number) => void
  onEdit: (resource: ResourceItem) => void
  onViewNote: (resource: ResourceItem) => void
  onDelete: (resource: ResourceItem) => Promise<void>
  onTransfer: (resource: ResourceItem) => Promise<void>
}

export function SeriesGroupListPanel({
  groups,
  searchInput,
  runningTransferId,
  onMediaTypeChange,
  onSearchChange,
  onPageChange,
  onEdit,
  onViewNote,
  onDelete,
  onTransfer,
}: SeriesGroupListPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  return (
    <Panel
      className="resource-list-panel"
      eyebrow="Series Library"
      title="电视剧合集"
      actions={
        <>
          <div className="resource-type-tabs" role="tablist" aria-label="资源分类标签">
            <button type="button" role="tab" aria-selected={false} className="tab-button" onClick={() => onMediaTypeChange('movie')}>
              电影
            </button>
            <button type="button" role="tab" aria-selected className="tab-button active" onClick={() => onMediaTypeChange('series')}>
              电视剧
            </button>
          </div>
          <label className="search-box">
            <span>搜索</span>
            <input value={searchInput} onChange={(event) => onSearchChange(event.target.value)} placeholder="输入剧名或集数进行检索" />
          </label>
        </>
      }
    >
      <div className="series-group-stack">
        {groups.items.length ? (
          groups.items.map((group) => {
            const expanded = Boolean(expandedGroups[group.group_title])
            return (
              <section key={group.group_title} className="series-group-card">
                <button
                  type="button"
                  className="series-group-summary"
                  onClick={() => setExpandedGroups((current) => ({ ...current, [group.group_title]: !expanded }))}
                >
                  <div>
                    <strong>{group.group_title}</strong>
                    <span>
                      {group.release_year || '--'} / 
                      {group.tmdb_total_episodes
                        ? `已抓 ${group.episode_count} / 总 ${group.tmdb_total_episodes} 集`
                        : group.tmdb_match_status === 'not_found' || group.tmdb_match_status === 'ambiguous'
                          ? `已抓 ${group.episode_count} 集 / TMDB未匹配`
                          : `${group.episode_count} 集`}
                      {' / '}最新 {group.latest_episode_label || '--'}
                    </span>
                  </div>
                  <span>{expanded ? '收起' : '展开'}</span>
                </button>

                {expanded ? (
                  <div className="table-wrap resource-table-wrap series-children-wrap">
                    <table className="resource-table">
                      <colgroup>
                        <col className="resource-col-title" />
                        <col className="resource-col-episode" />
                        <col className="resource-col-link" />
                        <col className="resource-col-year" />
                        <col className="resource-col-size" />
                        <col className="resource-col-quality" />
                        <col className="resource-col-note" />
                        <col className="resource-col-actions" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>子集</th>
                          <th>集数</th>
                          <th>链接</th>
                          <th>上映时间</th>
                          <th>大小</th>
                          <th>清晰度</th>
                          <th>备注</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.children.map((resource) => (
                          <tr key={resource.id}>
                            <td className="resource-title-cell">
                              <div className="resource-title-line">
                                <strong>{resource.title}</strong>
                                {resource.series_episode_label ? <span className="resource-episode-badge">{resource.series_episode_label}</span> : null}
                              </div>
                            </td>
                            <td>{resource.series_episode_label || '--'}</td>
                            <td className="resource-link-cell">
                              <a className="resource-inline-link" href={resource.resource_url} target="_blank" rel="noreferrer" title={resource.resource_url}>
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
                                <button type="button" className="primary-button" disabled={runningTransferId === resource.id} onClick={() => void onTransfer(resource)}>
                                  {runningTransferId === resource.id ? '转存中...' : '立即转存'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            )
          })
        ) : (
          <div className="table-wrap resource-table-wrap">
            <table className="resource-table">
              <tbody>
                <tr>
                  <td className="empty-row">暂无匹配电视剧</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pagination-row">
        <span>
          第 {groups.page} 页 / 共 {Math.max(1, Math.ceil(groups.total / groups.pageSize))} 页
        </span>
        <div className="table-actions">
          <button type="button" className="ghost-button" disabled={groups.page <= 1} onClick={() => onPageChange(Math.max(1, groups.page - 1))}>
            上一页
          </button>
          <button type="button" className="ghost-button" disabled={groups.page >= Math.ceil(groups.total / groups.pageSize)} onClick={() => onPageChange(groups.page + 1)}>
            下一页
          </button>
        </div>
      </div>
    </Panel>
  )
}
