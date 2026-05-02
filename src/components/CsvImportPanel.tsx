import { Panel } from './Panel'
import type { ImportResult } from '../types'

interface CsvImportPanelProps {
  importFile: File | null
  importResult: ImportResult | null
  uploadingImport: boolean
  onFileChange: (file: File | null) => void
  onImport: () => Promise<void>
}

export function CsvImportPanel({
  importFile,
  importResult,
  uploadingImport,
  onFileChange,
  onImport,
}: CsvImportPanelProps) {
  return (
    <Panel
      eyebrow="CSV Import"
      title="表格导入"
      description="CSV 表头必须严格等于 title、resource_url、access_code、note。错误行不会影响其他成功行。"
    >
      <div className="import-intro-strip">
        <span>结构化录入</span>
        <span>固定表头</span>
        <span>逐行校验</span>
      </div>

      <div className="import-layout">
        <div className="import-box">
          <label className="file-picker">
            <span>选择 CSV 文件</span>
            <input type="file" accept=".csv" onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
          </label>
          <p className="muted">{importFile ? `已选择：${importFile.name}` : '尚未选择文件'}</p>
          <button
            type="button"
            className="primary-button"
            disabled={uploadingImport}
            onClick={() => void onImport()}
          >
            {uploadingImport ? '导入中...' : '开始导入'}
          </button>
        </div>

        <div className="import-box">
          <h3>导入结果</h3>
          {importResult ? (
            <div className="result-stack">
              <p>总行数：{importResult.total}</p>
              <p>成功：{importResult.successCount}</p>
              <p>失败：{importResult.failureCount}</p>
              {importResult.failures.length > 0 ? (
                <div className="failure-list">
                  {importResult.failures.map((failure) => (
                    <article key={`${failure.line}-${failure.reason}`}>
                      <strong>第 {failure.line} 行</strong>
                      <span>{failure.reason}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">没有失败行</p>
              )}
            </div>
          ) : (
            <p className="muted">导入完成后会在这里显示统计和失败明细。</p>
          )}
        </div>
      </div>
    </Panel>
  )
}
