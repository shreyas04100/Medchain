import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Brain, Lock, Database, Zap, Globe,
  ChevronRight, CheckCircle2, ArrowRight, Server, Code2, Layers
} from 'lucide-react'
import { staggerChildren, slideUp, fadeIn, scaleIn } from '../design-system/animations'
import { useTheme } from '../contexts/ThemeContext'

const FEATURES = [
  { icon: ShieldCheck, title: 'AES-256 Encryption', desc: 'Every medical record is encrypted at rest and in transit using military-grade AES-256.', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: Brain, title: 'Sentinel AI', desc: 'Isolation Forest ML model trained on CICIDS2017 detects anomalies in real time.', color: 'text-violet-500 bg-violet-500/10' },
  { icon: Database, title: 'Blockchain Audit', desc: 'Every access event is immutably logged on-chain via Solidity smart contracts.', color: 'text-blue-500 bg-blue-500/10' },
  { icon: Lock, title: 'Role-Based Access', desc: 'Patients, doctors and admins each have scoped permissions enforced by JWT.', color: 'text-amber-500 bg-amber-500/10' },
  { icon: Globe, title: 'IPFS Storage', desc: 'Decentralised file storage ensures no single point of failure for medical data.', color: 'text-cyan-500 bg-cyan-500/10' },
  { icon: Zap, title: 'Real-Time Alerts', desc: 'Automated threat alerts fire when the AI detects HIGH or CRITICAL risk events.', color: 'text-rose-500 bg-rose-500/10' },
]

const STEPS = [
  { n: '01', title: 'Register & Verify', desc: 'Create a patient or doctor account. JWT tokens secure every session.' },
  { n: '02', title: 'Upload Records', desc: 'Files are AES-256 encrypted, hashed with SHA-256, and pinned to IPFS.' },
  { n: '03', title: 'Grant Access', desc: 'Patients approve doctor access requests. Every grant is logged on-chain.' },
  { n: '04', title: 'AI Monitoring', desc: 'Sentinel AI continuously analyses traffic and raises alerts on anomalies.' },
]

const TECH = [
  { label: 'React + Vite', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'TypeScript', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Tailwind CSS', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { label: 'Framer Motion', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { label: 'Spring Boot', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { label: 'PostgreSQL', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { label: 'FastAPI', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { label: 'Isolation Forest', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Solidity', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { label: 'Hardhat', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { label: 'IPFS', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { label: 'JWT', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
]

const STATS = [
  { value: '256-bit', label: 'Encryption Standard' },
  { value: '8', label: 'CICIDS2017 Datasets' },
  { value: '3', label: 'User Roles' },
  { value: '100%', label: 'Audit Coverage' },
]

const FAQS = [
  { q: 'How is my data protected?', a: 'All files are encrypted with AES-256 before storage. SHA-256 checksums verify integrity. Only you control access.' },
  { q: 'What is Sentinel AI?', a: 'An Isolation Forest model trained on the CICIDS2017 network intrusion dataset that detects anomalous access patterns in real time.' },
  { q: 'How does blockchain help?', a: 'Every upload, access grant, and revocation is recorded as an immutable event on a Solidity smart contract, providing a tamper-proof audit trail.' },
  { q: 'Can I revoke doctor access?', a: 'Yes. Patients can revoke access at any time from the Medical Vault. The revocation is logged on-chain immediately.' },
]

export function LandingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className={`relative z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm lg:px-12 ${isDark ? 'border-slate-800/60 bg-slate-900/40 text-slate-200' : 'border-slate-200/80 bg-white/70 text-slate-700'}`}>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-violet-500/20 p-2 text-violet-400"><ShieldCheck className="h-5 w-5" /></div>
          <span className="text-lg font-bold tracking-tight">MedChain</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className={`rounded-xl px-4 py-2 text-sm font-medium transition ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Sign In</Link>
          <Link to="/register" className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500">
            Get Started <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-20 pt-24 text-center lg:px-12">
        <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="mx-auto max-w-4xl">
          <motion.div variants={slideUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            <Brain className="h-4 w-4" /> AI-Powered Medical Security Platform
          </motion.div>
          <motion.h1 variants={slideUp} className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
            Secure Healthcare{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              on the Blockchain
            </span>
          </motion.h1>
          <motion.p variants={slideUp} className={`mx-auto mb-10 max-w-2xl text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            MedChain combines AES-256 encryption, blockchain immutability, IPFS decentralised storage,
            and real-time AI threat detection to protect your medical records.
          </motion.p>
          <motion.div variants={slideUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/register"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40">
              Start for Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login"
              className={`flex items-center gap-2 rounded-2xl border px-8 py-3.5 text-base font-medium transition ${isDark ? 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-white/80 text-slate-700 hover:bg-slate-100'}`}>
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className={`relative z-10 border-y px-6 py-12 backdrop-blur-sm lg:px-12 ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-slate-200 bg-white/70'}`}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Features</p>
            <h2 className={`text-3xl font-bold lg:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Everything you need to secure medical data</h2>
          </div>
          <motion.div variants={staggerChildren} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={slideUp}
                className={`rounded-2xl border p-6 backdrop-blur-sm transition ${isDark ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700' : 'border-slate-200 bg-white/80 hover:border-slate-300'}`}>
                <div className={`mb-4 inline-flex rounded-xl p-3 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className={`mb-2 text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className={`relative z-10 px-6 py-24 lg:px-12 ${isDark ? 'bg-slate-900/40' : 'bg-slate-100/70'}`}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">How It Works</p>
            <h2 className={`text-3xl font-bold lg:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Four steps to complete security</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <motion.div key={s.n} variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/80'}`}>
                <p className={`mb-3 text-4xl font-black ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>{s.n}</p>
                <h3 className={`mb-2 text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">Architecture</p>
            <h2 className="text-3xl font-bold lg:text-4xl">Full-stack decentralised architecture</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[
              { icon: Layers, title: 'Frontend', items: ['React + Vite + TypeScript', 'Tailwind CSS + Framer Motion', 'Recharts Analytics', 'React Query'], color: 'text-blue-400 bg-blue-500/10' },
              { icon: Server, title: 'Backend', items: ['Spring Boot 3 + JWT', 'AES-256 + SHA-256', 'FastAPI ML Service', 'PostgreSQL / H2'], color: 'text-emerald-400 bg-emerald-500/10' },
              { icon: Code2, title: 'Blockchain & AI', items: ['Solidity Smart Contract', 'Hardhat Testing', 'IPFS Storage', 'Isolation Forest ML'], color: 'text-violet-400 bg-violet-500/10' },
            ].map((layer) => (
              <div key={layer.title} className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/80'}`}>
                <div className={`mb-4 inline-flex rounded-xl p-3 ${layer.color}`}>
                  <layer.icon className="h-5 w-5" />
                </div>
                <h3 className={`mb-4 text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{layer.title}</h3>
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className={`relative z-10 px-6 py-20 lg:px-12 ${isDark ? 'bg-slate-900/40' : 'bg-slate-100/70'}`}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">Technology Stack</p>
          <h2 className={`mb-10 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Built with production-grade tools</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH.map((t) => (
              <span key={t.label} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${t.color}`}>{t.label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-rose-400">FAQ</p>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Common questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <motion.div key={faq.q} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/80'}`}>
                <h3 className={`mb-2 text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{faq.q}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 lg:px-12">
        <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className={`mx-auto max-w-3xl rounded-3xl border border-violet-500/20 bg-gradient-to-br p-12 text-center backdrop-blur-sm ${isDark ? 'from-violet-900/40 to-blue-900/40' : 'from-violet-100 to-blue-100'}`}>
          <h2 className={`mb-4 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to secure your medical data?</h2>
          <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Join MedChain and experience blockchain-grade security for healthcare.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t px-6 py-8 lg:px-12 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/20 p-1.5 text-violet-400"><ShieldCheck className="h-4 w-4" /></div>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>MedChain</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>© {new Date().getFullYear()} MedChain. Engineering Major Project.</p>
          <div className={`flex gap-4 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <Link to="/login" className={`transition ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}>Login</Link>
            <Link to="/register" className={`transition ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}`}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
