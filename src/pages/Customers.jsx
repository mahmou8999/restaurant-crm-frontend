import { useCallback, useEffect, useState } from 'react'
import { ContactRound, Download, MoreHorizontal, Plus, Search, SlidersHorizontal, Upload, UsersRound } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api, { errorMessage, listOf, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

const blankCustomer = { name: '', phone: '', email: '', city: '' }

export default function Customers() {
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('group_id') || ''
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current: 1, last: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState(null)
  const [form, setForm] = useState(blankCustomer)
  const [importing, setImporting] = useState(false)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/customers', { params: { search: search || undefined, status: status || undefined, group_id: groupId || undefined, per_page: 20, page } })
      setCustomers(listOf(payloadOf(response)))
      const pageInfo = response.data?.meta || response.data?.pagination || payloadOf(response)?.meta || response.data
      setPagination({
        current: Number(pageInfo?.current_page || pageInfo?.currentPage || page),
        last: Number(pageInfo?.last_page || pageInfo?.lastPage || pageInfo?.total_pages || 1),
        total: Number(pageInfo?.total || pageInfo?.total_count || 0),
      })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [groupId, page, search, status])

  useEffect(() => {
    Promise.resolve().then(loadCustomers)
  }, [loadCustomers])

  const openNew = () => { setForm(blankCustomer); setDialog({ mode: 'create' }) }
  const openEdit = (customer) => { setForm({ name: customer.name || '', phone: customer.phone || '', email: customer.email || '', city: customer.city || '' }); setDialog({ mode: 'edit', id: customer.id }) }

  const saveCustomer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (dialog.mode === 'edit') await api.put(`/customers/${dialog.id}`, form)
      else await api.post('/customers', form)
      setDialog(null)
      await loadCustomers()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const archive = async (id) => {
    if (!window.confirm('متأكد إنك عايز تأرشف العميل ده؟')) return
    try {
      await api.post(`/customers/${id}/archive`)
      await loadCustomers()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  const exportCustomers = async () => {
    setError('')
    try {
      const response = await api.get('/customers/export', { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'customers.csv'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  const importCustomers = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      await api.post('/customers/import', body)
      await loadCustomers()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  return (
    <>
      <PageHeader title="العملاء" description="نظّم بيانات عملاءك، وتابع تفاعلهم معاك من مكان واحد." action={<><button className="button button-outline" onClick={exportCustomers}><Download size={17} /> تصدير</button><label className={`button button-outline upload-button ${importing ? 'disabled' : ''}`}><Upload size={17} />{importing ? 'جاري الاستيراد...' : 'استيراد'}<input type="file" accept=".csv,.xlsx,.xls" hidden onChange={importCustomers} disabled={importing} /></label><button className="button button-primary" onClick={openNew}><Plus size={18} /> إضافة عميل</button></>} />
      <ErrorMessage>{error}</ErrorMessage>
      <section className="panel data-panel">
        <div className="table-toolbar">
          <div className="search-field"><Search size={17} /><input placeholder="ابحث بالاسم أو رقم الموبايل..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /><kbd>⌘ K</kbd></div>
          <label className="select-field"><SlidersHorizontal size={16} /><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">كل الحالات</option><option value="active">نشط</option><option value="archived">مؤرشف</option></select></label>
          <span className="result-count">{pagination.total || customers.length} عميل</span>
        </div>
        {loading ? <Loading /> : customers.length > 0 ? <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="تحديد الكل" /></th><th>العميل</th><th>رقم الموبايل</th><th>المدينة</th><th>المجموعة</th><th>الحالة</th><th /></tr></thead><tbody>
          {customers.map((customer) => <tr key={customer.id}><td><input type="checkbox" aria-label={`تحديد ${customer.name}`} /></td><td><div className="customer-cell"><span className="table-avatar">{(customer.name || 'ع').slice(0, 1)}</span><div><strong>{customer.name}</strong><small>{customer.email || '—'}</small></div></div></td><td dir="ltr" className="phone-cell">{customer.phone || '—'}</td><td>{customer.city || '—'}</td><td><span className="group-tag"><UsersRound size={13} />{customer.group?.name || customer.group_name || 'بدون مجموعة'}</span></td><td><span className={`status-pill ${customer.status === 'archived' ? 'muted' : 'success'}`}><i />{customer.status === 'archived' ? 'مؤرشف' : 'نشط'}</span></td><td><div className="row-actions"><button title="تعديل" onClick={() => openEdit(customer)}>تعديل</button><button className="icon-button" title="خيارات" onClick={() => archive(customer.id)}><MoreHorizontal size={18} /></button></div></td></tr>)}
        </tbody></table><div className="table-footer"><span>عرض {customers.length} من {pagination.total || customers.length} عميل</span><div><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>السابق</button><button className="current-page">{pagination.current}</button><button disabled={page >= pagination.last} onClick={() => setPage((value) => Math.min(pagination.last, value + 1))}>التالي</button></div></div></div> : <div className="empty-state"><div className="empty-icon"><ContactRound size={24} /></div><h3>لسه مفيش عملاء هنا</h3><p>ضيف أول عميل أو استورد قائمة عملاءك.</p><button className="button button-primary" onClick={openNew}><Plus size={17} /> إضافة عميل</button></div>}
      </section>
      {dialog && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null) }}><form className="modal-card" onSubmit={saveCustomer}><div className="modal-heading"><div><h2>{dialog.mode === 'edit' ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2><p>املأ بيانات العميل الأساسية.</p></div><button type="button" className="icon-button" onClick={() => setDialog(null)}>×</button></div><label>اسم العميل<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>رقم الموبايل<input required dir="ltr" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>البريد الإلكتروني<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>المدينة<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><ErrorMessage>{error}</ErrorMessage><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setDialog(null)}>إلغاء</button><button className="button button-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ العميل'}</button></div></form></div>}
    </>
  )
}
