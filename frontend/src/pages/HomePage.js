import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🎯', label: 'Real-time Pose Detection' },
  { icon: '🤖', label: 'AI Classification' },
  { icon: '📐', label: 'Angle-Based Accuracy' },
  { icon: '🔄', label: 'Auto Flow Progression' },
  { icon: '💬', label: 'Smart Feedback' },
  { icon: '📊', label: 'Progress Dashboard' },
];

const TECH = [
  { name: 'MediaPipe', desc: 'Pose landmark detection', color: '#3dffa0' },
  { name: 'Random Forest', desc: 'ML pose classification', color: '#9b6dff' },
  { name: 'Flask', desc: 'Modular Python API', color: '#ffb547' },
  { name: 'React.js', desc: 'Reactive frontend UI', color: '#61dafb' },
  { name: 'MongoDB', desc: 'Session data storage', color: '#00ed64' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="hero-eyebrow">
        <span></span>
        AI-Powered Yoga Training
        <span></span>
      </div>

      <h1 className="hero-title">
        Train Smarter.<br />
        <span>Move Better.</span><br />
        Feel Alive.
      </h1>

      <p className="hero-desc">
        Real-time pose detection and AI guidance for your yoga practice.
        Get instant feedback, track your progress, and flow through sequences
        with intelligent auto-advancement.
      </p>

      <div className="hero-ctas">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/trainer')}>
          🧘 Start Training
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/flows')}>
          View Yoga Flows
        </button>
      </div>

      <div className="hero-features">
        {FEATURES.map(f => (
          <div key={f.label} className="hero-feature">
            <span className="hero-feature-icon">{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div style={{ marginTop: 80, width: '100%', maxWidth: 760 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
          Built With
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {TECH.map(t => (
            <div key={t.name} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
