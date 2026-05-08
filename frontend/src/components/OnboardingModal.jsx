import { useState, useEffect } from 'react';
import { Icon, LogoMark } from './Icon';

const STORAGE_KEY = 'noe_onboarding_seen';

export function OnboardingModal({ onOpenCadrage }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  function handleGoToForm() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onOpenCadrage();
  }

  if (!visible) return null;

  return (
    <div className="anim-fade" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(11,18,32,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 640,
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        {/* Badge bandeau */}
        <div style={{
          background: 'var(--orange-100)', borderBottom: '1px solid var(--orange-200)',
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 999,
            background: 'var(--orange-500)', color: 'white',
            fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            MAQUETTE
          </span>
          <span style={{ fontSize: 12, color: 'var(--orange-700)', fontWeight: 500 }}>
            Version de démonstration
          </span>
        </div>

        {/* Header logos */}
        <div style={{
          padding: '24px 28px 0', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <LogoMark size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Noé Services</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Moanda, Gabon</div>
          </div>
          <div style={{ height: 28, width: 1, background: 'var(--ink-200)', margin: '0 4px' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>BSG Technology</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Conception & développement</div>
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '20px 28px 28px', overflowY: 'auto', flex: 1 }}>
          <h2 style={{
            margin: '0 0 6px', fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.02em', color: 'var(--ink-900)',
          }}>
            Bienvenue sur la plateforme Noé Services
          </h2>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 20,
          }}>
            Version maquette · Préversion non finale
          </div>

          <div style={{
            fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.7,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <p style={{ margin: 0 }}>
              Cher utilisateur, l'application que vous découvrez est actuellement une <strong style={{ color: 'var(--ink-900)' }}>maquette de démonstration</strong>. Elle illustre l'apparence et le fonctionnement général de la future plateforme, mais ne reflète pas encore l'intégralité des besoins métier de Noé Services.
            </p>
            <p style={{ margin: 0 }}>
              Pour que nous puissions construire un outil <strong style={{ color: 'var(--ink-900)' }}>parfaitement adapté à votre activité réelle</strong>, nous invitons l'équipe Noé Services à remplir le <strong style={{ color: 'var(--navy-700)' }}>questionnaire de cadrage</strong> accessible ci-dessous. Vos réponses guideront chaque décision de conception.
            </p>
          </div>

          {/* Encart durée */}
          <div style={{
            marginTop: 20, padding: '14px 16px',
            background: 'var(--navy-50)', border: '1px solid var(--navy-100)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
              background: 'var(--navy-100)', color: 'var(--navy-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="history" size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-800)' }}>
                Le questionnaire prend environ 30 à 45 minutes.
              </div>
              <div style={{ fontSize: 12, color: 'var(--navy-600)', marginTop: 2 }}>
                Vous pouvez le compléter en plusieurs fois.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--ink-150)',
          background: 'var(--ink-50)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          flexWrap: 'wrap',
        }}>
          <button onClick={handleDismiss} style={{
            height: 42, padding: '0 20px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--ink-200)', background: 'white',
            fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            Continuer la visite de la maquette
          </button>
          <button onClick={handleGoToForm} style={{
            height: 42, padding: '0 20px', borderRadius: 'var(--r-md)',
            border: 'none', background: 'var(--navy-700)', color: 'white',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-800)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-700)'}>
            Accéder au questionnaire
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function reopenOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}
