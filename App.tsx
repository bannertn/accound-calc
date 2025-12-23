
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wallet, TrendingUp, Calculator, 
  Briefcase, Settings, Info, Printer, 
  Plus, Trash2, X, Target, ArrowRightCircle
} from 'lucide-react';
import { BudgetInputs, ExpenditureItem } from './types';
import NumberInput from './components/NumberInput';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#4f46e5', '#db2777', '#0891b2'];

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BudgetInputs>({
    totalIncome: 1000000,
    actualExpenditure: 350000,
    estimatedItems: [
      { id: '1', name: '人事費用', amount: 150000, remark: '包含季度獎金預留' },
      { id: '2', name: '辦公設備', amount: 50000, remark: '伺服器升級與筆電汰換' },
      { id: '3', name: '行銷支出', amount: 80000, remark: 'Google Ads 與線下活動' },
    ]
  });

  const [targetPercentage, setTargetPercentage] = useState(65);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', amount: 0, remark: '' });

  const metrics = useMemo(() => {
    const futureTotal = inputs.estimatedItems.reduce((acc, item) => acc + item.amount, 0);
    const projectedTotal = inputs.actualExpenditure + futureTotal;
    const currentSpentPercentage = (inputs.actualExpenditure / (inputs.totalIncome || 1)) * 100;
    const projectedTotalPercentage = (projectedTotal / (inputs.totalIncome || 1)) * 100;
    
    const targetBudget = (inputs.totalIncome * targetPercentage) / 100;
    const amountToReachTarget = Math.max(0, targetBudget - projectedTotal);

    return {
      totalEstimatedFuture: futureTotal,
      totalProjectedExpenditure: projectedTotal,
      currentSpentPercentage,
      projectedTotalPercentage,
      remainingBudget: inputs.totalIncome - projectedTotal,
      isOverBudget: projectedTotal > inputs.totalIncome,
      amountToReachTarget,
      targetBudget
    };
  }, [inputs, targetPercentage]);

  const chartData = [
    { name: '已實支', value: inputs.actualExpenditure },
    { name: '預估項', value: metrics.totalEstimatedFuture },
    { name: '剩餘空間', value: Math.max(0, metrics.remainingBudget) }
  ];

  const breakdownData = inputs.estimatedItems.map(item => ({
    name: item.name,
    value: item.amount
  }));

  const handleUpdateBase = (key: 'totalIncome' | 'actualExpenditure', value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    const item: ExpenditureItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      amount: newItem.amount,
      remark: newItem.remark
    };
    setInputs(prev => ({
      ...prev,
      estimatedItems: [...prev.estimatedItems, item]
    }));
    setNewItem({ name: '', amount: 0, remark: '' });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setInputs(prev => ({
      ...prev,
      estimatedItems: prev.estimatedItems.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 print:bg-white print:pb-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
        }
        .print-only { display: none; }
        .table-fixed-header th { position: sticky; top: 0; background: #f8fafc; z-index: 10; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-20 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">會計預算評估系統</h1>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Printer size={18} />
            列印 PDF 報表
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* Left: Control Panel */}
        <section className="lg:col-span-4 flex flex-col gap-6 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl card">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b-2 border-slate-50 pb-3 text-slate-900">
              <Wallet className="text-blue-600" size={20} />
              財務基本盤
            </h2>
            <div className="flex flex-col gap-5">
              <NumberInput 
                label="目前總收入 (基準)" 
                value={inputs.totalIncome} 
                onChange={(v) => handleUpdateBase('totalIncome', v)} 
                icon={<TrendingUp size={16} className="text-emerald-600" />}
              />
              <NumberInput 
                label="目前已支出 (實支)" 
                value={inputs.actualExpenditure} 
                onChange={(v) => handleUpdateBase('actualExpenditure', v)} 
                icon={<Briefcase size={16} className="text-blue-600" />}
              />
              
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                  <Target size={14} className="text-orange-500" />
                  目標支出佔比設定 (%)
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900 font-black">%</span>
                  <input
                    type="number"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-slate-900 font-black text-lg transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium italic">系統將依此數值計算支出餘裕。</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl card">
            <div className="flex items-center justify-between mb-6 border-b-2 border-slate-50 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings className="text-slate-400" size={20} />
                預估支出項目
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-blue-200 shadow-lg"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {inputs.estimatedItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-xl">
                  無預估項目
                </div>
              ) : (
                inputs.estimatedItems.map((item) => (
                  <div key={item.id} className="group p-4 bg-slate-50 border-2 border-transparent hover:border-blue-400 rounded-xl transition-all relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-black text-slate-800">{item.name}</span>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-lg font-black text-blue-700">${item.amount.toLocaleString()}</div>
                    {item.remark && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.remark}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right: Analysis & List */}
        <section className="lg:col-span-8 flex flex-col gap-6 print:w-full">
          
          {/* Key Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
            {[
              { label: '當前實支佔比', value: metrics.currentSpentPercentage, color: 'text-blue-600', bg: 'bg-blue-600' },
              { label: '預估總佔比', value: metrics.projectedTotalPercentage, color: metrics.isOverBudget ? 'text-rose-600' : 'text-indigo-600', bg: metrics.isOverBudget ? 'bg-rose-600' : 'bg-indigo-600' },
              { label: '剩餘預算額', value: metrics.remainingBudget, isCurrency: true, color: metrics.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600' }
            ].map((card, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg card">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{card.label}</p>
                <h3 className={`text-3xl font-black ${card.color}`}>
                  {card.isCurrency ? `$${card.value.toLocaleString()}` : `${card.value.toFixed(1)}%`}
                </h3>
                {card.bg && (
                  <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden no-print">
                    <div className={`${card.bg} h-full transition-all duration-1000`} style={{ width: `${Math.min(100, card.value)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main Table: The Detailed Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl card overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                收支詳細清單
              </h3>
              <div className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 no-print">
                基準點：{targetPercentage}% 預算目標
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-widest border-b border-slate-200">
                    <th className="py-4 px-6 text-left">類別 / 項目名稱</th>
                    <th className="py-4 px-6 text-right">金額 (USD)</th>
                    <th className="py-4 px-6 text-left">數據來源 / 備註</th>
                    <th className="py-4 px-6 text-right">距目標額度 ({targetPercentage}%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="py-5 px-6 font-bold text-slate-900">總收入基準</td>
                    <td className="py-5 px-6 text-right font-black text-slate-900">${inputs.totalIncome.toLocaleString()}</td>
                    <td className="py-5 px-6 text-slate-500 text-xs italic">主錢包 / 年度預算</td>
                    <td className="py-5 px-6 text-right text-slate-400">—</td>
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td className="py-5 px-6 font-bold text-slate-900 underline underline-offset-4 decoration-blue-300">目前已實支</td>
                    <td className="py-5 px-6 text-right font-black text-blue-700">${inputs.actualExpenditure.toLocaleString()}</td>
                    <td className="py-5 px-6 text-slate-500 text-xs italic">已核銷單據</td>
                    <td className="py-5 px-6 text-right text-slate-400">—</td>
                  </tr>
                  {inputs.estimatedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-5 px-6 text-slate-900 font-bold">預估：{item.name}</td>
                      <td className="py-5 px-6 text-right font-black text-slate-900">${item.amount.toLocaleString()}</td>
                      <td className="py-5 px-6 text-slate-700 text-xs leading-relaxed max-w-xs">{item.remark || '—'}</td>
                      <td className="py-5 px-6 text-right text-slate-400">—</td>
                    </tr>
                  ))}
                  
                  {/* 目標百分比計算行 */}
                  <tr className="bg-orange-50/50">
                    <td className="py-5 px-6 text-orange-800 font-black flex items-center gap-2">
                      <Target size={14} />
                      目標支出額 ({targetPercentage}%)
                    </td>
                    <td className="py-5 px-6 text-right font-black text-orange-900">
                      ${metrics.targetBudget.toLocaleString()}
                    </td>
                    <td className="py-5 px-6 text-orange-700 text-[10px] font-bold italic uppercase tracking-tighter">系統計算：總收 × {targetPercentage}%</td>
                    <td className="py-5 px-6 text-right font-black text-orange-900">${metrics.targetBudget.toLocaleString()}</td>
                  </tr>
                  
                  <tr className="bg-blue-50/50">
                    <td className="py-5 px-6 text-blue-800 font-black">距目標可支出差額</td>
                    <td className="py-5 px-6 text-right font-black text-slate-400">—</td>
                    <td className="py-5 px-6 text-blue-700 text-[10px] font-bold italic">尚餘可支出之餘力</td>
                    <td className="py-5 px-6 text-right font-black text-blue-800 text-lg">
                      ${metrics.amountToReachTarget.toLocaleString()}
                    </td>
                  </tr>

                  {/* 總結行 */}
                  <tr className={`border-t-4 border-slate-900 bg-slate-900 ${metrics.isOverBudget ? 'text-rose-500' : 'text-white'}`}>
                    <td className="py-8 px-6 text-xl font-black">預估總支出 (Σ)</td>
                    <td className="py-8 px-6 text-right text-2xl font-black">${metrics.totalProjectedExpenditure.toLocaleString()}</td>
                    <td className="py-8 px-6">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">當前預算健康度</div>
                      <div className="flex items-center gap-2 font-black mt-1">
                         {metrics.isOverBudget ? '⚠️ 嚴重超出預算' : '✅ 預算範圍內'}
                      </div>
                    </td>
                    <td className="py-8 px-6 text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">預估佔比</div>
                      <div className="text-xl font-black">{metrics.projectedTotalPercentage.toFixed(1)}%</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl card">
              <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">預估支出構成分析</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData.length > 0 ? breakdownData : [{ name: '無支出', value: 1 }]}
                      cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value"
                    >
                      {breakdownData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                      {breakdownData.length === 0 && <Cell fill="#f1f5f9" />}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      formatter={(v: number) => `$${v.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl card">
              <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">財務核心數據對比</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} axisLine={false} tickLine={false} fontWeight="900" />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      formatter={(v: number) => `$${v.toLocaleString()}`}
                    />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : (index === 0 ? '#2563eb' : '#6366f1')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal: Add Expenditure */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300 no-print">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-slate-50/50 border-b">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">新增支出預算項目</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full border shadow-sm hover:bg-slate-50 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">項目名稱</label>
                <input 
                  type="text" autoFocus placeholder="例如：設備採購費用" 
                  value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">預算金額 (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input 
                    type="number" placeholder="0.00" 
                    value={newItem.amount || ''} onChange={(e) => setNewItem(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">備註內容</label>
                <textarea 
                  placeholder="補充說明支出細節..." 
                  value={newItem.remark} onChange={(e) => setNewItem(prev => ({ ...prev, remark: e.target.value }))}
                  rows={3} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-medium text-slate-800 resize-none"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-black text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-100 transition-all">取消</button>
              <button onClick={handleAddItem} disabled={!newItem.name} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black transition-all shadow-lg shadow-blue-200 disabled:opacity-50">確認新增項目</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer / Mobile Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 lg:hidden no-print z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-6 max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">總預計支出額</span>
            <span className={`text-2xl font-black ${metrics.isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
              ${metrics.totalProjectedExpenditure.toLocaleString()}
            </span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">新增項目</button>
        </div>
      </div>
    </div>
  );
};

export default App;
