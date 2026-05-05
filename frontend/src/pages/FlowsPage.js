import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { yogaApi, poseApi } from '../services/api';

const DIFFICULTY_COLORS = {
  beginner: 'jade',
  intermediate: 'amber',
  advanced: 'coral',
};

const POSE_EMOJIS = {
  mountain_pose: '🏔️',
  warrior_1: '⚔️',
  warrior_2: '🗡️',
  tree_pose: '🌳',
  downward_dog: '🐕',
  chair_pose: '🪑',
  triangle_pose: '🔺',
};

export default function FlowsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [poses, setPoses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState(null);

  useEffect(() => {
    Promise.all([
      yogaApi.listFlows(),
      poseApi.listPoses(),
    ]).then(([fRes, pRes]) => {
      setFlows(fRes.data);
      setPoses(pRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="spinner" />
          <span style={{ color: 'var(--text-muted)' }}>Loading yoga flows...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">🔄 Yoga Flows</h1>
          <p className="section-subtitle">Guided sequences with auto-progression</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/trainer')}>
          Start Training →
        </button>
      </div>

      {/* Flows Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 48 }}>
        {flows.map(flow => (
          <div
            key={flow.key}
            className="card"
            style={{
              cursor: 'pointer',
              borderColor: selectedFlow?.key === flow.key ? 'var(--accent-jade)' : '',
              background: selectedFlow?.key === flow.key ? 'rgba(61,255,160,0.04)' : '',
            }}
            onClick={() => setSelectedFlow(flow.key === selectedFlow?.key ? null : flow)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                {flow.name}
              </h3>
              <span className={`badge badge-${DIFFICULTY_COLORS[flow.difficulty] || 'jade'}`}>
                {flow.difficulty}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>{flow.description}</p>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--accent-jade)' }}>
                  {flow.pose_count}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Poses</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--accent-violet)' }}>
                  {flow.estimated_duration}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Minutes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--accent-amber)' }}>80</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>% Threshold</div>
              </div>
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={(e) => { e.stopPropagation(); navigate('/trainer'); }}
            >
              Start This Flow →
            </button>
          </div>
        ))}
      </div>

      {/* Pose Library */}
      <div>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ fontSize: 22 }}>📚 Pose Library</h2>
            <p className="section-subtitle">All supported yoga poses</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {Object.entries(poses).map(([key, pose]) => (
            <div key={key} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{POSE_EMOJIS[key] || '🧘'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                {pose.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-jade)', marginBottom: 8, fontStyle: 'italic' }}>
                {pose.sanskrit}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                {pose.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${DIFFICULTY_COLORS[pose.difficulty] || 'jade'}`} style={{ fontSize: 11 }}>
                  {pose.difficulty}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  ⏱ {pose.duration_target}s hold
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginTop: 40, padding: 32, background: 'rgba(155,109,255,0.04)', borderColor: 'rgba(155,109,255,0.2)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--accent-violet)' }}>
          How Auto-Flow Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          {[
            { step: '01', icon: '📷', title: 'Camera Detects', desc: 'MediaPipe extracts 33 body keypoints from your live video' },
            { step: '02', icon: '📐', title: 'Angles Computed', desc: 'Joint angles are calculated from keypoint coordinates' },
            { step: '03', icon: '🤖', title: 'AI Classifies', desc: 'Random Forest model identifies your current pose' },
            { step: '04', icon: '✅', title: 'Accuracy Scored', desc: 'Your angles vs ideal angles give a % accuracy score' },
            { step: '05', icon: '⏱', title: 'Hold Detected', desc: '80%+ accuracy held for 3 seconds auto-advances the flow' },
            { step: '06', icon: '🔄', title: 'Next Pose', desc: 'System guides you to the next pose in the sequence' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--accent-violet)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{s.step}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
