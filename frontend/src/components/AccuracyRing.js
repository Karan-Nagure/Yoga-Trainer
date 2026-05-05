import React from 'react';

export default function AccuracyRing({ accuracy = 0, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(accuracy, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  const color = accuracy >= 80
    ? 'var(--accent-jade)'
    : accuracy >= 60
    ? 'var(--accent-amber)'
    : 'var(--accent-coral)';

  return (
    <div className="accuracy-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="accuracy-ring-text">
        <div className="accuracy-value" style={{ color, fontSize: size < 100 ? 20 : 28 }}>
          {Math.round(progress)}
        </div>
        <div className="accuracy-label">%</div>
      </div>
    </div>
  );
}
