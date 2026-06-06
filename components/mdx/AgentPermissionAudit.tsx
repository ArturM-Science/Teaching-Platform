'use client'

import { useState } from 'react'

type Tool = {
  id: string
  name: string
  description: string
  riskWeight: number
  category: 'read' | 'write' | 'destructive' | 'exfiltrate'
}

const TOOLS: Tool[] = [
  { id: 'read_order_status', name: 'read_order_status', description: "Read a customer's own order status", riskWeight: 0, category: 'read' },
  { id: 'search_product_catalog', name: 'search_product_catalog', description: 'Search the public product catalog', riskWeight: 0, category: 'read' },
  { id: 'send_email', name: 'send_email', description: 'Send an email to any address', riskWeight: 3, category: 'exfiltrate' },
  { id: 'update_order', name: 'update_order', description: 'Modify any order in the database', riskWeight: 2, category: 'write' },
  { id: 'read_all_orders', name: 'read_all_orders', description: "Read all customers' orders", riskWeight: 4, category: 'read' },
  { id: 'execute_sql', name: 'execute_sql', description: 'Run arbitrary SQL on the database', riskWeight: 5, category: 'destructive' },
  { id: 'fetch_url', name: 'fetch_url', description: 'Retrieve any URL (enables data exfil via webhook)', riskWeight: 3, category: 'exfiltrate' },
  { id: 'delete_account', name: 'delete_account', description: 'Delete any customer account', riskWeight: 5, category: 'destructive' },
]

const CATEGORY_STYLES: Record<Tool['category'], string> = {
  read: 'bg-blue-50 border-blue-200 text-blue-700',
  write: 'bg-amber-50 border-amber-200 text-amber-700',
  destructive: 'bg-red-50 border-red-200 text-red-700',
  exfiltrate: 'bg-purple-50 border-purple-200 text-purple-700',
}

const CATEGORY_LABELS: Record<Tool['category'], string> = {
  read: 'Read',
  write: 'Write',
  destructive: 'Destructive',
  exfiltrate: 'Exfil risk',
}

const LEAST_PRIVILEGE = new Set(['read_order_status', 'search_product_catalog'])

type SimResult = {
  headline: string
  detail: string
  severity: 'contained' | 'low' | 'high' | 'critical'
}

function computeResult(enabled: Set<string>): SimResult {
  const has = (id: string) => enabled.has(id)

  if (has('execute_sql') || has('delete_account')) {
    const effects: string[] = []
    if (has('execute_sql')) effects.push('run arbitrary SQL queries — exfiltrating the entire customer database (orders, PII, payment tokens)')
    if (has('delete_account')) effects.push('delete 10,000 customer accounts permanently')
    if (has('send_email')) effects.push('send phishing emails from your company domain to all customers')
    if (has('fetch_url')) effects.push('exfiltrate data via an external webhook')
    return {
      headline: 'Critical breach — full system compromise',
      detail: `The injected instruction caused the agent to: ${effects.join('; ')}. These are irreversible actions affecting every user.`,
      severity: 'critical',
    }
  }

  if (has('read_all_orders') && (has('send_email') || has('fetch_url'))) {
    return {
      headline: 'High severity — full data breach',
      detail: 'The agent read all customers\' orders (names, addresses, order history) and sent them to an external address. GDPR breach notification required within 72 hours.',
      severity: 'high',
    }
  }

  if (has('send_email') || has('fetch_url')) {
    const via = has('send_email') ? 'email to attacker@external.com' : 'external webhook'
    const data = has('read_all_orders') ? 'all order data' : 'the current user\'s order details'
    return {
      headline: 'Medium severity — data exfiltration',
      detail: `The agent exfiltrated ${data} via ${via}. Limited blast radius but a reportable data incident.`,
      severity: 'low',
    }
  }

  if (has('update_order')) {
    return {
      headline: 'Low severity — data tampering',
      detail: 'The agent modified order records (quantities, shipping addresses) but could not exfiltrate data or destroy records. Damage is contained and reversible.',
      severity: 'low',
    }
  }

  return {
    headline: 'Attack contained — no sensitive access',
    detail: 'With only read_order_status and search_product_catalog, the agent can read one customer\'s own order and search public products. Even a fully successful injection has no exfiltration path and no write access. This is least-privilege.',
    severity: 'contained',
  }
}

function computeScore(enabled: Set<string>): number {
  const total = TOOLS.reduce((s, t) => s + t.riskWeight, 0)
  const granted = TOOLS.filter(t => enabled.has(t.id)).reduce((s, t) => s + t.riskWeight, 0)
  return Math.min(10, Math.round((granted / total) * 10))
}

const SEVERITY_STYLES = {
  contained: { bar: 'bg-emerald-500', card: 'border-emerald-200 bg-emerald-50 text-emerald-800', label: 'text-emerald-700' },
  low:       { bar: 'bg-amber-500',   card: 'border-amber-200 bg-amber-50 text-amber-800',     label: 'text-amber-700' },
  high:      { bar: 'bg-orange-500',  card: 'border-orange-200 bg-orange-50 text-orange-800',   label: 'text-orange-700' },
  critical:  { bar: 'bg-red-600',     card: 'border-red-200 bg-red-50 text-red-900',            label: 'text-red-700' },
}

export function AgentPermissionAudit() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(TOOLS.map(t => t.id)))
  const [simResult, setSimResult] = useState<SimResult | null>(null)

  const score = computeScore(enabled)
  const severity = computeResult(enabled).severity
  const styles = SEVERITY_STYLES[simResult ? simResult.severity : severity]

  function toggle(id: string) {
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSimResult(null)
  }

  function applyLeastPrivilege() {
    setEnabled(new Set(LEAST_PRIVILEGE))
    setSimResult(null)
  }

  function simulate() {
    setSimResult(computeResult(enabled))
  }

  const scoreColor = score <= 2 ? 'text-emerald-600' : score <= 5 ? 'text-amber-600' : score <= 7 ? 'text-orange-600' : 'text-red-600'
  const barColor = score <= 2 ? 'bg-emerald-500' : score <= 5 ? 'bg-amber-500' : score <= 7 ? 'bg-orange-500' : 'bg-red-600'

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Agent Permission Audit</p>
        <p className="text-sm text-zinc-500 mt-0.5">Toggle tool permissions for a customer support agent, then simulate a prompt injection attack to see the blast radius.</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
          <p className="text-xs text-zinc-500 font-medium mb-0.5">Scenario</p>
          <p className="text-sm text-zinc-700 font-semibold">Customer support agent — e-commerce platform</p>
          <p className="text-xs text-zinc-500 mt-0.5">Intended task: help users check their order status and find products.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-zinc-500">Risk score</p>
            <span className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{score}<span className="text-sm font-normal text-zinc-400">/10</span></span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${score * 10}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tool permissions</p>
            <button
              onClick={applyLeastPrivilege}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition"
            >
              Apply least privilege →
            </button>
          </div>

          {TOOLS.map(tool => {
            const on = enabled.has(tool.id)
            return (
              <label key={tool.id} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${on ? 'border-zinc-300 bg-white' : 'border-zinc-100 bg-zinc-50 opacity-50'}`}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(tool.id)}
                  className="mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-zinc-800">{tool.name}</span>
                    <span className={`rounded-full border px-1.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[tool.category]}`}>
                      {CATEGORY_LABELS[tool.category]}
                    </span>
                    {LEAST_PRIVILEGE.has(tool.id) && (
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs px-1.5 py-0.5 font-medium">
                        Least privilege
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{tool.description}</p>
                </div>
                {tool.riskWeight > 0 && on && (
                  <div className="flex-shrink-0 flex gap-0.5 mt-0.5">
                    {Array.from({ length: Math.min(tool.riskWeight, 5) }, (_, i) => (
                      <div key={i} className={`w-1.5 h-3 rounded-sm ${tool.riskWeight >= 5 ? 'bg-red-400' : tool.riskWeight >= 3 ? 'bg-amber-400' : 'bg-zinc-300'}`} />
                    ))}
                  </div>
                )}
              </label>
            )
          })}
        </div>

        <button
          onClick={simulate}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          ⚡ Simulate attack with these permissions
        </button>

        {simResult && (
          <div
            className={`rounded-lg border px-4 py-3 space-y-1 ${SEVERITY_STYLES[simResult.severity].card}`}
            style={{ animation: 'fadeUp 0.25s ease both' }}
          >
            <p className={`text-sm font-bold ${SEVERITY_STYLES[simResult.severity].label}`}>{simResult.headline}</p>
            <p className="text-xs leading-relaxed">{simResult.detail}</p>
          </div>
        )}

        {simResult && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-600" style={{ animation: 'fadeUp 0.4s ease both' }}>
            <span className="font-semibold text-zinc-900">OWASP LLM06 — Excessive Agency: </span>
            The permissions you grant at design time are the permissions an attacker has when the agent is compromised. A document summariser needs to read; it should not need to write, delete, or send email. Design for the minimal capability required, not the maximal convenience.
          </div>
        )}
      </div>
    </div>
  )
}
