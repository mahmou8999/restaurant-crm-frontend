import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, BarChart3, Pause, Play, RotateCw, Send, UsersRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api, { errorMessage, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

const statuses = { draft: 'مسودة', scheduled: 'مجدولة', running: 'شغالة', active: 'شغالة', paused: 'متوقفة', completed: 'مكتملة' }

export default function CampaignDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [campaign, setCampaign] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadCampaign = useCallback(async () => {
    setLoading(true)
    try {
      const [campaignResponse, reportResponse] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/campaigns/${id}/report`).catch((requestError) => {
          if (requestError.response?.status !== 404) throw requestError
          return null
        }),
      ])
      setCampaign(payloadOf(campaignResponse)?.campaign || payloadOf(campaignResponse))
      setReport(reportResponse ? payloadOf(reportResponse) : null)
      setError('')
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [id])
  useEffect(() => {
    Promise.resolve().then(loadCampaign)
  }, [loadCampaign])

  const action = async (name) => {
    setBusy(true)
    setError('')
    try {
      const result = payloadOf(await api.post(`/campaigns/${id}/${name}`))
      await loadCampaign()
      if (name === 'preview') setReport((current) => ({ ...current, ...result }))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  const currentStatus = campaign?.status || 'draft'
  return (
    <>
      <PageHeader title={campaign?.name || 'تفاصيل الحملة'} description="تابع أداء الحملة وإحصائيات الرسائل." action={<Link to="/campaigns" className="button button-outline"><ArrowRight size={17} /> كل الحملات</Link>} />
      <ErrorMessage>{error || location.state?.previewError}</ErrorMessage>
      {campaign && <>
        <section className="panel detail-hero"><div className="detail-campaign-mark"><Send size={23} /></div><div className="detail-title"><h2>{campaign.name}</h2><span className={`status-pill ${currentStatus === 'running' || currentStatus === 'completed' ? 'success' : 'muted'}`}><i />{statuses[currentStatus] || currentStatus}</span><p>اتعملت في {campaign.created_at || '—'}</p></div><div className="detail-actions">{currentStatus === 'paused' ? <button className="button button-primary" disabled={busy} onClick={() => action('resume')}><Play size={16} /> استكمال</button> : currentStatus === 'running' || currentStatus === 'active' ? <button className="button button-outline" disabled={busy} onClick={() => action('pause')}><Pause size={16} /> إيقاف مؤقت</button> : <button className="button button-primary" disabled={busy} onClick={() => action('start')}><Play size={16} /> ابدأ الإرسال</button>}<button className="button button-outline" disabled={busy} onClick={() => action('test')}><RotateCw size={16} /> اختبار</button></div></section>
        <section className="stats-grid detail-stats"><Stat icon={<UsersRound size={20} />} title="العملاء المستهدفين" value={report?.eligible_count ?? campaign.eligible_count ?? campaign.recipients_count ?? location.state?.eligibleCount ?? '—'} /><Stat icon={<Send size={20} />} title="رسائل تم إرسالها" value={report?.sent_count ?? campaign.sent_count ?? '—'} /><Stat icon={<BarChart3 size={20} />} title="تم التسليم" value={report?.delivered_count ?? campaign.delivered_count ?? '—'} /><Stat icon={<BarChart3 size={20} />} title="معدل التفاعل" value={report?.engagement_rate == null && campaign.engagement_rate == null ? '—' : `${report?.engagement_rate ?? campaign.engagement_rate}%`} /></section>
        <section className="panel detail-content"><div className="panel-heading"><div><h2>تفاصيل الرسالة</h2><p>القالب المستخدم في الحملة</p></div><button className="button button-outline" disabled={busy} onClick={() => action('preview')}>تحديث المعاينة</button></div><div className="message-preview"><span className="template-status">قالب واتساب</span><p>{campaign.template?.body || campaign.template?.content || campaign.message || 'محتوى الرسالة هيظهر هنا بعد تحميل بيانات القالب.'}</p></div></section>
      </>}
    </>
  )
}

function Stat({ icon, title, value }) {
  return <article className="stat-card"><div className="stat-icon purple">{icon}</div><div className="stat-value">{value}</div><div className="stat-label">{title}</div></article>
}
