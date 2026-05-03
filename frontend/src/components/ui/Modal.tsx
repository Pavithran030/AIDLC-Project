import { useEffect } from 'react'

interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ onClose, children, title }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {title && (
          <h2 className="font-serif text-xl text-ink mb-4 pb-2 border-b border-paper-border">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
