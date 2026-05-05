import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { sessionApi } from '../services/api';

const MOCK_SESSIONS = [
  { date: 'Mon', accuracy: 65, poses: 4 },
  { date: 'Tue', accuracy: 72, poses: 5 },
  { date: 'Wed', accuracy: 68, poses: 3 },
  { date: 'Thu', accuracy: 80, poses: 7 },
  { date: 'Fri', accuracy: 85, poses: 6 },
  { date: 'Sat', accuracy: 78, poses: 7 },
  { date: 'Sun', accuracy: 88, poses: 7 },
];

const MOCK_POSES = [
  { name: 'Mountain', value: 45, color: '#3dffa0' },
  { name: 'Warrior I', value: 28, color: '#9b6dff' },
  { name: 'Warrior II', value: 22, color: '#ffb547' },
  { name: 'Tree', value: 15, color: '#61dafb' },
  { name: 'Chair', value: 18, color: '#ff6b6b' },
];

const CUSTOM_TOOLTIP_STYLE = {
  background: '#16161f',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
  padding: '10px 16px',
  color: '#f0f0f8',
  fontSize: 13,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CUSTOM_TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value}{p.name === 'accuracy' ? '%' : ''}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    Promise.all([
      sessionApi.getStats(),
      sessionApi.getHistory()
    ]).then(([sRes, hRes]) => {
      setStats(sRes.data);
      setSessions(hRes.data);
      if (!hRes.data?.length) setUsingMock(true);
    }).catch(() => {
      setUsingMock(true);
      setStats({ total_sessions: 7, average_accuracy: 76.5, total_poses_completed: 39, completed_sessions: 3 });
    }).finally(() => setLoading(false));
  }, []);

  const chartData = usingMock ? MOCK_SESSIONS : sessions.slice(0, 7).reverse().map((s, i) => ({
    date: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
    accuracy: s.average_accuracy || 0,
    poses: s.total_poses || 0,
  }));

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="spinner" />
          <span style={{ color: 'var(--text-muted)' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">📊 Dashboard</h1>
          <p className="section-subtitle">
            Your yoga performance history
            {usingMock && <span style={{ color: 'var(--accent-amber)', marginLeft: 8 }}>• Demo data</span>}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Sessions', value: stats?.total_sessions || 0, color: 'var(--accent-jade)', icon: '📅' },
          { label: 'Avg Accuracy', value: `${stats?.average_accuracy || 0}%`, color: 'var(--accent-violet)', icon: '🎯' },
          { label: 'Poses Completed', value: stats?.total_poses_completed || 0, color: 'var(--accent-amber)', icon: '✅' },
          { label: 'Flows Finished', value: stats?.completed_sessions || 0, color: '#61dafb', icon: '🏆' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Accuracy Trend */}
        <div className="chart-container" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">📈 Accuracy Trend (Last 7 Days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#555570', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#555570', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="accuracy"
                name="accuracy"
                stroke="var(--accent-jade)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--accent-jade)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Poses per session */}
        <div className="chart-container">
          <div className="card-title">🧘 Poses per Session</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#555570', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555570', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="poses" name="poses" fill="var(--accent-violet)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pose distribution */}
        <div className="chart-container">
          <div className="card-title">🥧 Most Practiced Poses</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={MOCK_POSES}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {MOCK_POSES.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n, p) => [v + ' times', p.payload.name]}
                contentStyle={CUSTOM_TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {MOCK_POSES.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-title">📋 Recent Sessions</div>
        {sessions.length > 0 ? (
          <div className="session-list">
            {sessions.map((s, i) => (
              <div key={i} className="session-item">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {s.flow_name || 'Free Practice'}
                  </div>
                  <div className="session-date">
                    {new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="session-poses">{s.total_poses || 0} poses</div>
                <div className="session-accuracy">{s.average_accuracy || 0}%</div>
                <span className={`badge badge-${s.completed ? 'jade' : 'amber'}`}>
                  {s.completed ? 'Completed' : 'Partial'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <div style={{ fontWeight: 600 }}>No sessions yet</div>
            <div className="empty-state-text">Start your first training session to see history here</div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 28 }}>
        {[
          { emoji: '💡', title: 'Improve Accuracy', tip: 'Focus on aligning joint angles with the ideal values shown in the Joint Analysis panel.' },
          { emoji: '⏱', title: 'Hold Longer', tip: 'Maintain poses for at least 3 seconds with 80%+ accuracy to advance through flows automatically.' },
          { emoji: '📈', title: 'Track Progress', tip: 'Practice daily to see your accuracy improve over time in the dashboard charts.' },
        ].map(t => (
          <div key={t.title} className="card" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{t.emoji}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t.tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
