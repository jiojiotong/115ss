import type { ReactNode } from 'react'

interface PanelProps {
  className?: string
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function Panel({ className, eyebrow, title, description, actions, children }: PanelProps) {
  return (
    <section className={className ? `panel ${className}` : 'panel'}>
      <header className="panel-header">
        <div>
          {eyebrow ? <p className="panel-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p className="panel-description">{description}</p> : null}
        </div>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}
