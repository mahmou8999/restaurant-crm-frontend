import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3, Bot, ChevronDown, ContactRound, Megaphone, MessageCircle,
  MessageSquareText, Settings2, UsersRound, Wifi, LogOut, Bell, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/auth'

const navItems = [
  { to: '/dashboard', label: 'الرئيسية', icon: BarChart3 },
  { to: '/customers', label: 'العملاء', icon: ContactRound },
  { to: '/groups', label: 'المجموعات', icon: UsersRound },
  { to: '/campaigns', label: 'الحملات', icon: Megaphone },
  { to: '/whatsapp', label: 'ربط واتساب', icon: Wifi },
  { to: '/conversations', label: 'المحادثات', icon: MessageCircle },
  { to: '/bot', label: 'البوت', icon: Bot },
  { to: '/settings', label: 'الإعدادات', icon: Settings2 },
]

const titles = Object.fromEntries(navItems.map(({ to, label }) => [to, label]))

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = pathname.startsWith('/campaigns/') ? 'تفاصيل الحملة' : titles[pathname] || 'لوحة التحكم'

  return (
    <div className="app-shell" dir="rtl">
      {menuOpen && <button className="sidebar-backdrop" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><MessageSquareText size={23} /></div>
          <div><strong>وِصال</strong><span>إدارة علاقات العملاء</span></div>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة"><X size={19} /></button>
        </div>
        <div className="workspace-label">مساحة العمل</div>
        <button className="workspace-switch">
          <span className="workspace-avatar">و</span><span className="workspace-name">مطعم وِصال<span>الخطة الاحترافية</span></span><ChevronDown size={16} />
        </button>
        <nav className="main-nav" aria-label="القائمة الرئيسية">
          <span className="nav-section">القائمة الرئيسية</span>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive || (to === '/campaigns' && pathname.startsWith('/campaigns/')) ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-badge">؟</div><div><strong>محتاج مساعدة؟</strong><span>فريقنا موجود لمساعدتك</span></div><ChevronDown size={15} /></div>
          <button className="profile-button" onClick={logout}>
            <span className="profile-avatar">{(user?.name || 'م').slice(0, 1)}</span>
            <span className="profile-info"><strong>{user?.name || 'مدير المطعم'}</strong><span>{user?.email || 'test@example.com'}</span></span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>وِصال</span><span className="crumb-slash">/</span><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <span className="today-label">{new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span>
            <button className="icon-button notification-button" aria-label="الإشعارات"><Bell size={19} /><i /></button>
            <div className="top-avatar">{(user?.name || 'م').slice(0, 1)}</div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
