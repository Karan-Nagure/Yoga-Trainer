import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Pose APIs
export const poseApi = {
  detect: (image, targetPose = null) =>
    api.post('/pose/detect', { image, target_pose: targetPose }),

  listPoses: () => api.get('/pose/poses'),

  getPoseDetail: (poseKey) => api.get(`/pose/poses/${poseKey}`),
};

// Session APIs
export const sessionApi = {
  create: (userId = 'guest', flowName = null) =>
    api.post('/session/create', { user_id: userId, flow_name: flowName }),

  recordPose: (sessionId, poseData) =>
    api.post(`/session/${sessionId}/record`, poseData),

  endSession: (sessionId, completed = false) =>
    api.post(`/session/${sessionId}/end`, { completed }),

  getSession: (sessionId) => api.get(`/session/${sessionId}`),

  getHistory: (userId = null) =>
    api.get('/session/history', { params: userId ? { user_id: userId } : {} }),

  getStats: (userId = null) =>
    api.get('/session/stats', { params: userId ? { user_id: userId } : {} }),
};

// Yoga Flow APIs
export const yogaApi = {
  listFlows: () => api.get('/yoga/flows'),

  startFlow: (flowKey, sessionId) =>
    api.post(`/yoga/flows/${flowKey}/start`, { session_id: sessionId }),

  updateFlow: (sessionId, accuracy) =>
    api.post(`/yoga/flows/${sessionId}/update`, { accuracy }),

  getFlowStatus: (sessionId) => api.get(`/yoga/flows/${sessionId}/status`),

  endFlow: (sessionId) => api.post(`/yoga/flows/${sessionId}/end`),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
