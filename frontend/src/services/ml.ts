import api from './auth'

export type PredictionResponse = {
  prediction: 'ANOMALY' | 'NORMAL'
  risk_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence: number
  timestamp: string
}

export type ModelInfo = {
  model_type: string
  num_features: number
  dataset_size: number
  training_time_seconds: number
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  confusion_matrix: number[][]
  contamination: number
}

export type MLPrediction = {
  id: number
  prediction: string
  riskScore: number
  riskLevel: string
  confidence: number
  predictedAt: string
  requestedBy: string
}

export type MLAlert = {
  id: number
  riskLevel: string
  riskScore: number
  message: string
  alertedAt: string
  resolved: boolean
  resolvedBy: string | null
  resolvedAt: string | null
}

export type MLStats = {
  total: number
  anomalies: number
  normal: number
  activeAlerts: number
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await api.get<ModelInfo>('/ml/model-info')
  return res.data
}

export async function fetchMLStats(): Promise<MLStats> {
  const res = await api.get<MLStats>('/ml/stats')
  return res.data
}

export async function fetchPredictionHistory(): Promise<MLPrediction[]> {
  const res = await api.get<MLPrediction[]>('/ml/predictions')
  return res.data
}

export async function fetchAlerts(): Promise<MLAlert[]> {
  const res = await api.get<MLAlert[]>('/ml/alerts')
  return res.data
}

export async function fetchActiveAlerts(): Promise<MLAlert[]> {
  const res = await api.get<MLAlert[]>('/ml/alerts/active')
  return res.data
}

export async function resolveAlert(id: number): Promise<void> {
  await api.patch(`/ml/alerts/${id}/resolve`)
}

export async function runPredict(features: number[]): Promise<PredictionResponse> {
  const res = await api.post<PredictionResponse>('/ml/predict', { features })
  return res.data
}
