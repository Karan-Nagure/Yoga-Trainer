import React from 'react';

export default function HoldTimer({ holdProgress = 0, secondsHeld = 0, targetSeconds = 3, action = 'incorrect' }) {
  const pct = Math.min(holdProgress * 100, 100);
  const isHolding = action === 'holding';
  const isAdvancing = action === 'advance';

  return (
    <div className="hold-timer">
      <div className="hold-timer-label">
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: isHolding
            ? 'var(--accent-jade)'
            : isAdvancing
            ? 'var(--accent-violet)'
            : 'var(--text-muted)'
        }}>
          {isAdvancing ? '🎉 Pose Complete!' : isHolding ? '⏱ Hold Pose' : '🔄 Adjust Pose'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {secondsHeld.toFixed(1)}s / {targetSeconds}s
        </span>
      </div>
      <div className="hold-timer-bar">
        <div
          className="hold-timer-fill"
          style={{
            width: `${pct}%`,
            background: isAdvancing
              ? 'var(--accent-violet)'
              : isHolding
              ? 'linear-gradient(90deg, var(--accent-jade), var(--accent-violet))'
              : 'var(--text-muted)',
          }}
        />
      </div>
    </div>
  );
}
