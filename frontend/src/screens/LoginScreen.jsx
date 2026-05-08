import { useState } from 'react';
import { Icon, LogoMark } from '../components/Icon';
import { Button, Input } from '../components/Primitives';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('admin@noeservices.ga');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-grid" style={{
      minHeight: '100vh', display: 'grid',
      gridTemplateColumns: '1fr 1.1fr',
      background: 'var(--paper)',
    }}>
      {/* LEFT - brand panel */}
      <div className="login-brand" style={{
        background: 'linear-gradient(155deg, var(--navy-900) 0%, var(--navy-700) 60%, var(--navy-600) 100%)',
        color: 'white',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -120, top: -80, width: 380, height: 380,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(243,146,0,0.55), rgba(243,146,0,0))',
          filter: 'blur(8px)',
        }}/>
        <div style={{
          position: 'absolute', right: 80, bottom: -160, width: 320, height: 320,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,169,217,0.25), transparent)',
        }}/>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <LogoMark size={52}/>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>NOE Services</div>
            <div style={{ fontSize: 11.5, color: 'var(--navy-300)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Plateforme de stock</div>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange-300)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}>
            Plateforme collaborative
          </div>
          <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            Le stock,<br/>
            <span style={{ color: 'var(--orange-400)' }}>en temps réel,</span><br/>
            partout au Gabon.
          </h1>
          <p style={{ marginTop: 20, fontSize: 15, color: 'var(--navy-200)', lineHeight: 1.55, maxWidth: 420 }}>
            Suivez vos entrées et sorties, recevez des alertes intelligentes,
            et collaborez avec votre équipe depuis n&apos;importe quel appareil.
          </p>

          <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Multi-dépôts', 'Alertes intelligentes', 'Code-barres', 'Multi-utilisateurs'].map(t => (
              <span key={t} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                background: 'rgba(255,255,255,0.08)', color: 'white',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)',
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--navy-300)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--success-500)', animation: 'pulseDot 2s infinite' }}/>
            Système en ligne
          </span>
          <span>·</span>
          <span>3 dépôts synchronisés</span>
        </div>
      </div>

      {/* RIGHT - form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange-600)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Bienvenue
          </div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>
            Connexion à votre espace
          </h2>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-500)' }}>
            Entrez vos identifiants pour accéder au stock.
          </p>

          {error && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: 'var(--danger-100)', border: '1px solid var(--danger-200)',
              borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--danger-700)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="alert" size={15} color="var(--danger-600)"/>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Adresse e-mail" value={email} onChange={setEmail} icon="users" type="email" full size="lg"/>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>Mot de passe</span>
                <a href="#" onClick={(e) => { e.preventDefault(); setError('Contactez votre administrateur pour reinitialiser votre mot de passe.'); }} style={{ fontSize: 12, color: 'var(--navy-700)', textDecoration: 'none', fontWeight: 600 }}>Mot de passe oublie ?</a>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                height: 50, padding: '0 14px',
                background: 'white', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)',
              }}>
                <Icon name="settings" size={16} color="var(--ink-500)"/>
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontWeight: 500 }}/>
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ color: 'var(--ink-500)', display: 'flex' }}>
                  <Icon name={showPwd ? 'eyeOff' : 'eye'} size={16}/>
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-700)', userSelect: 'none', cursor: 'pointer' }}>
              <span onClick={() => setRemember(r => !r)} style={{
                width: 18, height: 18, borderRadius: 5,
                border: `1.5px solid ${remember ? 'var(--navy-700)' : 'var(--ink-300)'}`,
                background: remember ? 'var(--navy-700)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {remember && <Icon name="check" size={12} color="white" strokeWidth={3}/>}
              </span>
              Garder ma session active sur cet appareil
            </label>

            <Button type="submit" variant="primary" size="lg" full iconRight="arrowRight">
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </Button>

            <div style={{ marginTop: 12, padding: 14, background: 'var(--navy-50)', border: '1px solid var(--navy-100)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--navy-100)', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="info" size={14}/>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-800)' }}>Accès démo</div>
                  <div style={{ fontSize: 12, color: 'var(--navy-700)', marginTop: 2 }}>
                    Mot de passe : <strong>noeservices2024</strong>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div style={{ marginTop: 24, fontSize: 12, color: 'var(--ink-500)', textAlign: 'center' }}>
            En vous connectant, vous acceptez les conditions d&apos;utilisation de la plateforme.
          </div>
        </div>
      </div>
    </div>
  );
}
