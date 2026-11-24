import { useEffect, useState } from 'react'
import { Check, Clock3, Gauge, Save, Settings2, ShieldCheck } from 'lucide-react'
import api, { errorMessage, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

export default function Settings() {
  const [settings, setSettings] = useState({ sender_driver: 'evolution', daily_limit: 1000, delay: 3 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/settings').then((response) => {
      if (active) setSettings((current) => ({ ...current, ...(payloadOf(response) || {}) }))
    }).catch((requestError) => {
      if (active) setError(errorMessage(requestError))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const response = payloadOf(await api.put('/settings', settings))
      if (response && typeof response === 'object') setSettings((current) => ({ ...current, ...response }))
      setSaved(true)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="الإعدادات" description="تحكّم في إعدادات الإرسال وطريقة التواصل مع عملاءك." />
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <Loading /> : <form className="settings-layout" onSubmit={save}>
        <section className="panel settings-main"><div className="settings-heading"><span className="settings-heading-icon"><Settings2 size={20} /></span><div><h2>إعدادات الرسائل</h2><p>خصّص طريقة إرسال رسائلك.</p></div></div><div className="settings-field"><div className="settings-field-copy"><strong>طريقة الإرسال</strong><span>اختار مزوّد خدمة واتساب.</span></div><div className="driver-options"><label className={settings.sender_driver === 'evolution' ? 'selected' : ''}><input type="radio" name="driver" value="evolution" checked={settings.sender_driver === 'evolution'} onChange={() => setSettings({ ...settings, sender_driver: 'evolution' })} /><span className="driver-logo evolution-logo">E</span><span><strong>Evolution API</strong><small>اتصال واتساب المرتبط</small></span>{settings.sender_driver === 'evolution' && <Check size={17} />}</label><label className={settings.sender_driver === 'meta' ? 'selected' : ''}><input type="radio" name="driver" value="meta" checked={settings.sender_driver === 'meta'} onChange={() => setSettings({ ...settings, sender_driver: 'meta' })} /><span className="driver-logo meta-logo">M</span><span><strong>Meta WhatsApp</strong><small>WhatsApp Business API</small></span>{settings.sender_driver === 'meta' && <Check size={17} />}</label></div></div><div className="settings-divider" /><label className="settings-field"><span className="settings-field-copy"><strong><Gauge size={17} /> الحد اليومي للرسائل</strong><span>أقصى عدد رسائل مسموح بإرسالها في اليوم.</span></span><span className="number-input"><input type="number" min="1" value={settings.daily_limit} onChange={(event) => setSettings({ ...settings, daily_limit: Number(event.target.value) })} /><small>رسالة / يوم</small></span></label><div className="settings-divider" /><label className="settings-field"><span className="settings-field-copy"><strong><Clock3 size={17} /> التأخير بين الرسائل</strong><span>فاصل زمني لتوزيع إرسال الرسائل.</span></span><span className="number-input"><input type="number" min="0" value={settings.delay} onChange={(event) => setSettings({ ...settings, delay: Number(event.target.value) })} /><small>ثانية</small></span></label><div className="settings-divider" /><div className="settings-save"><span>{saved && <><Check size={16} /> تم حفظ التغييرات</>}</span><button className="button button-primary" disabled={saving}><Save size={16} />{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button></div></section>
        <aside className="panel settings-aside"><div className="settings-aside-icon"><ShieldCheck size={20} /></div><h2>بياناتك في أمان</h2><p>مفتاح Evolution API محفوظ في السيرفر فقط. الواجهة بتتواصل مع الخادم ومابتتعاملش مع مفاتيح سرية.</p><div className="security-indicator"><i /> الاتصال بالخادم مشفّر</div></aside>
      </form>}
    </>
  )
}
