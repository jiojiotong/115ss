import { useState } from 'react'
import type { TgTargetItem } from '../types'

interface NamingRuleDialogProps {
  target: TgTargetItem
  onClose: () => void
  onSave: (targetId: number, namingRule: string) => Promise<void>
  onTest: (namingRule: string, testText: string) => Promise<{ success: boolean; result?: any; error?: string; matched?: boolean }>
}

export function NamingRuleDialog({ target, onClose, onSave, onTest }: NamingRuleDialogProps) {
  const [namingRule, setNamingRule] = useState(target.naming_rule || '')
  const [testText, setTestText] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(target.id, namingRule)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testText.trim()) {
      setTestResult({ success: false, error: '请输入测试文本' })
      return
    }

    setTesting(true)
    try {
      const result = await onTest(namingRule, testText)
      setTestResult(result)
    } finally {
      setTesting(false)
    }
  }

  const exampleRule = {
    title_pattern: '^(.+?)\\s*[（(]?(\\d{4})[)）]?',
    title_group: 1,
    year_group: 2,
    quality_pattern: '(4K|1080P|720P|HDR|BluRay)',
    size_pattern: '(\\d+(?:\\.\\d+)?\\s*(?:GB|MB|TB))',
    multiline: false,
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>配置命名规则</h2>
          <button className="dialog-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-body">
          <div className="form-grid">
            <label>
              <span>目标群组</span>
              <input value={target.chat_title} disabled />
            </label>

            <label>
              <span>命名规则（JSON 格式）</span>
              <textarea
                value={namingRule}
                onChange={(e) => setNamingRule(e.target.value)}
                placeholder={JSON.stringify(exampleRule, null, 2)}
                rows={12}
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              />
            </label>

            <div className="validation-box">
              <strong>规则说明</strong>
              <span>• title_pattern: 标题匹配正则表达式（必需）</span>
              <span>• title_group: 标题捕获组索引（默认 1）</span>
              <span>• year_group: 年份捕获组索引</span>
              <span>• quality_pattern: 画质匹配正则表达式</span>
              <span>• size_pattern: 文件大小匹配正则表达式</span>
              <span>• multiline: 是否多行模式（默认 false）</span>
            </div>

            <div className="section-divider" />

            <label>
              <span>测试文本</span>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="粘贴一条 TG 消息文本进行测试..."
                rows={6}
              />
            </label>

            <div className="form-actions-inline">
              <button
                type="button"
                className="ghost-button"
                onClick={handleTest}
                disabled={testing || !testText.trim()}
              >
                {testing ? '测试中...' : '测试规则'}
              </button>
            </div>

            {testResult && (
              <div className={`validation-box ${testResult.success && testResult.matched ? 'success' : 'error'}`}>
                {testResult.success ? (
                  testResult.matched ? (
                    <>
                      <strong>✓ 匹配成功</strong>
                      {testResult.result?.title && <span>标题: {testResult.result.title}</span>}
                      {testResult.result?.release_year && <span>年份: {testResult.result.release_year}</span>}
                      {testResult.result?.quality_label && <span>画质: {testResult.result.quality_label}</span>}
                      {testResult.result?.resource_size && <span>大小: {testResult.result.resource_size}</span>}
                    </>
                  ) : (
                    <>
                      <strong>⚠ 未匹配</strong>
                      <span>规则有效但未能从测试文本中提取信息</span>
                    </>
                  )
                ) : (
                  <>
                    <strong>✗ 错误</strong>
                    <span>{testResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="ghost-button" onClick={onClose} disabled={saving}>
            取消
          </button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
