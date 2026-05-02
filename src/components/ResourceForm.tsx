import type { ResourceItem } from '../types'

export interface ResourceFormValues {
  title: string
  media_type: 'movie' | 'series'
  resource_size: string
  quality_label: string
  resource_url: string
  access_code: string
  note: string
  release_year: string
}

interface ResourceFormProps {
  value: ResourceFormValues
  editingResource: ResourceItem | null
  busy: boolean
  onChange: (field: keyof ResourceFormValues, nextValue: string) => void
  onSubmit: () => Promise<void>
  onReset: () => void
}

export function ResourceForm({
  value,
  editingResource,
  busy,
  onChange,
  onSubmit,
  onReset,
}: ResourceFormProps) {
  return (
    <div className="resource-form-shell">
      <div className="form-heading">
        <p className="panel-eyebrow">资源表单</p>
        <h3>{editingResource ? '编辑资源' : '新增资源'}</h3>
        <p>
          保持一条资源对应一条记录。标题用于展示，标准化标题会在后端自动生成并用于搜索。
        </p>
      </div>

      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault()
          await onSubmit()
        }}
      >
        <label>
          <span>资源名称</span>
          <input
            value={value.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="例如：沙丘 2"
          />
        </label>
        <label>
          <span>资源分类</span>
          <select value={value.media_type} onChange={(event) => onChange('media_type', event.target.value)}>
            <option value="movie">电影</option>
            <option value="series">电视剧</option>
          </select>
        </label>
        <label>
          <span>115 分享链接</span>
          <input
            value={value.resource_url}
            onChange={(event) => onChange('resource_url', event.target.value)}
            placeholder="https://115.com/s/..."
          />
        </label>
        <label>
          <span>上映时间</span>
          <input
            value={value.release_year}
            onChange={(event) => onChange('release_year', event.target.value)}
            placeholder="例如：2024"
          />
        </label>
        <label>
          <span>大小</span>
          <input
            value={value.resource_size}
            onChange={(event) => onChange('resource_size', event.target.value)}
            placeholder="例如：15.37GB"
          />
        </label>
        <label>
          <span>清晰度</span>
          <input
            value={value.quality_label}
            onChange={(event) => onChange('quality_label', event.target.value)}
            placeholder="例如：BluRay 1080P HDR10"
          />
        </label>
        <label>
          <span>备注</span>
          <textarea
            value={value.note}
            onChange={(event) => onChange('note', event.target.value)}
            rows={4}
            placeholder="可记录版本、清晰度、字幕等信息"
          />
        </label>
        <div className="form-actions-inline">
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? '提交中...' : editingResource ? '保存修改' : '新增资源'}
          </button>
          <button type="button" className="ghost-button" onClick={onReset} disabled={busy}>
            {editingResource ? '取消编辑' : '清空表单'}
          </button>
        </div>
      </form>
    </div>
  )
}
