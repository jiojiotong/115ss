import type { BannerState } from '../types'

interface StatusBannerProps {
  banner: BannerState | null
  onClose: () => void
}

export function StatusBanner({ banner, onClose }: StatusBannerProps) {
  if (!banner) {
    return null
  }

  return (
    <div className={`status-banner ${banner.tone}`}>
      <p>{banner.text}</p>
      <button type="button" className="ghost-button" onClick={onClose}>
        关闭
      </button>
    </div>
  )
}
