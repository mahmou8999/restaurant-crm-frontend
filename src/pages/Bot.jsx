import { useEffect, useState } from 'react'
import { Bot as BotIcon, Check, MessageSquareText, Save, Sparkles } from 'lucide-react'
import api, { errorMessage, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

export default function Bot() {
  const [settings, setSettings] = useState({ enabled: false, welcome_message: '', fallback_message: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    api.get('/bot/settings').then((response) => {
      if (active) setSettings({ enabled: false, welcome_message: '', fallback_message: '', ...(payloadOf(response) || {}) })
    }).catch((requestError) => {
      if (active) setError(errorMessage(requestError))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/bot/settings', settings)
      setSaved(true)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="مساعد وِصال" description="جهّز ردود تلقائية تساعدك ترد على عملاءك على مدار الساعة." />
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <Loading /> : <form className="bot-layout" onSubmit={save}>
        <section className="panel bot-main"><div className="bot-welcome"><div className="bot-icon"><BotIcon size={25} /></div><div><h2>المساعد الذكي</h2><p>رد تلقائي على استفسارات عملاءك.</p></div><label className="switch"><input type="checkbox" checked={Boolean(settings.enabled)} onChange={(event) => setSettings({ ...settings, enabled: event.target.checked })} /><span /></label></div><div className={`bot-state ${settings.enabled ? 'enabled' : ''}`}><i />{settings.enabled ? 'المساعد شغال' : 'المساعد متوقف'}</div><div className="bot-divider" /><label className="bot-field"><span><strong>رسالة الترحيب</strong><small>بتتبعت للعميل أول ما يبدأ محادثة.</small></span><textarea rows="4" value={settings.welcome_message} onChange={(event) => setSettings({ ...settings, welcome_message: event.target.value })} placeholder="أهلاً بيك! إزاي نقدر نساعدك؟" /></label><label className="bot-field"><span><strong>الرد عند عدم الفهم</strong><small>رسالة بديلة لما المساعد ميقدرش يجاوب.</small></span><textarea rows="4" value={settings.fallback_message} onChange={(event) => setSettings({ ...settings, fallback_message: event.target.value })} placeholder="معلش، ممكن توضح سؤالك أكتر؟" /></label><div className="bot-footer"><span>{saved && <><Check size={16} /> تم حفظ الإعدادات</>}</span><button className="button button-primary" disabled={saving}><Save size={16} />{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button></div></section>
        <aside className="panel bot-aside"><div className="bot-aside-icon"><Sparkles size={20} /></div><h2>خلي الردود شبهك</h2><p>اكتب رسائل بسيطة وقريبة من أسلوب علامتك التجارية. تقدر تعدل الردود في أي وقت.</p><div className="bot-example"><MessageSquareText size={16} /><span>مثال على رسالة الترحيب</span><p>{settings.welcome_message || 'أهلاً بيك! إزاي نقدر نساعدك؟'}</p></div><div className="bot-tip"><span>نصيحة</span><p>خلي الرسالة قصيرة، ووجّه العميل للخطوة اللي بعدها.</p></div></aside>
      </form>}
    </>
  )
}
