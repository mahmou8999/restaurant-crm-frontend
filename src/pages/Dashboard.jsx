import { useCallback, useEffect, useState } from 'react'
import { ArrowUpLeft, CalendarDays, ContactRound, MessageCircle, MousePointer2, Plus, Send, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

const money = (value) => new Intl.NumberFormat('ar-EG').format(Number(value || 0))

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(payloadOf(await api.get('/dashboard')))
    } catch (requestError) {
      setData(null)
      setError(requestError.response?.data?.message || 'تعذر تحميل بيانات لوحة التحكم.')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { Promise.resolve().then(loadDashboard) }, [loadDashboard])

  const metrics = data?.stats || data || {}
  const stats = [
    { label: 'إجمالي العملاء', value: metrics.total_customers ?? metrics.customers_count, icon: ContactRound, tone: 'purple' },
    { label: 'رسائل تم إرسالها', value: metrics.messages_sent ?? metrics.sent_messages, icon: Send, tone: 'blue' },
    { label: 'معدل التفاعل', value: metrics.engagement_rate == null ? null : `${metrics.engagement_rate}%`, icon: MousePointer2, tone: 'orange' },
    { label: 'محادثات مفتوحة', value: metrics.open_conversations ?? metrics.conversations_open, icon: MessageCircle, tone: 'green' },
  ]
  const chartData = Array.isArray(data?.messages_chart) ? data.messages_chart : Array.isArray(data?.chart) ? data.chart : []
  const chartMax = Math.max(1, ...chartData.flatMap((item) => [Number(item.sent ?? item.sent_count ?? 0), Number(item.received ?? item.received_count ?? 0)]))
  const chartTicks = chartData.length ? [1, 0.75, 0.5, 0.25, 0].map((ratio) => money(Math.round(chartMax * ratio))) : []

  return (
    <>
      <PageHeader title="صباح الخير، يا مدير 👋" description="دي نظرة سريعة على أداء شغلك النهارده." action={<><button className="button button-outline"><CalendarDays size={17} /> آخر ٧ أيام</button><Link className="button button-primary" to="/campaigns/create"><Plus size={18} /> حملة جديدة</Link></>} />
      {loading ? <Loading /> : error ? <><ErrorMessage>{error}</ErrorMessage><div className="panel dashboard-error"><strong>بيانات لوحة التحكم غير متاحة حالياً</strong><button className="button button-outline" onClick={loadDashboard}>إعادة المحاولة</button></div></> : (
        <>
          <section className="stats-grid">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <article className="stat-card" key={label}>
                <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
                <div className="stat-value">{value == null ? '—' : typeof value === 'string' ? value : money(value)}</div><div className="stat-label">{label}</div>
              </article>
            ))}
          </section>
          <section className="dashboard-grid">
            <article className="panel chart-panel">
              <div className="panel-heading"><div><h2>نظرة عامة</h2><p>أداء الرسائل والتفاعل خلال الأسبوع</p></div><button className="select-button">هذا الأسبوع <span>⌄</span></button></div>
              <div className="chart-legend"><span><i className="legend-dot purple-dot" /> الرسائل المرسلة</span><span><i className="legend-dot pale-dot" /> الرسائل المستلمة</span></div>
              <div className="chart-wrap" aria-label="مخطط الرسائل خلال الأسبوع">
                <div className="chart-y-labels">{chartTicks.map((tick, index) => <span key={index}>{tick}</span>)}</div>
                <div className="chart-plot"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div>{chartData.length ? <div className="chart-bars">{chartData.map((item, index) => <div key={item.id || item.label || index} className="bar-group"><i style={{ height: `${Number(item.received ?? item.received_count ?? 0) / chartMax * 100}%` }} /><i style={{ height: `${Number(item.sent ?? item.sent_count ?? 0) / chartMax * 100}%` }} /></div>)}</div> : <div className="chart-empty">لا توجد بيانات للفترة المحددة</div>}</div>
              </div>
              <div className="chart-x-labels">{chartData.map((item, index) => <span key={item.id || item.label || index}>{item.label || item.day || ''}</span>)}</div>
            </article>
            <article className="panel activity-panel">
              <div className="panel-heading"><div><h2>الحملات النشطة</h2><p>متابعة سريعة لحملاتك</p></div><Link to="/campaigns" className="text-link">عرض الكل</Link></div>
              {(data?.active_campaigns || []).slice(0, 3).map((campaign, index) => (
                <Link to={`/campaigns/${campaign.id}`} className="campaign-mini" key={campaign.id}>
                <span className={`campaign-mini-icon campaign-color-${index}`}><Send size={17} /></span><span className="campaign-mini-main"><strong>{campaign.name}</strong><small>{campaign.sent_count == null ? '—' : money(campaign.sent_count)} رسالة مرسلة</small></span><span className="progress-ring">{campaign.progress == null ? '—' : `${campaign.progress}%`}</span>
                </Link>
              ))}
              {(!data?.active_campaigns || data.active_campaigns.length === 0) && <div className="empty-inline"><div className="empty-icon"><MegaphoneIcon /></div><strong>مفيش حملات نشطة</strong><span>ابدأ أول حملة تواصل مع عملاءك</span><Link to="/campaigns/create" className="text-link">أنشئ حملة <ArrowUpLeft size={14} /></Link></div>}
            </article>
          </section>
          <section className="panel recent-panel">
            <div className="panel-heading"><div><h2>أحدث المحادثات</h2><p>آخر تفاعلات عملاءك معاك</p></div><Link to="/conversations" className="text-link">كل المحادثات <ArrowUpLeft size={14} /></Link></div>
            <div className="table-scroll"><table><thead><tr><th>العميل</th><th>آخر رسالة</th><th>القناة</th><th>الوقت</th><th>الحالة</th></tr></thead><tbody>
              {(data?.recent_conversations || []).slice(0, 4).map((item) => <tr key={item.id}><td><div className="customer-cell"><span className="table-avatar">{(item.customer?.name || item.name || 'ع').slice(0, 1)}</span><strong>{item.customer?.name || item.name}</strong></div></td><td>{item.last_message || item.message}</td><td><span className="channel-tag">واتساب</span></td><td>{item.updated_at || item.time}</td><td>{item.status === 'closed' ? <span className="status-pill muted">مغلقة</span> : item.status === 'open' ? <span className="status-pill success">مفتوحة</span> : '—'}</td></tr>)}
            </tbody></table></div>
            {(!data?.recent_conversations || data.recent_conversations.length === 0) && <div className="table-empty"><UsersRound size={20} /> مفيش محادثات حديثة لسه</div>}
          </section>
        </>
      )}
    </>
  )
}

function MegaphoneIcon() {
  return <Send size={21} />
}
