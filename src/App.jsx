import { useState } from 'react'
import data from './data.json'

export default function App() {
  const metrics = data.revenue
  const costs = data.costs
  const ebitda = data.ebitda
  const captable = data.captable

  const total_months = metrics.months.length
  const total_revenue = metrics.total_revenue
  const total_ebitda = ebitda.total
  const total_costs = costs.totals[-1] // approximately 378k
  const net_profit = total_revenue + total_ebitda  // rough

  // Format currency helper
  const BRL = (v) => {
    if (v === null || v === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Power Coffee</h1>
              <p className="text-sm text-gray-400">Investor Dashboard • 18-Month Projection</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Key Metrics */}
        <section>
          <h2 className="text-xl font-semibold mb-5 text-gray-200">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">{BRL(total_revenue)}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">EBITDA</p>
              <p className="text-2xl font-bold text-blue-400">{BRL(total_ebitda)}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Post-Money Valuation</p>
              <p className="text-2xl font-bold text-yellow-400">{BRL(data.valuation.post_money)}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Months</p>
              <p className="text-2xl font-bold text-gray-200">{total_months}</p>
            </div>
          </div>
        </section>

        {/* Revenue Chart */}
        <section className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-200">Monthly Revenue (BRL)</h2>
          <div className="space-y-3">
            {metrics.months.map((m, i) => {
              const val = metrics.revenue_brl[i]
              const max = Math.max(...metrics.revenue_brl)
              const pct = (val / max) * 100
              return (
                <div key={m} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-400">{m}</div>
                  <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="w-28 text-right text-sm text-green-400">{BRL(val)}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Breakdown Table */}
        <section className="bg-[#111] border border-gray-800 rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-5 text-gray-200">Financial Breakdown</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-3 pr-4">Metric</th>
                {metrics.months.map(m => <th key={m} className="text-center py-3 px-1 text-xs whitespace-nowrap">{m}</th>)}
                <th className="text-right py-3 pl-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {costs.categories.map((cat, idx) => {
                const row = costs.monthly[idx]
                const total = costs.totals[idx]
                return (
                  <tr key={cat} className="hover:bg-gray-900/50">
                    <td className="py-3 pr-4 font-medium text-gray-300">{cat}</td>
                    {row.map((v, i) => (
                      <td key={i} className="text-center py-2 px-1 text-gray-400 text-xs">{BRL(v)}</td>
                    ))}
                    <td className="text-right py-2 pl-4 text-gray-300 text-sm">{BRL(total)}</td>
                  </tr>
                )
              })}
              <tr className="bg-gray-900/80 font-semibold">
                <td className="py-3 pr-4 text-green-400">EBITDA</td>
                {ebitda.monthly.map((v, i) => (
                  <td key={i} className={`text-center py-2 px-1 text-xs ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>{BRL(v)}</td>
                ))}
                <td className={`text-right py-2 pl-4 ${total_ebitda >= 0 ? 'text-green-400' : 'text-red-400'}`}>{BRL(total_ebitda)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* CAP Table */}
        <section className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-200">Cap Table (Post-Funding)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {captable.rows.map(entry => (
              <div key={entry.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">{entry.name}</p>
                <p className="text-xl font-bold text-yellow-400">{entry.share}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Post-Money Valuation</span>
            <span className="text-xl font-bold text-yellow-400">{BRL(data.valuation.post_money)}</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
          <p>Power Coffee Investor Dashboard • Data sourced from live financial model</p>
          <p className="mt-1">Generated for investor review — confidential</p>
        </footer>
      </main>
    </div>
  )
}
