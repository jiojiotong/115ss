import { Panel } from './Panel'
import type { LinkImportResult } from '../types'

interface LinkImportPanelProps {
  linkImportFile: File | null
  linkImportText: string
  linkImportResult: LinkImportResult | null
  uploadingLinkFile: boolean
  uploadingLinkText: boolean
  onFileChange: (file: File | null) => void
  onTextChange: (value: string) => void
  onFileImport: () => Promise<void>
  onTextImport: () => Promise<void>
}

export function LinkImportPanel({
  linkImportFile,
  linkImportText,
  linkImportResult,
  uploadingLinkFile,
  uploadingLinkText,
  onFileChange,
  onTextChange,
  onFileImport,
  onTextImport,
}: LinkImportPanelProps) {
  return (
    <Panel
      eyebrow="115 Link Import"
      title="链接导入"
      description="支持上传 txt、md、csv 文件，或直接粘贴文本。系统会自动提取 115 链接、提取码和标题，并按链接去重后写入资源库。"
    >
      <div className="import-intro-strip">
        <span>自由文本识别</span>
        <span>自动提取提取码</span>
        <span>统一链接去重</span>
      </div>

      <div className="import-layout">
        <div className="import-box">
          <h3>文件上传导入</h3>
          <label className="file-picker">
            <span>选择 txt / md / csv 文件</span>
            <input
              type="file"
              accept=".txt,.md,.csv"
              onChange={(event) => onFileChange(event.target.files?.[0] || null)}
            />
          </label>
          <p className="muted">{linkImportFile ? `已选择：${linkImportFile.name}` : '尚未选择文件'}</p>
          <button
            type="button"
            className="primary-button"
            disabled={uploadingLinkFile || !linkImportFile}
            onClick={() => void onFileImport()}
          >
            {uploadingLinkFile ? '导入中...' : '从文件导入'}
          </button>
        </div>

        <div className="import-box">
          <h3>文本粘贴导入</h3>
          <label>
            <span>粘贴原始分享文本</span>
            <textarea
              rows={10}
              value={linkImportText}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="可直接粘贴群消息、整理文档或多条 115 分享内容"
            />
          </label>
          <button
            type="button"
            className="primary-button"
            disabled={uploadingLinkText || !linkImportText.trim()}
            onClick={() => void onTextImport()}
          >
            {uploadingLinkText ? '导入中...' : '从文本导入'}
          </button>
        </div>
      </div>

      <div className="import-box">
        <h3>导入结果</h3>
        {linkImportResult ? (
          <div className="result-stack">
            <p>扫描到链接数：{linkImportResult.total}</p>
            <p>新增：{linkImportResult.successCount}</p>
            <p>重复：{linkImportResult.duplicateCount}</p>
            <p>失败：{linkImportResult.failureCount}</p>
            {linkImportResult.failures.length > 0 ? (
              <div className="failure-list">
                {linkImportResult.failures.map((failure) => (
                  <article key={`${failure.index}-${failure.reason}`}>
                    <strong>第 {failure.index} 条</strong>
                    <span>{failure.reason}</span>
                    <span>{failure.snippet || '--'}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">没有失败项</p>
            )}
          </div>
        ) : (
          <p className="muted">导入完成后会在这里显示新增、重复和失败统计。</p>
        )}
      </div>
    </Panel>
  )
}
