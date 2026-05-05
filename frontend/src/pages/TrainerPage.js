import React, { useState, useEffect, useCallback, useRef } from 'react';
import { poseApi, sessionApi, yogaApi } from '../services/api';
import WebcamView from '../components/WebcamView';
import AccuracyRing from '../components/AccuracyRing';
import FeedbackPanel from '../components/FeedbackPanel';
import JointScoreGrid from '../components/JointScoreGrid';
import FlowSequenceBar from '../components/FlowSequenceBar';
import HoldTimer from '../components/HoldTimer';
import Toast from '../components/Toast';

const POSES = [
  { key: 'mountain_pose', name: 'Mountain Pose', emoji: '🏔️' },
  { key: 'warrior_1', name: 'Warrior I', emoji: '⚔️' },
  { key: 'warrior_2', name: 'Warrior II', emoji: '🗡️' },
  { key: 'tree_pose', name: 'Tree Pose', emoji: '🌳' },
  { key: 'downward_dog', name: 'Downward Dog', emoji: '🐕' },
  { key: 'chair_pose', name: 'Chair Pose', emoji: '🪑' },
  { key: 'triangle_pose', name: 'Triangle Pose', emoji: '🔺' },
];

const FLOWS = [
  { key: 'beginner_flow', name: 'Beginner Morning Flow', poses: 7, level: 'Beginner', color: '#3dffa0' },
  { key: 'strength_flow', name: 'Strength Builder', poses: 7, level: 'Intermediate', color: '#9b6dff' },
  { key: 'balance_flow', name: 'Balance & Focus', poses: 7, level: 'Intermediate', color: '#ffb547' },
];

export default function TrainerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [mode, setMode] = useState('idle'); // idle | freepose | flow
  const [isStreaming, setIsStreaming] = useState(false);
  const [poseResult, setPoseResult] = useState(null);
  const [targetPose, setTargetPose] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [flowStatus, setFlowStatus] = useState(null);
  const [flowAction, setFlowAction] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [fps, setFps] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [tab, setTab] = useState('poses'); // poses | flows
  const fpsRef = useRef({ count: 0, last: Date.now() });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  // Camera control
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }, audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setIsStreaming(true);
    } catch (e) {
      showToast('Camera access denied. Please allow camera permissions.', 'warning');
    }
  }, [showToast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsStreaming(false);
    setMode('idle');
    setPoseResult(null);
    setFlowStatus(null);
    setFlowAction(null);
  }, []);

  const captureFrame = useCallback(() => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext('2d').drawImage(v, 0, 0);
    return c.toDataURL('image/jpeg', 0.7);
  }, []);

  // Core detection loop
  const startDetectionLoop = useCallback((getPose, onResult, intervalMs = 250) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (isProcessingRef.current) return;
      const frame = captureFrame();
      if (!frame) return;
      isProcessingRef.current = true;
      try {
        const res = await poseApi.detect(frame, getPose());
        onResult(res.data);
        fpsRef.current.count++;
        const now = Date.now();
        if (now - fpsRef.current.last >= 1000) {
          setFps(fpsRef.current.count);
          fpsRef.current = { count: 0, last: now };
        }
      } catch (_) {}
      finally { isProcessingRef.current = false; }
    }, intervalMs);
  }, [captureFrame]);

  // Free pose mode
  const startFreePose = useCallback(async (poseKey) => {
    setTargetPose(poseKey);
    setMode('freepose');
    const s = await sessionApi.create('guest', null).catch(() => ({ data: { session_id: null } }));
    setSessionId(s.data.session_id);
    startDetectionLoop(() => poseKey, (result) => {
      setPoseResult(result);
    });
  }, [startDetectionLoop]);

  // Flow mode
  const startFlow = useCallback(async (flowKey) => {
    setSelectedFlow(flowKey);
    setMode('flow');
    const s = await sessionApi.create('guest', flowKey).catch(() => ({ data: { session_id: 'local' } }));
    const sid = s.data.session_id || 'local';
    setSessionId(sid);

    const flowRes = await yogaApi.startFlow(flowKey, sid).catch(() => null);
    if (flowRes) setFlowStatus(flowRes.data);

    let currentFlowStatus = flowRes?.data;

    startDetectionLoop(
      () => currentFlowStatus?.current_pose_key || null,
      async (result) => {
        setPoseResult(result);
        if (!result.pose_detected) return;

        const accuracy = result.accuracy || 0;
        const updateRes = await yogaApi.updateFlow(sid, accuracy).catch(() => null);
        if (!updateRes) return;

        const { action, message, status } = updateRes.data;
        currentFlowStatus = status;
        setFlowStatus(status);
        setFlowAction({ action, message, hold_progress: updateRes.data.hold_progress || 0, seconds_held: updateRes.data.seconds_held || 0 });

        if (action === 'advance') {
          showToast(message, 'advance');
        } else if (action === 'finished') {
          showToast('🎉 Flow Complete! Amazing work!', 'success');
          clearInterval(intervalRef.current);
          setMode('completed');
          await sessionApi.endSession(sid, true).catch(() => {});
        }
      }
    );
  }, [startDetectionLoop, showToast]);

  const stopSession = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionId) await sessionApi.endSession(sessionId, false).catch(() => {});
    stopCamera();
    setSessionId(null);
    setTargetPose(null);
    setSelectedFlow(null);
    setFlowStatus(null);
    setFlowAction(null);
    setPoseResult(null);
  }, [sessionId, stopCamera]);

  useEffect(() => () => {
    stopCamera();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [stopCamera]);

  const accuracy = poseResult?.accuracy || 0;
  const jointAccuracy = poseResult?.joint_accuracy || {};
  const feedback = poseResult?.feedback || [];
  const isActive = mode !== 'idle' && mode !== 'completed';

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">🧘 Yoga Trainer</h1>
          <p className="section-subtitle">Real-time AI-powered pose detection and guidance</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isStreaming ? (
            <button className="btn btn-primary" onClick={startCamera}>📷 Start Camera</button>
          ) : (
            <button className="btn btn-danger" onClick={stopSession}>⏹ Stop</button>
          )}
        </div>
      </div>

      <div className="trainer-layout">
        {/* LEFT: Webcam + accuracy */}
        <div>
          <WebcamView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isStreaming={isStreaming}
            poseResult={poseResult}
            fps={fps}
          />

          {/* Accuracy + feedback below cam */}
          {isActive && (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16 }}>
              <AccuracyRing accuracy={accuracy} size={110} />
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  AI Feedback
                </div>
                <FeedbackPanel feedback={feedback} accuracy={accuracy} />
              </div>
            </div>
          )}

          {/* Flow hold timer */}
          {mode === 'flow' && flowAction && (
            <div className="card" style={{ marginTop: 16, padding: 16 }}>
              <HoldTimer
                holdProgress={flowAction.hold_progress || 0}
                secondsHeld={flowAction.seconds_held || 0}
                targetSeconds={3}
                action={flowAction.action}
              />
            </div>
          )}

          {/* Flow sequence */}
          {mode === 'flow' && flowStatus && (
            <div className="card" style={{ marginTop: 16, padding: 20 }}>
              <FlowSequenceBar flowStatus={flowStatus} />
            </div>
          )}

          {/* Completed state */}
          {mode === 'completed' && (
            <div className="card" style={{ marginTop: 16, textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                Flow Complete!
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Amazing job finishing your yoga flow
              </div>
              <button className="btn btn-primary" onClick={() => { setMode('idle'); setFlowStatus(null); }}>
                Start Another Flow
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="trainer-sidebar">
          {/* Joint breakdown */}
          {isActive && Object.keys(jointAccuracy).length > 0 && (
            <div className="card">
              <div className="card-title">Joint Analysis</div>
              <JointScoreGrid jointAccuracy={jointAccuracy} />
            </div>
          )}

          {/* Mode selector */}
          {!isActive && isStreaming && (
            <>
              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 10, padding: 4 }}>
                {['poses', 'flows'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      fontWeight: 600,
                      background: tab === t ? 'var(--accent-jade)' : 'transparent',
                      color: tab === t ? '#0a0a0f' : 'var(--text-muted)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t === 'poses' ? '🎯 Single Pose' : '🔄 Yoga Flow'}
                  </button>
                ))}
              </div>

              {tab === 'poses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0' }}>
                    Select a pose to practice
                  </div>
                  {POSES.map(p => (
                    <button
                      key={p.key}
                      className="card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        border: targetPose === p.key ? '1px solid var(--accent-jade)' : '1px solid var(--border)',
                        background: targetPose === p.key ? 'rgba(61,255,160,0.06)' : 'var(--bg-card)',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      onClick={() => startFreePose(p.key)}
                    >
                      <span style={{ fontSize: 22 }}>{p.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'flows' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0' }}>
                    Choose a flow sequence
                  </div>
                  {FLOWS.map(f => (
                    <div
                      key={f.key}
                      className="flow-card"
                      style={{ borderColor: selectedFlow === f.key ? f.color : '' }}
                      onClick={() => startFlow(f.key)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div className="flow-card-title">{f.name}</div>
                        <span className="badge" style={{
                          background: `${f.color}18`,
                          color: f.color,
                          border: `1px solid ${f.color}33`
                        }}>
                          {f.level}
                        </span>
                      </div>
                      <div className="flow-card-meta">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⚡ {f.poses} poses</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ ~20 min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Not streaming prompt */}
          {!isStreaming && (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Start Your Session
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                Enable your camera to begin pose detection
              </div>
              <button className="btn btn-primary w-full" onClick={startCamera}>
                Start Camera
              </button>
            </div>
          )}

          {/* Current mode info */}
          {mode === 'freepose' && targetPose && (
            <div className="card" style={{ background: 'rgba(61,255,160,0.04)', borderColor: 'var(--border-accent)' }}>
              <div style={{ fontSize: 12, color: 'var(--accent-jade)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Target Pose
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                {POSES.find(p => p.key === targetPose)?.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Match your body to the target angles
              </div>
              <button className="btn btn-secondary btn-sm w-full" onClick={stopSession}>
                Change Pose
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toasts */}
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />
      ))}
    </div>
  );
}
