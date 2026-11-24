import { useEffect, useState } from 'react'
import { ArrowLeft, Megaphone, Plus, Send, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { errorMessage, listOf, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

const statusNames = { draft: 'مسودة', scheduled: 'مجدولة', running: 'شغالة', active: 'شغالة', paused: 'متوقفة', completed: 'مكتملة', failed: 'فشلت' }

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/campaigns', { params: { status: status || undefined } }).then((response) => {
      if (active) {
        setCampaigns(listOf(payloadOf(response)))
        setError('')
      }
    }).catch((requestError) => {
      if (active) setError(errorMessage(requestError))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [status])

  return (
    <>
      <PageHeader title="الحملات" description="أنشئ حملاتك وتابع نتائج رسائلك التسويقية." action={<Link className="button button-primary" to="/campaigns/create"><Plus size={18} /> حملة جديدة</Link>} />
      <ErrorMessage>{error}</ErrorMessage>
      <div className="campaign-overview"><div className="overview-copy"><span className="overview-icon"><Sparkles size={18} /></span><div><strong>خلّي رسالتك توصل في وقتها</strong><p>صمّم حملة جديدة واستهدف العملاء المناسبين بسهولة.</p></div></div><Link className="button button-dark" to="/campaigns/create">ابدأ حملة <ArrowLeft size={17} /></Link></div>
      <section className="panel data-panel">
        <div className="table-toolbar"><div className="toolbar-title"><h2>كل الحملات</h2><span>{campaigns.length}</span></div><div className="select-field"><select aria-label="تصفية الحملات" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">كل الحملات</option><option value="running">شغالة</option><option value="completed">مكتملة</option><option value="draft">مسودة</option></select></div></div>
        {loading ? <Loading /> : campaigns.length ? <div className="table-scroll"><table><thead><tr><th>اسم الحملة</th><th>المستهدفين</th><th>تم الإرسال</th><th>معدل التفاعل</th><th>تاريخ الإنشاء</th><th>الحالة</th></tr></thead><tbody>
          {campaigns.map((campaign) => <tr key={campaign.id}><td><Link className="campaign-name" to={`/campaigns/${campaign.id}`}><span className="campaign-table-icon"><Send size={16} /></span><strong>{campaign.name}</strong></Link></td><td>{campaign.recipients_count ?? campaign.eligible_count ?? '—'}</td><td>{campaign.sent_count ?? '—'}</td><td>{campaign.engagement_rate == null ? '—' : `${campaign.engagement_rate}%`}</td><td>{campaign.created_at || '—'}</td><td><span className={`status-pill ${['running', 'active', 'completed'].includes(campaign.status) ? 'success' : campaign.status === 'failed' ? 'danger' : 'muted'}`}><i />{statusNames[campaign.status] || campaign.status || 'مسودة'}</span></td></tr>)}
        </tbody></table></div> : <div className="empty-state"><div className="empty-icon"><Megaphone size={24} /></div><h3>لسه مفيش حملات</h3><p>أنشئ أول حملة وابدأ التواصل مع عملاءك.</p><Link className="button button-primary" to="/campaigns/create"><Plus size={17} /> حملة جديدة</Link></div>}
      </section>
    </>
  )
}
