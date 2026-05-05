import { useState, useRef, useCallback, useEffect } from 'react';
import { poseApi, yogaApi, sessionApi } from '../services/api';

export function useYogaTrainer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [poseResult, setPoseResult] = useState(null);
  const [flowState, setFlowState] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsStreaming(false);
  }, []);

  // Capture frame as base64
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.7);
  }, []);

  // Start detection loop
  const startDetection = useCallback((targetPose = null, intervalMs = 200) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (isProcessing) return;
      const frame = captureFrame();
      if (!frame) return;
      setIsProcessing(true);
      try {
        const res = await poseApi.detect(frame, targetPose);
        setPoseResult(res.data);

        // FPS counter
        fpsCounterRef.current.frames++;
        const now = Date.now();
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(fpsCounterRef.current.frames);
          fpsCounterRef.current = { frames: 0, lastTime: now };
        }
      } catch (err) {
        // Silently fail frames
      } finally {
        setIsProcessing(false);
      }
    }, intervalMs);
  }, [captureFrame, isProcessing]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Start a yoga flow
  const startFlow = useCallback(async (flowKey) => {
    try {
      // Create session
      const sessionRes = await sessionApi.create('guest', flowKey);
      const sid = sessionRes.data.session_id;
      setSessionId(sid);

      // Start flow on backend
      const flowRes = await yogaApi.startFlow(flowKey, sid);
      setFlowState(flowRes.data);
      return { sessionId: sid, flowStatus: flowRes.data };
    } catch (err) {
      setError('Failed to start yoga flow');
    }
  }, []);

  // Update flow with current accuracy
  const updateFlow = useCallback(async (accuracy) => {
    if (!sessionId) return null;
    try {
      const res = await yogaApi.updateFlow(sessionId, accuracy);
      setFlowState(res.data.status);
      return res.data;
    } catch (err) {
      return null;
    }
  }, [sessionId]);

  // End session
  const endSession = useCallback(async (completed = false) => {
    if (sessionId) {
      await sessionApi.endSession(sessionId, completed);
      if (sessionId) await yogaApi.endFlow(sessionId);
    }
    stopCamera();
    stopDetection();
    setSessionId(null);
    setFlowState(null);
    setPoseResult(null);
  }, [sessionId, stopCamera, stopDetection]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, [stopCamera, stopDetection]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    poseResult,
    flowState,
    sessionId,
    isProcessing,
    error,
    fps,
    startCamera,
    stopCamera,
    captureFrame,
    startDetection,
    stopDetection,
    startFlow,
    updateFlow,
    endSession,
    setError,
  };
}
