import { useCallback, useEffect, useState } from 'react'
import { FolderPlus, MoreHorizontal, Plus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { errorMessage, listOf, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const loadGroups = useCallback(async () => {
    setLoading(true)
    try {
      setGroups(listOf(payloadOf(await api.get('/groups'))))
      setError('')
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    Promise.resolve().then(loadGroups)
  }, [loadGroups])

  const createGroup = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/groups', { name, description })
      setDialog(false)
      setName('')
      setDescription('')
      await loadGroups()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const removeGroup = async (id) => {
    if (!window.confirm('متأكد إنك عايز تحذف المجموعة؟')) return
    try {
      await api.delete(`/groups/${id}`)
      await loadGroups()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  return (
    <>
      <PageHeader title="مجموعات العملاء" description="قسّم عملاءك لمجموعات عشان توصل لكل واحد فيهم بالرسالة المناسبة." action={<button className="button button-primary" onClick={() => setDialog(true)}><Plus size={18} /> مجموعة جديدة</button>} />
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <Loading /> : groups.length ? <div className="groups-grid">{groups.map((group, index) => <article className="group-card" key={group.id}><div className="group-card-top"><div className={`group-card-icon color-${index % 4}`}><UsersRound size={21} /></div><button className="icon-button" onClick={() => removeGroup(group.id)} aria-label={`حذف ${group.name}`}><MoreHorizontal size={19} /></button></div><h2>{group.name}</h2><p>{group.description || 'مجموعة عملاء وِصال'}</p><div className="group-card-bottom"><span><UsersRound size={15} />{group.customers_count ?? group.customers?.length ?? '—'} عميل</span><Link to={`/customers?group_id=${group.id}`}>عرض العملاء ←</Link></div></article>)}</div> : <div className="empty-state panel"><div className="empty-icon"><FolderPlus size={24} /></div><h3>مجموعاتك هتظهر هنا</h3><p>أنشئ مجموعات تساعدك تستهدف العملاء المناسبين.</p><button className="button button-primary" onClick={() => setDialog(true)}><Plus size={17} /> إنشاء مجموعة</button></div>}
      {dialog && <div className="modal-backdrop"><form className="modal-card" onSubmit={createGroup}><div className="modal-heading"><div><h2>مجموعة جديدة</h2><p>اختار اسم ووصف واضح للمجموعة.</p></div><button type="button" className="icon-button" onClick={() => setDialog(false)}>×</button></div><label>اسم المجموعة<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: عملاء القاهرة" /></label><label>الوصف<textarea rows="3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف مختصر للمجموعة..." /></label><ErrorMessage>{error}</ErrorMessage><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setDialog(false)}>إلغاء</button><button className="button button-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'إنشاء المجموعة'}</button></div></form></div>}
    </>
  )
}
