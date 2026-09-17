import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const runFullInspection = async (payload) => {
  const response = await apiClient.post('/scan/inspect-full', payload);
  return response.data;
};

export const preprocessImage = async (payload) => {
  const response = await apiClient.post('/preprocess/quality-and-rectify', payload);
  return response.data;
};

export const runForensics = async (payload) => {
  const response = await apiClient.post('/forensics/analyze-all', payload);
  return response.data;
};

export const verifyMRZ = async (payload) => {
  const response = await apiClient.post('/mrz/verify-mrz', payload);
  return response.data;
};

export const compareFaces = async (payload) => {
  const response = await apiClient.post('/biometrics/compare-faces', payload);
  return response.data;
};

export const checkPassiveLiveness = async (payload) => {
  const response = await apiClient.post('/biometrics/liveness/passive', payload);
  return response.data;
};

export const verifyActiveChallenge = async (payload) => {
  const response = await apiClient.post('/biometrics/liveness/active-challenge', payload);
  return response.data;
};

export const getWatchlist = async () => {
  const response = await apiClient.get('/blacklist/watchlist');
  return response.data;
};

export const addToWatchlist = async (payload) => {
  const response = await apiClient.post('/blacklist/watchlist/add', payload);
  return response.data;
};

export const removeFromWatchlist = async (documentNumber) => {
  const response = await apiClient.delete(`/blacklist/watchlist/${documentNumber}`);
  return response.data;
};

export const getCheckpointAnalytics = async () => {
  const response = await apiClient.get('/analytics/checkpoint/metrics');
  return response.data;
};

export const getBlockchainLedger = async () => {
  const response = await apiClient.get('/blockchain/ledger/blocks');
  return response.data;
};

export const generateCertificate = async (payload) => {
  const response = await apiClient.post('/blockchain/certificate/generate', payload);
  return response.data;
};

export default apiClient;
