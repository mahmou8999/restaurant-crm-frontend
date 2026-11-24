import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, Send, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage, listOf, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

export default function CampaignCreate() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [city, setCity] = useState('')
  const [groupIds, setGroupIds] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([api.get('/templates'), api.get('/groups')]).then(([templateResponse, groupResponse]) => {
      if (!active) return
      const templateList = listOf(payloadOf(templateResponse))
      setTemplates(templateList)
      setGroups(listOf(payloadOf(groupResponse)))
      if (templateList.length) setTemplateId(String(templateList[0].id))
    }).catch((requestError) => {
      if (active) setError(errorMessage(requestError))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const toggleGroup = (id) => setGroupIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = payloadOf(await api.post('/campaigns', {
        name,
        template_id: templateId,
        filters: { city: city || undefined, group_ids: groupIds.length ? groupIds : undefined },
      }))
      const campaign = response?.campaign || response
      if (!campaign?.id) throw new Error('تم إنشاء الحملة لكن لم يصل معرّف الحملة من الخادم.')
      let eligibleCount = null
      let previewError = ''
      try {
        const preview = payloadOf(await api.post(`/campaigns/${campaign.id}/preview`))
        eligibleCount = preview?.eligible_count ?? preview?.count ?? null
      } catch (requestError) {
        previewError = `اتعملت الحملة كمسودة، لكن تعذر حساب العدد المؤهل: ${errorMessage(requestError)}`
      }
      navigate(`/campaigns/${campaign.id}`, { state: { eligibleCount, previewError } })
    } catch (requestError) {
      setError(requestError.response ? errorMessage(requestError) : requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="إنشاء حملة جديدة" description="جهّز رسالتك واختار العملاء اللي هتوصلهم." action={<Link className="button button-outline" to="/campaigns"><ArrowRight size={17} /> رجوع للحملات</Link>} />
      {loading ? <Loading /> : <form className="campaign-create-layout" onSubmit={submit}>
        <div className="campaign-form-column">
          <section className="panel form-panel"><div className="section-title"><span className="step-number">١</span><div><h2>بيانات الحملة</h2><p>اختار اسم يساعدك تميّز حملتك.</p></div></div><label>اسم الحملة<input value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: عرض نهاية الأسبوع" required /></label></section>
          <section className="panel form-panel"><div className="section-title"><span className="step-number">٢</span><div><h2>اختار القالب</h2><p>الرسالة هتتبعت للعملاء بالقالب المحدد.</p></div></div>{templates.length ? <div className="template-list">{templates.map((template) => <label key={template.id} className={`template-option ${String(templateId) === String(template.id) ? 'selected' : ''}`}><input type="radio" name="template" value={template.id} checked={String(templateId) === String(template.id)} onChange={() => setTemplateId(String(template.id))} /><span className="template-check">{String(templateId) === String(template.id) && <Check size={13} />}</span><span className="template-copy"><strong>{template.name}</strong><small>{template.body || template.content || template.category || 'قالب رسالة واتساب'}</small></span><span className="template-status">واتساب</span></label>)}</div> : <div className="inline-notice">مفيش قوالب متاحة. أضف قالب من إعدادات حسابك الأول.</div>}</section>
          <section className="panel form-panel"><div className="section-title"><span className="step-number">٣</span><div><h2>استهداف العملاء</h2><p>اختار مين هيستقبل الرسالة.</p></div></div><label>المدينة (اختياري)<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="مثال: القاهرة" /></label><div className="form-label">المجموعات (اختياري)</div>{groups.length ? <div className="group-checkbox-list">{groups.map((group) => <label key={group.id} className="group-checkbox"><input type="checkbox" checked={groupIds.includes(group.id)} onChange={() => toggleGroup(group.id)} /><span>{group.name}</span><small>{group.customers_count ?? 0} عميل</small></label>)}</div> : <span className="field-hint">مفيش مجموعات متاحة — هتستهدف كل العملاء المطابقين.</span>}</section>
        </div>
        <aside className="campaign-summary panel"><div className="summary-icon"><Send size={21} /></div><h2>ملخص الحملة</h2><p>راجع إعدادات حملتك قبل الإنشاء.</p><div className="summary-row"><span>الاسم</span><strong>{name || '—'}</strong></div><div className="summary-row"><span>القالب</span><strong>{templates.find((item) => String(item.id) === String(templateId))?.name || '—'}</strong></div><div className="summary-row"><span>المجموعات</span><strong>{groupIds.length ? `${groupIds.length} مجموعات` : 'كل العملاء'}</strong></div><div className="recipient-estimate"><UsersRound size={18} /><div><span>العدد المؤهل</span><strong>هيظهر بعد إنشاء الحملة</strong></div></div><ErrorMessage>{error}</ErrorMessage><button className="button button-primary full-width" type="submit" disabled={saving || !templates.length}>{saving ? 'جاري إنشاء الحملة...' : <>إنشاء كمسودة <ChevronLeft size={17} /></>}</button><Link className="cancel-link" to="/campaigns">إلغاء والعودة</Link></aside>
      </form>}
    </>
  )
}
