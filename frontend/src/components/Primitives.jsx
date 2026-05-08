import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { Icon } from './Icon';
import { CAT_BY_ID, stockStatus } from '../data';

// ---------- Button ----------
export function Button({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, disabled, type = 'button', full, className = '' }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: 13, gap: 6, ic: 16 },
    md: { h: 40, px: 16, fs: 14, gap: 8, ic: 18 },
    lg: { h: 48, px: 20, fs: 15, gap: 10, ic: 20 },
  };
  const s = sizes[size];
  const variants = {
    primary: { bg: 'var(--navy-700)', color: 'white', border: 'transparent', hover: 'var(--navy-800)' },
    accent:  { bg: 'var(--orange-500)', color: 'white', border: 'transparent', hover: 'var(--orange-600)' },
    secondary: { bg: 'white', color: 'var(--ink-800)', border: 'var(--ink-200)', hover: 'var(--ink-50)' },
    ghost:   { bg: 'transparent', color: 'var(--ink-700)', border: 'transparent', hover: 'var(--ink-100)' },
    danger:  { bg: 'white', color: 'var(--danger-700)', border: 'var(--danger-100)', hover: 'var(--danger-100)' },
    dark:    { bg: 'var(--navy-900)', color: 'white', border: 'transparent', hover: 'var(--navy-800)' },
  };
  const v = variants[variant];
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`focus-ring ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
        height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600, letterSpacing: '-0.01em',
        background: hov && !disabled ? v.hover : v.bg, color: v.color,
        border: `1px solid ${v.border === 'transparent' ? 'transparent' : v.border}`,
        borderRadius: 'var(--r-md)',
        transition: 'all 0.15s ease', whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : 'auto',
        boxShadow: variant === 'primary' || variant === 'accent' || variant === 'dark' ? '0 1px 2px rgba(14,46,84,0.15)' : 'none',
      }}>
      {icon && <Icon name={icon} size={s.ic}/>}
      {children}
      {iconRight && <Icon name={iconRight} size={s.ic}/>}
    </button>
  );
}

// ---------- Card ----------
export function Card({ children, className = '', style, padding = 'md', hover, onClick }) {
  const pads = { none: 0, sm: 'var(--gap-4)', md: 'var(--gap-6)', lg: 'var(--gap-8)' };
  const [h, setH] = useState(false);
  return (
    <div className={className}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid var(--ink-200)',
        borderRadius: 'var(--r-lg)',
        padding: pads[padding],
        boxShadow: hover && h ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        transform: hover && h ? 'translateY(-1px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>
      {children}
    </div>
  );
}

// ---------- Badge ----------
export function Badge({ children, tone = 'neutral', size = 'sm', icon, dot }) {
  const tones = {
    neutral: { bg: 'var(--ink-100)',     fg: 'var(--ink-700)',    bd: 'var(--ink-200)' },
    navy:    { bg: 'var(--navy-100)',    fg: 'var(--navy-800)',   bd: 'var(--navy-200)' },
    orange:  { bg: 'var(--orange-100)',  fg: 'var(--orange-700)', bd: 'var(--orange-200)' },
    success: { bg: 'var(--success-100)', fg: 'var(--success-700)',bd: '#BFEDD2' },
    warn:    { bg: 'var(--warn-100)',    fg: 'var(--warn-700)',   bd: '#FFD9A6' },
    danger:  { bg: 'var(--danger-100)',  fg: 'var(--danger-700)', bd: '#FAC4CB' },
  };
  const t = tones[tone];
  const sizes = { xs: { h: 18, px: 6, fs: 10.5 }, sm: { h: 22, px: 8, fs: 11.5 }, md: { h: 26, px: 10, fs: 12.5 } };
  const sz = sizes[size];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, fontWeight: 600,
      letterSpacing: '0.01em',
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      borderRadius: 999, whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.fg }}/>}
      {icon && <Icon name={icon} size={11} strokeWidth={2.2}/>}
      {children}
    </span>
  );
}

// ---------- Avatar ----------
export function Avatar({ initials, color = 'var(--navy-700)', size = 32, online }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: 999,
        background: color, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 700, letterSpacing: '0.02em',
      }}>{initials}</div>
      {online != null && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.32, height: size * 0.32, borderRadius: 999,
          background: online ? 'var(--success-500)' : 'var(--ink-300)',
          border: '2px solid white',
        }}/>
      )}
    </div>
  );
}

// ---------- Input ----------
export function Input({ label, hint, value, onChange, placeholder, type = 'text', icon, suffix, error, full, autoFocus, size = 'md' }) {
  const sizes = { sm: { h: 36, fs: 13, px: 10 }, md: { h: 42, fs: 14, px: 12 }, lg: { h: 50, fs: 15, px: 14 } };
  const s = sizes[size];
  const [foc, setFoc] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, width: full ? '100%' : 'auto' }}>
      {label && <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>{label}</span>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: s.h, padding: `0 ${s.px}px`,
        background: 'white',
        border: `1px solid ${error ? 'var(--danger-500)' : foc ? 'var(--navy-500)' : 'var(--ink-200)'}`,
        borderRadius: 'var(--r-md)',
        boxShadow: foc ? '0 0 0 3px rgba(27,79,140,0.12)' : 'none',
        transition: 'all 0.15s ease',
      }}>
        {icon && <Icon name={icon} size={16} color="var(--ink-500)"/>}
        <input type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder} autoFocus={autoFocus}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: s.fs, color: 'var(--ink-900)', fontWeight: 500,
            minWidth: 0,
          }}/>
        {suffix && <span style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500 }}>{suffix}</span>}
      </div>
      {hint && <span style={{ fontSize: 12, color: error ? 'var(--danger-700)' : 'var(--ink-500)' }}>{hint}</span>}
    </label>
  );
}

// ---------- FilterChip ----------
export function FilterChip({ label, value, options, onChange, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const sel = options.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative', zIndex: open ? 50 : 'auto' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px',
          background: open ? 'var(--ink-100)' : 'white', border: '1px solid var(--ink-200)',
          borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, color: 'var(--ink-800)',
          transition: 'background 0.15s',
        }}>
        {icon && <Icon name={icon} size={14} color="var(--ink-500)"/>}
        <span style={{ color: 'var(--ink-500)' }}>{label}</span>
        <span style={{ color: 'var(--ink-900)' }}>{sel?.label}</span>
        <Icon name="chevronDown" size={14}/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
          background: 'white', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lg)', padding: 4, minWidth: 200, maxHeight: 320, overflowY: 'auto',
        }}>
          {options.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '8px 10px', textAlign: 'left',
                background: o.value === value ? 'var(--navy-50)' : 'transparent',
                color: o.value === value ? 'var(--navy-800)' : 'var(--ink-800)',
                borderRadius: 8, fontSize: 13, fontWeight: 500,
              }}
              onMouseEnter={(e) => { if (o.value !== value) e.currentTarget.style.background = 'var(--ink-50)'; }}
              onMouseLeave={(e) => { if (o.value !== value) e.currentTarget.style.background = 'transparent'; }}>
              {o.label}
              {o.value === value && <span style={{ marginLeft: 'auto' }}><Icon name="check" size={14} color="var(--navy-700)"/></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- ProductImage ----------
export function ProductImage({ product, size = 56 }) {
  const cat = CAT_BY_ID[product.cat] || product.category || { color: '#64748B', icon: 'box' };
  const initials = (product.name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: 'var(--r-sm)',
      background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}11)`,
      border: `1px solid ${cat.color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: cat.color, fontWeight: 700, fontSize: size * 0.32,
      letterSpacing: '0.02em',
      position: 'relative', overflow: 'hidden',
    }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{initials}</span>
      <Icon name={cat.icon} size={size * 0.5} color={cat.color} />
    </div>
  );
}

// ---------- StockPill ----------
export function StockPill({ product, size = 'sm' }) {
  const status = stockStatus(product);
  const cfg = {
    rupture: { tone: 'danger',  label: 'Rupture',     icon: 'alert' },
    low:     { tone: 'warn',    label: 'Stock faible',icon: 'alert' },
    ok:      { tone: 'success', label: 'En stock',    icon: 'check' },
  }[status];
  return <Badge tone={cfg.tone} size={size} icon={cfg.icon} dot>{cfg.label}</Badge>;
}

// ---------- Placeholder ----------
export function Placeholder({ icon = 'box', title, subtitle, children }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center', gap: 12,
      background: 'var(--ink-50)', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-lg)',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 999, background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>
        <Icon name={icon} size={26}/>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-800)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--ink-500)', maxWidth: 320 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

// ---------- KPITile ----------
export function KPITile({ label, value, sublabel, trend, icon, accent = 'var(--navy-700)', big }) {
  return (
    <Card padding="none" style={{ padding: big ? 24 : 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ marginTop: 8, fontSize: big ? 32 : 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>
            {value}
          </div>
          {sublabel && <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ink-500)' }}>{sublabel}</div>}
        </div>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r-md)',
            background: `${accent}15`, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name={icon} size={20}/>
          </div>
        )}
      </div>
      {trend != null && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
          color: trend > 0 ? 'var(--success-700)' : trend < 0 ? 'var(--danger-700)' : 'var(--ink-500)' }}>
          <Icon name={trend > 0 ? 'arrowUp' : trend < 0 ? 'arrowDown' : 'sort'} size={14} strokeWidth={2.5}/>
          {trend > 0 ? '+' : ''}{trend}% vs 30j
        </div>
      )}
    </Card>
  );
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, subtitle, children, footer, width = 560 }) {
  if (!open) return null;
  return (
    <div className="anim-fade" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'white', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: width,
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ink-150)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
            {subtitle && <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-500)' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--ink-500)' }}>
            <Icon name="x" size={18}/>
          </button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--ink-150)', background: 'var(--ink-50)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Toast ----------
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), toast.duration || 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} className="anim-fade" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            background: 'var(--navy-900)', color: 'white',
            borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)',
            fontSize: 13.5, fontWeight: 500, maxWidth: 360, pointerEvents: 'auto',
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: 999,
              background: t.tone === 'success' ? 'var(--success-500)' : t.tone === 'danger' ? 'var(--danger-500)' : 'var(--orange-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={t.tone === 'danger' ? 'alert' : 'check'} size={14} strokeWidth={2.5}/>
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
