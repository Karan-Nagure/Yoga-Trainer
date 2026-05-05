import React from 'react';

export default function WebcamView({ videoRef, canvasRef, isStreaming, poseResult, fps }) {
  const detected = poseResult?.pose_detected;
  const poseName = poseResult?.classified_pose?.replace(/_/g, ' ')
    ?.replace(/\b\w/g, c => c.toUpperCase()) || '';
  const accuracy = poseResult?.accuracy || 0;
  const confidence = poseResult?.confidence || 0;

  const accuracyColor =
    accuracy >= 80 ? '#3dffa0' : accuracy >= 60 ? '#ffb547' : '#ff6b6b';

  return (
    <div className="webcam-wrapper">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {isStreaming ? (
        <video
          ref={videoRef}
          className="webcam-video"
          autoPlay
          playsInline
          muted
        />
      ) : (
        <div className="webcam-placeholder">
          <span className="webcam-placeholder-icon">📷</span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Camera not started</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Click "Start Camera" to begin
          </span>
        </div>
      )}

      {isStreaming && (
        <div className="webcam-overlay">
          {/* LIVE badge */}
          <div className="webcam-badge">
            <span style={{
              display: 'inline-block',
              width: 7, height: 7,
              borderRadius: '50%',
              background: '#3dffa0',
              marginRight: 6,
              animation: 'pulse 1.5s infinite',
              boxShadow: '0 0 6px #3dffa0'
            }} />
            LIVE
          </div>

          {/* FPS */}
          {fps > 0 && (
            <div className="fps-badge">{fps} FPS</div>
          )}

          {/* Pose detected info */}
          {detected && poseName && (
            <div className="pose-detected-badge">
              <div className="pose-detected-name">{poseName}</div>
              <div className="pose-detected-conf">{confidence}% confidence</div>
            </div>
          )}

          {/* Accuracy badge */}
          {detected && accuracy > 0 && (
            <div className="accuracy-badge-corner">
              <div className="accuracy-badge-value" style={{ color: accuracyColor }}>
                {Math.round(accuracy)}
              </div>
              <div className="accuracy-badge-pct">%</div>
            </div>
          )}

          {!detected && isStreaming && (
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 14,
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              👤 No pose detected<br />
              <span style={{ fontSize: 12 }}>Stand in frame fully</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
