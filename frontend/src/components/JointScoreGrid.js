import React from 'react';

const JOINT_LABELS = {
  left_knee: 'L Knee',
  right_knee: 'R Knee',
  left_hip: 'L Hip',
  right_hip: 'R Hip',
  left_elbow: 'L Elbow',
  right_elbow: 'R Elbow',
  left_shoulder: 'L Shoulder',
  right_shoulder: 'R Shoulder',
  left_ankle: 'L Ankle',
  right_ankle: 'R Ankle',
};

function scoreColor(score) {
  if (score >= 80) return 'var(--accent-jade)';
  if (score >= 60) return 'var(--accent-amber)';
  return 'var(--accent-coral)';
}

export default function JointScoreGrid({ jointAccuracy = {} }) {
  const entries = Object.entries(jointAccuracy);
  if (!entries.length) return null;

  return (
    <div className="joint-grid">
      {entries.map(([joint, data]) => (
        <div key={joint} className="joint-item">
          <span className="joint-name">{JOINT_LABELS[joint] || joint}</span>
          <div className="joint-angles">
            <span className="joint-detected" style={{ color: scoreColor(data.score) }}>
              {data.detected}°
            </span>
            <span className="joint-ideal">/{data.ideal}°</span>
          </div>
          <div className="progress-bar" style={{ height: 4, marginTop: 4 }}>
            <div
              className="progress-fill"
              style={{
                width: `${data.score}%`,
                background: scoreColor(data.score),
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
