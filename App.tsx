
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, Area
} from 'recharts';
import { 
  Wallet, TrendingUp, Calculator, 
  AlertCircle, CheckCircle2, Briefcase, 
  Settings, Info, Printer, Plus, Trash2, X, Target
} from 'lucide-react';
import { BudgetInputs, BudgetMetrics, ExpenditureItem } from './types';
import NumberInput from './components/NumberInput';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'];

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BudgetInputs>({
    totalIncome: 1000000,
    actualExpenditure: 350000,
    estimatedItems: [
      { id: '1', name: '人事費', amount: 150000, remark: '含獎金預估' },
      { id: '2', name: '辦公費', amount: 50000, remark: '固定租金與耗材' },
      { id: '3', name: '業務費', amount: 80000, remark: '市場推廣預算' },
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
    
    // 計算達到目標百分比還需支出的金額
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
    { name: '目前已支出', value: inputs.actualExpenditure },
    { name: '預計支出', value: metrics.totalEstimatedFuture },
    { name: '剩餘預算', value: Math.max(0, metrics.remainingBudget) }
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 print:bg-white print:pb-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white;
            font-size: 11pt;
            color: black;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #94a3b8 !important;
            break-inside: avoid;
            margin-bottom: 1rem;
          }
        }
        .print-only {
          display: none;
        }
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        table {
          min-width: 800px;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-20 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">專業預算評估系統</h1>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-md"
          >
            <Printer size={18} />
            列印報表 (A4)
          </button>
        </div>
      </header>

      {/* Print Only Header */}
      <div className="print-only mb-6 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest">預算分析財務報表</h1>
        <div className="flex justify-between mt-2 text-slate-700 text-sm font-bold">
          <span>單據編號：BUD-{new Date().getTime().toString().slice(-8)}</span>
          <span>生成日期：{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:p-0">
        
        {/* Left Side: Inputs */}
        <section className="lg:col-span-4 flex flex-col gap-6 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md card">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b-2 border-slate-100 pb-3 text-slate-900">
              <Wallet className="text-blue-600" size={20} />
              預算核心參數
            </h2>
            <div className="flex flex-col gap-5">
              <NumberInput 
                label="目前總收入" 
                value={inputs.totalIncome} 
                onChange={(v) => handleUpdateBase('totalIncome', v)} 
                icon={<TrendingUp size={16} className="text-green-600" />}
              />
              <NumberInput 
                label="目前已支出金額" 
                value={inputs.actualExpenditure} 
                onChange={(v) => handleUpdateBase('actualExpenditure', v)} 
                icon={<Briefcase size={16} className="text-blue-600" />}
              />
              
              <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-200">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-orange-600" />
                  自定義目標佔比 (%)
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-black">%</span>
                  <input
                    type="number"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-black text-lg"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-bold italic leading-tight">依據此百分比計算「距目標還需支出」之額度</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md card">
            <div className="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-3">
              <h2 className="text-lg font-black flex items-center gap-2 text-slate-900">
                <Settings className="text-slate-600" size={20} />
                支出項目清單
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-black transition-all border border-blue-200"
              >
                <Plus size={16} />
                新增
              </button>
            </div>

            <div className="space-y-3">
              {inputs.estimatedItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-bold italic text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  暫無數據，請新增支出項
                </div>
              ) : (
                inputs.estimatedItems.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">{item.name}</span>
                        <span className="text-xs text-blue-800 font-black bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      {item.remark && <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">{item.remark}</p>}
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 opacity-0 group-hover:opacity-100 transition-all ml-2"
                      title="刪除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Side / Print View: Dashboard */}
        <section className="lg:col-span-8 flex flex-col gap-6 print:w-full">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
            <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md card">
              <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">當前已支出佔比</p>
              <h3 className="text-3xl font-black text-slate-900">{metrics.currentSpentPercentage.toFixed(1)}%</h3>
              <div className="w-full bg-slate-200 h-2 mt-4 rounded-full overflow-hidden no-print">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, metrics.currentSpentPercentage)}%` }}
                />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md card">
              <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">預估總支出佔比</p>
              <h3 className={`text-3xl font-black ${metrics.isOverBudget ? 'text-rose-700' : 'text-slate-900'}`}>
                {metrics.projectedTotalPercentage.toFixed(1)}%
              </h3>
              <div className="w-full bg-slate-200 h-2 mt-4 rounded-full overflow-hidden no-print">
                <div 
                  className={`${metrics.isOverBudget ? 'bg-rose-600' : 'bg-indigo-600'} h-full rounded-full transition-all duration-700`} 
                  style={{ width: `${Math.min(100, metrics.projectedTotalPercentage)}%` }}
                />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md card flex flex-col justify-between">
              <div>
                <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">剩餘可用預算</p>
                <h3 className={`text-3xl font-black ${metrics.remainingBudget < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  ${metrics.remainingBudget.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md card overflow-hidden">
            <h3 className="text-lg font-black text-slate-900 mb-6 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
              <Info size={20} className="text-blue-700" />
              收支詳細清單 (目標：{targetPercentage}%)
            </h3>
            <div className="table-container">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[12px] tracking-widest border-b border-slate-300">
                    <th className="text-left py-4 px-4">項目名稱</th>
                    <th className="text-right py-4 px-4">金額 (USD)</th>
                    <th className="text-left py-4 px-4">備註/說明</th>
                    <th className="text-right py-4 px-4">距 {targetPercentage}% 目標額</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="font-bold bg-slate-50/80">
                    <td className="py-4 px-4 text-slate-900">1. 目前總收入 (基準)</td>
                    <td className="text-right py-4 px-4 font-black">${inputs.totalIncome.toLocaleString()}</td>
                    <td className="py-4 px-4 text-slate-500">—</td>
                    <td className="text-right py-4 px-4 text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-slate-700 font-semibold">2. 目前實支金額</td>
                    <td className="text-right py-4 px-4 font-black text-slate-900">${inputs.actualExpenditure.toLocaleString()}</td>
                    <td className="py-4 px-4 text-slate-600 font-medium">—</td>
                    <td className="text-right py-4 px-4 text-slate-400">—</td>
                  </tr>
                  {inputs.estimatedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-800 font-bold">{idx + 3}. {item.name}</td>
                      <td className="text-right py-4 px-4 font-black text-slate-900">${item.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-slate-700 text-xs font-medium max-w-[200px] break-words">
                        {item.remark || <span className="text-slate-400 italic">無相關備註</span>}
                      </td>
                      <td className="text-right py-4 px-4 text-slate-400 font-medium">—</td>
                    </tr>
                  ))}
                  
                  {/* 目標百分比計算欄位 */}
                  <tr className="bg-orange-50 border-t-2 border-orange-200">
                    <td className="py-4 px-4 text-orange-800 font-black">
                      預設目標額 ({targetPercentage}%)
                    </td>
                    <td className="text-right py-4 px-4 text-orange-900 font-black">
                      ${metrics.targetBudget.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-orange-700 text-[11px] font-bold italic">
                      基準：總收入之 {targetPercentage}%
                    </td>
                    <td className="text-right py-4 px-4 text-orange-900 font-black">
                      ${metrics.targetBudget.toLocaleString()}
                    </td>
                  </tr>
                  
                  <tr className="bg-blue-50">
                    <td className="py-4 px-4 text-blue-800 font-black">
                      達成目標之差額
                    </td>
                    <td className="text-right py-4 px-4 text-blue-900 font-black">
                      —
                    </td>
                    <td className="py-4 px-4 text-blue-700 text-[11px] font-bold italic">
                      {metrics.amountToReachTarget > 0 ? "尚待支出以達標" : "已達標/超標"}
                    </td>
                    <td className="text-right py-4 px-4 text-blue-900 font-black text-lg underline underline-offset-4">
                      ${metrics.amountToReachTarget.toLocaleString()}
                    </td>
                  </tr>

                  <tr className={`border-t-4 border-slate-900 font-black text-xl ${metrics.isOverBudget ? 'text-rose-700' : 'text-slate-900'}`}>
                    <td className="py-6 px-4">總預估支出 (Σ)</td>
                    <td className="text-right py-6 px-4">${metrics.totalProjectedExpenditure.toLocaleString()}</td>
                    <td className="py-6 px-4 text-[10px] font-black uppercase text-slate-600 tracking-tighter leading-tight">
                      <div>淨額：${metrics.remainingBudget.toLocaleString()}</div>
                      <div className="text-blue-700 mt-1">總佔比：{metrics.projectedTotalPercentage.toFixed(1)}%</div>
                    </td>
                    <td className="text-right py-6 px-4">
                       <span className={`text-sm px-3 py-1 rounded-full border-2 ${metrics.amountToReachTarget > 0 ? 'border-blue-500 text-blue-700' : 'border-slate-300 text-slate-400'}`}>
                         {metrics.amountToReachTarget > 0 ? '待支' : '完成'}
                       </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md card">
              <h3 className="text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">支出構成比例分析</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData.length > 0 ? breakdownData : [{ name: '無支出項目', value: 1 }]}
                      cx="50%"
                      cy="40%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                      {breakdownData.length === 0 && <Cell fill="#e2e8f0" />}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md card">
              <h3 className="text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">核心預算對比監控</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={80} axisLine={false} tickLine={false} fontWeight="bold" />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                       cursor={{ fill: '#f1f5f9' }}
                       formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#059669' : (index === 0 ? '#2563eb' : '#7c3aed')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 no-print">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b-2 border-slate-50 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">新增支出預算項</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-rose-600 transition-colors p-1 bg-white border border-slate-200 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">項目名稱 (必填)</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="請輸入項目名稱，如：行銷費用" 
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">預估金額 ($)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={newItem.amount || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">備註內容</label>
                <textarea 
                  placeholder="補充說明該支出的明細、對象或用途..." 
                  value={newItem.remark}
                  onChange={(e) => setNewItem(prev => ({ ...prev, remark: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all resize-none font-medium text-slate-800"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-black text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
              >
                取消
              </button>
              <button 
                onClick={handleAddItem}
                disabled={!newItem.name}
                className="flex-[2] bg-blue-700 text-white px-4 py-3 rounded-xl font-black hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
              >
                儲存項目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-300 p-4 lg:hidden no-print z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">預估總額</span>
            <span className={`text-2xl font-black ${metrics.isOverBudget ? 'text-rose-700' : 'text-slate-900'}`}>
              ${metrics.totalProjectedExpenditure.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 bg-blue-700 text-white h-12 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            新增支出
          </button>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="print-only mt-16 text-center text-slate-500 text-[10px] italic font-bold border-t border-slate-200 pt-4">
        本預算分析報告由專業會計評估系統自動生成。目標預算佔比設定為：{targetPercentage}%。未經授權禁止外傳。
      </div>
    </div>
  );
};

export default App;
