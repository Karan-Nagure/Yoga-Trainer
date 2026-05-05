import React from 'react';

const POSE_SHORT = {
  mountain_pose: 'Mtn',
  warrior_1: 'W1',
  warrior_2: 'W2',
  tree_pose: 'Tree',
  downward_dog: 'DD',
  chair_pose: 'Chair',
  triangle_pose: 'Tri',
};

export default function FlowSequenceBar({ flowStatus }) {
  if (!flowStatus) return null;

  const { pose_index = 0, total_poses = 0, flow_name, progress_pct = 0 } = flowStatus;

  // We'll reconstruct sequence from status
  const poses = Array.from({ length: total_poses }, (_, i) => ({
    index: i,
    state: i < pose_index ? 'completed' : i === pose_index ? 'current' : 'upcoming',
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{flow_name}</span>
        <span style={{ fontSize: 13, color: 'var(--accent-jade)', fontWeight: 700 }}>
          {Math.round(progress_pct)}%
        </span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 16 }}>
        <div className="progress-fill jade" style={{ width: `${progress_pct}%` }} />
      </div>

      <div className="flow-sequence">
        {poses.map((pose, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className={`flow-connector ${pose.state === 'completed' ? 'done' : ''}`} />
            )}
            <div className="flow-pose-bubble">
              <div className={`bubble ${pose.state}`}>
                {pose.state === 'completed' ? '✓' : i + 1}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Current: </span>
          <span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>
            {flowStatus.current_pose_name || '—'}
          </span>
        </div>
        {flowStatus.next_pose_name && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Next: </span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {flowStatus.next_pose_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
