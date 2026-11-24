import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, CircleHelp, LoaderCircle, RefreshCw, ShieldCheck, Smartphone, Wifi, WifiOff } from 'lucide-react'
import api, { errorMessage, payloadOf } from '../lib/api'
import { ErrorMessage, Loading, PageHeader } from '../components/Feedback'

const isConnected = (result) => result?.connected === true || ['connected', 'open', 'ready'].includes(String(result?.status || result?.state || result?.instance?.state || '').toLowerCase())

export default function WhatsAppConnect() {
  const [status, setStatus] = useState(null)
  const [qr, setQr] = useState('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)

  const checkStatus = useCallback(async () => {
    try {
      const current = payloadOf(await api.get('/whatsapp/evolution/status'))
      setStatus(current)
      setError('')
      if (isConnected(current)) {
        setQr('')
        if (timer.current) clearInterval(timer.current)
      }
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialRequest = window.setTimeout(checkStatus, 0)
    return () => {
      window.clearTimeout(initialRequest)
      if (timer.current) clearInterval(timer.current)
    }
  }, [checkStatus])

  const connect = async () => {
    setConnecting(true)
    setError('')
    try {
      const result = payloadOf(await api.post('/whatsapp/evolution/connect'))
      const qrData = result?.qr_code || result?.qr || result?.qrcode?.base64 || result?.base64
      setQr(qrData || '')
      await checkStatus()
      if (timer.current) clearInterval(timer.current)
      timer.current = setInterval(checkStatus, 5000)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setConnecting(false)
    }
  }

  const connected = isConnected(status)
  const phone = status?.phone_number || status?.phone || status?.number || status?.instance?.phone_number || ''
  const qrSource = qr && (qr.startsWith('data:') || /^https?:\/\//.test(qr) ? qr : `data:image/png;base64,${qr}`)
  return (
    <>
      <PageHeader title="ربط واتساب" description="اربط رقم واتساب بتاعك عشان تدير محادثاتك وحملاتك من وِصال." action={<span className={`connection-badge ${connected ? 'online' : 'offline'}`}><i />{connected ? 'متصل' : 'غير متصل'}</span>} />
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <Loading /> : <div className="whatsapp-layout">
        <section className={`connection-hero panel ${connected ? 'connection-ready' : ''}`}>
          <div className={`connection-icon ${connected ? 'connected' : ''}`}>{connected ? <Check size={29} /> : <Wifi size={27} />}</div>
          <span className={`connection-label ${connected ? 'connected-text' : ''}`}><i />{connected ? 'الاتصال نشط' : 'في انتظار الربط'}</span>
          <h2>{connected ? 'واتساب متصل بنجاح' : 'اربط حساب واتساب بتاعك'}</h2>
          <p>{connected ? 'حسابك جاهز لاستقبال وإرسال الرسائل من خلال لوحة التحكم.' : 'امسح رمز QR من تطبيق واتساب عشان تربط حسابك بأمان.'}</p>
          {connected ? <div className="connected-number"><Smartphone size={19} /><div><span>رقم واتساب المتصل</span><strong dir="ltr">{phone || 'لم يرسل الخادم رقم الهاتف'}</strong></div><ShieldCheck size={19} /></div> : <div className="qr-card">{qrSource ? <img src={qrSource} alt="رمز QR لربط واتساب" /> : <div className="qr-placeholder"><div className="qr-grid" /><span>{connecting ? <><LoaderCircle className="spin" size={19} /> جاري تجهيز رمز الربط...</> : <><WifiOff size={19} /> اضغط على الزر لإنشاء رمز الربط</>}</span></div>}</div>}
          {!connected && <button className="button button-primary connect-button" onClick={connect} disabled={connecting}>{connecting ? <LoaderCircle size={17} className="spin" /> : <RefreshCw size={17} />}{qr ? 'تحديث رمز QR' : 'إنشاء رمز QR'}</button>}
        </section>
        <aside className="connection-aside">
          <section className="panel instructions-card"><div className="aside-heading"><span className="instruction-icon"><Smartphone size={18} /></span><div><h2>طريقة الربط</h2><p>مش هتاخد أكتر من دقيقة</p></div></div><ol><li><span>١</span><div><strong>افتح واتساب على موبايلك</strong><p>من القائمة اختار الأجهزة المرتبطة.</p></div></li><li><span>٢</span><div><strong>اضغط على ربط جهاز</strong><p>استخدم كاميرا موبايلك لمسح الرمز.</p></div></li><li><span>٣</span><div><strong>امسح رمز QR</strong><p>هنأكد الاتصال تلقائياً خلال ثواني.</p></div></li></ol></section>
          <section className="security-note"><ShieldCheck size={19} /><div><strong>اتصال آمن ومباشر</strong><p>مفتاح الاتصال محفوظ على السيرفر. وِصال مش بيخزن بيانات تسجيل الدخول بتاعة واتساب.</p></div></section>
          <button className="help-link"><CircleHelp size={17} /> محتاج مساعدة في الربط؟</button>
        </aside>
      </div>}
    </>
  )
}
