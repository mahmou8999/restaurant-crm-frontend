import { AlertCircle, LoaderCircle } from 'lucide-react'

export function Loading({ label = 'جاري التحميل...' }) {
  return <div className="loading"><LoaderCircle size={19} className="spin" />{label}</div>
}

export function ErrorMessage({ children }) {
  if (!children) return null
  return <div className="error-message"><AlertCircle size={18} />{children}</div>
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  )
}
