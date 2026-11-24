import { useCallback, useEffect, useState } from 'react'
import { CheckCheck, MessageCircle, MoreHorizontal, Paperclip, Search, Send, Smile, UserRound } from 'lucide-react'
import api, { errorMessage, listOf, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

export default function Conversations() {
  const [conversations, setConversations] = useState([])
  const [filter, setFilter] = useState('open')
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadMessages = useCallback(async () => {
    if (!selected?.id) return
    try {
      const response = payloadOf(await api.get(`/whatsapp/conversations/${selected.id}`))
      setMessages(listOf(response?.messages ?? response))
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }, [selected])

  useEffect(() => {
    let active = true
    api.get('/whatsapp/conversations', { params: { status: filter } }).then((response) => {
      if (!active) return
      const items = listOf(payloadOf(response))
      setConversations(items)
      setSelected((current) => current || items[0] || null)
      setError('')
    }).catch((requestError) => {
      if (active) setError(errorMessage(requestError))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [filter])
  useEffect(() => {
    Promise.resolve().then(loadMessages)
  }, [loadMessages])

  const sendReply = async (event) => {
    event.preventDefault()
    if (!message.trim() || !selected?.id) return
    setSending(true)
    setError('')
    try {
      await api.post(`/whatsapp/conversations/${selected.id}/reply`, { message: message.trim() })
      setMessage('')
      await loadMessages()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSending(false)
    }
  }

  const visible = conversations.filter((item) => `${item.customer?.name || item.name || ''} ${item.customer?.phone || item.phone || ''}`.includes(search))

  return (
    <>
      <PageHeader title="المحادثات" description="كل محادثات عملاءك على واتساب في مكان واحد." />
      <ErrorMessage>{error}</ErrorMessage>
      <section className="inbox panel">
        <aside className="inbox-list"><div className="inbox-top"><div className="inbox-tabs"><button className={filter === 'open' ? 'active' : ''} onClick={() => { setSelected(null); setFilter('open') }}>مفتوحة</button><button className={filter === 'closed' ? 'active' : ''} onClick={() => { setSelected(null); setFilter('closed') }}>مغلقة</button></div><div className="inbox-search"><Search size={16} /><input placeholder="ابحث عن محادثة..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>
          <div className="conversation-list">{loading ? <Loading /> : visible.map((item) => <button key={item.id} className={`conversation-item ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => { setMessages([]); setSelected(item) }}><span className="table-avatar">{(item.customer?.name || item.name || 'ع').slice(0, 1)}</span><span className="conversation-summary"><strong>{item.customer?.name || item.name || 'عميل'}</strong><small>{item.last_message || item.message || 'ابدأ المحادثة'}</small></span><span className="conversation-meta"><small>{item.updated_at || item.time || ''}</small>{item.unread_count > 0 && <i>{item.unread_count}</i>}</span></button>)}</div>
          {!loading && !visible.length && <div className="conversation-empty"><MessageCircle size={21} /><span>مفيش محادثات {filter === 'open' ? 'مفتوحة' : 'مغلقة'}.</span></div>}
        </aside>
        <div className="chat-pane">{selected ? <><div className="chat-header"><span className="table-avatar">{(selected.customer?.name || selected.name || 'ع').slice(0, 1)}</span><div className="chat-customer"><strong>{selected.customer?.name || selected.name || 'عميل'}</strong><small dir="ltr">{selected.customer?.phone || selected.phone || 'واتساب'}</small></div><span className="channel-tag">واتساب</span><button className="icon-button" aria-label="خيارات المحادثة"><MoreHorizontal size={19} /></button></div><div className="chat-messages">{messages.length ? messages.map((item) => <div key={item.id || `${item.created_at}-${item.body}`} className={`message-row ${item.direction === 'outgoing' || item.from_me ? 'outgoing' : 'incoming'}`}><div className="chat-bubble"><p>{item.body || item.message || item.text}</p><small>{item.created_at || item.time || ''}{(item.direction === 'outgoing' || item.from_me) && <CheckCheck size={14} />}</small></div></div>) : <div className="conversation-empty"><UserRound size={23} /><span>مفيش رسائل في المحادثة دي لسه.</span></div>}</div><form className="chat-compose" onSubmit={sendReply}><div className="compose-tools"><button type="button" aria-label="إرفاق ملف"><Paperclip size={18} /></button><button type="button" aria-label="إيموجي"><Smile size={18} /></button></div><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب رسالتك هنا..." /><button className="send-button" disabled={sending || !message.trim()} aria-label="إرسال الرسالة"><Send size={17} /></button></form></> : <div className="chat-placeholder"><div className="empty-icon"><MessageCircle size={25} /></div><strong>اختار محادثة</strong><span>اختار محادثة من القائمة عشان تشوف الرسائل وترد.</span></div>}</div>
      </section>
    </>
  )
}
