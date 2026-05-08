import { useState, useRef } from 'react';
import { num } from '../data';

export function FlowChart({ data, height = 220 }) {
  const W = 800;
  const H = height;
  const pad = { l: 36, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const max = Math.max(...data.flatMap(d => [d.entrees, d.sorties])) * 1.15;
  const x = (i) => pad.l + (i / (data.length - 1)) * innerW;
  const y = (v) => pad.t + innerH - (v / max) * innerH;

  const lineFor = (key) => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');
  const areaFor = (key) => `M ${x(0)} ${pad.t + innerH} ${data.map((d, i) => `L ${x(i)} ${y(d[key])}`).join(' ')} L ${x(data.length-1)} ${pad.t + innerH} Z`;

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i));

  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((px - pad.l) / innerW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) setHover(idx); else setHover(null);
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block' }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B4F8C" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#1B4F8C" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F39200" stopOpacity="0.20"/>
            <stop offset="100%" stopColor="#F39200" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {tickValues.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={y(v)} x2={W - pad.r} y2={y(v)} stroke="#ECEFF4" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 4'}/>
            <text x={pad.l - 8} y={y(v) + 4} fontSize="10" fill="#94A3B8" textAnchor="end" fontFamily="JetBrains Mono">{v}</text>
          </g>
        ))}

        {[0, 7, 14, 21, 29].map(i => (
          <text key={i} x={x(i)} y={H - 8} fontSize="10" fill="#94A3B8" textAnchor="middle" fontFamily="JetBrains Mono">
            J{i + 1}
          </text>
        ))}

        <path d={areaFor('entrees')} fill="url(#gradIn)"/>
        <path d={areaFor('sorties')} fill="url(#gradOut)"/>
        <path d={lineFor('entrees')} fill="none" stroke="#1B4F8C" strokeWidth="2" strokeLinejoin="round"/>
        <path d={lineFor('sorties')} fill="none" stroke="#F39200" strokeWidth="2" strokeLinejoin="round"/>

        {hover != null && (
          <g>
            <line x1={x(hover)} y1={pad.t} x2={x(hover)} y2={pad.t + innerH} stroke="#1B4F8C" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
            <circle cx={x(hover)} cy={y(data[hover].entrees)} r="4" fill="white" stroke="#1B4F8C" strokeWidth="2"/>
            <circle cx={x(hover)} cy={y(data[hover].sorties)} r="4" fill="white" stroke="#F39200" strokeWidth="2"/>
          </g>
        )}
      </svg>

      {hover != null && (
        <div style={{
          position: 'absolute',
          left: `${(x(hover) / W) * 100}%`,
          top: 0, transform: 'translateX(-50%) translateY(-100%)',
          background: 'var(--navy-900)', color: 'white',
          padding: '8px 12px', borderRadius: 8, fontSize: 12,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Jour {hover + 1}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 2, background: '#7FA9D9' }}/>
            Entrées : <strong>{data[hover].entrees}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 2, background: '#FFA92E' }}/>
            Sorties : <strong>{data[hover].sorties}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export function DonutChart({ data, size = 180, thickness = 28 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;

  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-100)" strokeWidth={thickness}/>
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * C;
        const offset = -acc * C;
        acc += frac;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"/>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="var(--ink-500)" fontWeight="600">Total</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="20" fill="var(--ink-900)" fontWeight="700">{num(total)}</text>
    </svg>
  );
}

export function TopMoversBars({ data }) {
  const max = Math.max(...data.flatMap(d => [d.in, d.out]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((d) => (
        <div key={d.sku} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-800)', letterSpacing: '-0.005em' }}>{d.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{d.sku}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 60, fontSize: 11, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: 'var(--navy-700)', borderRadius: 999 }}/> Entrées
              </div>
              <div style={{ flex: 1, height: 8, background: 'var(--navy-50)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(d.in / max) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--navy-600), var(--navy-700))', borderRadius: 4 }}/>
              </div>
              <div style={{ width: 40, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{d.in}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 60, fontSize: 11, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: 'var(--orange-500)', borderRadius: 999 }}/> Sorties
              </div>
              <div style={{ flex: 1, height: 8, background: 'var(--orange-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(d.out / max) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--orange-400), var(--orange-500))', borderRadius: 4 }}/>
              </div>
              <div style={{ width: 40, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{d.out}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ data, color = 'var(--navy-700)', height = 32, width = 80 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / r) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}
