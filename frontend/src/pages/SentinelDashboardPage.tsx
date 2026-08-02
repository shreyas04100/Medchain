import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Brain, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Activity, RefreshCw, Database, Cpu, TrendingUp } from 'lucide-react'
import { fetchModelInfo, fetchMLStats, fetchPredictionHistory, fetchAlerts, resolveAlert } from '../services/ml'
import { staggerChildren, slideUp } from '../design-system/animations'
import { fetchActiveAlerts } from '../services/ml'
import { Toast } from '../components/ui/toast'
import { useEffect, useRef } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

const RISK_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
}

function RiskGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return (
    <div className="relative flex flex-col items-center">
      <div className="h-24 w-24 rounded-full border-[10px] border-slate-700" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-2xl font-bold text-white">{pct}%</p>
          <p className="text-xs text-slate-400">Risk Score</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={slideUp} className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-5 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
          <p className="truncate text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function SentinelDashboardPage() {
  const qc = useQueryClient()
  const { data: modelInfo } = useQuery({ queryKey: ['ml-model-info'], queryFn: fetchModelInfo })
  const { data: stats } = useQuery({ queryKey: ['ml-stats'], queryFn: fetchMLStats, refetchInterval: 15000 })
  const { data: history = [] } = useQuery({ queryKey: ['ml-history'], queryFn: fetchPredictionHistory, refetchInterval: 15000 })
  const { data: alerts = [] } = useQuery({ queryKey: ['ml-alerts'], queryFn: fetchAlerts, refetchInterval: 15000 })
  const { data: activeAlerts = [] } = useQuery({ queryKey: ['ml-active-alerts'], queryFn: fetchActiveAlerts, refetchInterval: 15000 })
  const [notify, setNotify] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)
  const previousAlertCountRef = useRef(0)

  const resolveMut = useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ml-alerts'] }),
  })

  const avgRisk = history.length ? history.reduce((s, p) => s + p.riskScore, 0) / history.length : 0

  const riskCounts = history.reduce<Record<string, number>>((acc, p) => {
    acc[p.riskLevel] = (acc[p.riskLevel] ?? 0) + 1
    return acc
  }, {})

  const riskDistributionData = Object.entries(riskCounts).map(([riskLevel, count]) => ({ name: riskLevel, value: count }))

  const riskTrendData = history.map((p) => ({
    time: new Date(p.predictedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: Math.round(p.riskScore * 100),
    level: p.riskLevel,
  }))

  const scoreBreakdownData = riskDistributionData

  const metricsCards = modelInfo ? [
    { label: 'Accuracy', value: `${(modelInfo.accuracy * 100).toFixed(1)}%` },
    { label: 'Precision', value: `${(modelInfo.precision * 100).toFixed(1)}%` },
    { label: 'Recall', value: `${(modelInfo.recall * 100).toFixed(1)}%` },
    { label: 'F1 Score', value: `${(modelInfo.f1_score * 100).toFixed(1)}%` },
  ] : []

  useEffect(() => {
    if (activeAlerts.length > previousAlertCountRef.current) {
      const latest = activeAlerts[0]
      setNotify({
        title: 'Unauthorized access detected',
        description: latest ? `${latest.message} (${latest.riskLevel})` : 'A high-risk anomaly triggered a Sentinel AI alert.',
        tone: 'danger',
      })
    }
    previousAlertCountRef.current = activeAlerts.length
  }, [activeAlerts.length])

  useEffect(() => {
    if (!notify) return
    const timer = window.setTimeout(() => setNotify(null), 6000)
    return () => window.clearTimeout(timer)
  }, [notify])

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/20 p-2.5 text-violet-400">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Sentinel AI</p>
              <h1 className="text-xl font-bold">Threat Intelligence Dashboard</h1>
            </div>
            {activeAlerts.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">ALERT</span>
            )}
          </div>
          <button onClick={() => qc.invalidateQueries()} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Activity} label="Total Predictions" value={stats?.total ?? 0} color="bg-blue-500/20 text-blue-400" />
          <StatCard icon={ShieldAlert} label="Anomalies" value={stats?.anomalies ?? 0} color="bg-red-500/20 text-red-400" />
          <StatCard icon={CheckCircle2} label="Normal" value={stats?.normal ?? 0} color="bg-emerald-500/20 text-emerald-400" />
          <StatCard icon={AlertTriangle} label="Active Alerts" value={stats?.activeAlerts ?? activeAlerts.length} color="bg-amber-500/20 text-amber-400" />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">Average Risk</p>
            <RiskGauge score={avgRisk} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">Risk Distribution</p>
            {riskDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={riskDistributionData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={4}>
                    {riskDistributionData.map((entry) => (
                      <Cell key={entry.name} fill={RISK_COLORS[entry.name] ?? '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">No prediction data yet</div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">Model Metrics</p>
            <div className="grid grid-cols-2 gap-3">
              {metricsCards.map((m) => (
                <div key={m.label} className="rounded-xl bg-slate-900/60 p-3 text-center">
                  <p className="text-lg font-bold text-violet-400">{m.value}</p>
                  <p className="text-xs text-slate-400">{m.label}</p>
                </div>
              ))}
              {metricsCards.length === 0 && (
                <p className="col-span-2 py-4 text-center text-sm text-slate-500">Model not loaded</p>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Risk Trend (Last 20 Predictions)</p>
          </div>
          {riskTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">No trend data yet</div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Prediction History</p>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {history.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No predictions yet</p>}
              {history.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-2.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: RISK_COLORS[p.riskLevel] }} />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-white">{p.prediction}</p>
                      <p className="text-xs text-slate-500">{p.requestedBy}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold" style={{ color: RISK_COLORS[p.riskLevel] }}>{p.riskLevel}</p>
                    <p className="text-xs text-slate-500">{new Date(p.predictedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Recent Alerts</p>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {alerts.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No alerts</p>}
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-2.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: RISK_COLORS[a.riskLevel] }} />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-white">{a.message}</p>
                      <p className="text-xs text-slate-500">{new Date(a.alertedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {!a.resolved ? (
                    <button onClick={() => resolveMut.mutate(a.id)} className="ml-2 flex-shrink-0 rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/30">
                      Resolve
                    </button>
                  ) : (
                    <span className="ml-2 flex-shrink-0 text-xs text-emerald-500">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {modelInfo && (
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-400" />
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Model Information</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Algorithm', value: modelInfo.model_type },
                { label: 'Features', value: modelInfo.num_features.toLocaleString() },
                { label: 'Dataset Size', value: modelInfo.dataset_size.toLocaleString() },
                { label: 'Training Time', value: `${modelInfo.training_time_seconds}s` },
              ].map((item) => (
                <div key={item.label} className="overflow-hidden rounded-xl bg-slate-900/60 p-4">
                  <p className="mb-1 text-xs text-slate-400">{item.label}</p>
                  <p className="break-words text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Risk Score Distribution (Last 20)</p>
          </div>
          {scoreBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={scoreBreakdownData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="value" fill="#38bdf8">
                  {scoreBreakdownData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] ?? '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">No score breakdown yet</div>
          )}
        </div>
      </div>

      {notify && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={notify.title} description={notify.description} tone={notify.tone} />
        </div>
      )}
    </div>
  )
}
