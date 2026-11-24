import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, MessageSquareText, Sparkles } from 'lucide-react'
import { useAuth } from '../context/auth'
import { ErrorMessage } from '../components/Feedback'
import { errorMessage } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response ? errorMessage(requestError) : requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" dir="rtl">
      <section className="login-form-side">
        <div className="login-brand"><span className="brand-icon"><MessageSquareText size={23} /></span><strong>وِصال</strong></div>
        <div className="login-form-wrap">
          <div className="login-eyebrow"><Sparkles size={15} /> أهلاً بيك تاني</div>
          <h1>سجّل دخولك لحسابك</h1>
          <p className="login-subtitle">كمّل من مكان ما وقفت، وخلي تواصلك مع عملاءك أسهل.</p>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <div className="label-row"><label htmlFor="password">كلمة المرور</label><span className="login-help">محتاج مساعدة؟ تواصل مع مسؤول الحساب</span></div>
            <div className="password-field">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <ErrorMessage>{error}</ErrorMessage>
            <button type="submit" className="button button-primary login-submit" disabled={loading}>{loading ? 'جاري تسجيل الدخول...' : <>تسجيل الدخول <ArrowLeft size={17} /></>}</button>
          </form>
          <div className="login-note">للتجربة: <b>test@example.com</b> <span>·</span> كلمة المرور: <b>password</b></div>
          <p className="signup-line">لإضافة حساب جديد، تواصل مع مسؤول مساحة العمل.</p>
        </div>
        <span className="login-copyright">© ٢٠٢٦ وِصال. كل الحقوق محفوظة.</span>
      </section>
      <aside className="login-visual">
        <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
        <div className="visual-content">
          <span className="visual-tag"><span /> تواصل أذكى، نمو أسرع</span>
          <h2>كل محادثاتك<br />في <em>مكان واحد.</em></h2>
          <p>من أول رسالة لحد ما العميل يبقى من أكبر محبّين علامتك التجارية — إحنا معاك في كل خطوة.</p>
          <div className="visual-stat"><div className="mini-avatars"><i>م</i><i>س</i><i>ع</i><i>+</i></div><div><strong>تواصل أوضح، متابعة أسهل</strong><span>كل تفاصيل علاقتك مع العميل في مكان واحد</span></div></div>
          <div className="visual-message"><span className="message-avatar">ن</span><div><small>نهى أحمد · عميلة جديدة</small><p>شكراً جداً، الطلب وصل بسرعة 💚</p><span>تم الرد خلال دقيقتين <i /></span></div></div>
        </div>
        <div className="visual-footer"><span>محادثات</span><span>علاقات</span><span>نتائج</span></div>
      </aside>
    </div>
  )
}
