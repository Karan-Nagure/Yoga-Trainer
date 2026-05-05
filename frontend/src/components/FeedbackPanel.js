import React from 'react';

export default function FeedbackPanel({ feedback = [], accuracy = 0 }) {
  if (!feedback.length) {
    return (
      <div className="empty-state" style={{ padding: 24 }}>
        <span style={{ fontSize: 28 }}>🎯</span>
        <span className="text-sm text-muted">Position yourself in front of the camera</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {feedback.map((item, i) => (
        <div key={i} className="feedback-item">
          <span style={{ fontSize: 16, flexShrink: 0 }}>
            {i === 0
              ? accuracy >= 90 ? '✨' : accuracy >= 80 ? '✅' : accuracy >= 60 ? '⚠️' : '❌'
              : '💡'}
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
