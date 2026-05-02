interface ArchiveLogoProps {
  className?: string
  showCaption?: boolean
}

export function ArchiveLogo({ className, showCaption = false }: ArchiveLogoProps) {
  return (
    <div className={className ? `archive-logo ${className}` : 'archive-logo'} aria-hidden="true">
      <div className="archive-display-frame archive-logo-frame">
        <div className="archive-core-visual">
          <div className="archive-core-halo halo-a" />
          <div className="archive-core-halo halo-b" />
          <div className="archive-core-halo halo-c" />
          <div className="archive-core-wireframe" />
          <div className="archive-core-orbit orbit-a" />
          <div className="archive-core-orbit orbit-b" />
          <div className="archive-core-orbit orbit-c" />
          <div className="archive-core-grid" />
          <div className="archive-core-scanline scanline-a" />
          <div className="archive-core-scanline scanline-b" />
          <div className="archive-core-data data-a">ARCHIVE_SIGNAL_001</div>
          <div className="archive-core-data data-b">COORDINATE_LOCK</div>
          <div className="archive-core-data data-c">STELLAR_INDEX_NODE</div>
          <div className="archive-core-center" />
        </div>
        {showCaption ? (
          <div className="archive-display-caption">
            <strong>ARCHIVE CORE 001</strong>
            <span>STAR SYSTEM REPOSITORY</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
