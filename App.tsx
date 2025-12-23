
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Wallet, TrendingUp, Calculator, 
  Briefcase, Info, Printer, 
  Plus, Trash2, X, Target, FileDown,
  GripVertical
} from 'lucide-react';
import { BudgetInputs, ExpenditureItem } from './types';
import NumberInput from './components/NumberInput';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BudgetInputs>({
    totalIncome: 1000000,
    actualExpenditure: 350000,
    estimatedItems: [
      { id: '1', name: '人事費用', amount: 150000, remark: '含季度績效獎金' },
      { id: '2', name: '辦公租賃', amount: 50000, remark: '辦公室月租與水電' },
      { id: '3', name: '行銷廣告', amount: 80000, remark: '數位廣告投放下半年' },
    ]
  });

  const [targetPercentage, setTargetPercentage] = useState(65);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', amount: 0, remark: '' });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    setInputs(prev => ({ ...prev, estimatedItems: [...prev.estimatedItems, item] }));
    setNewItem({ name: '', amount: 0, remark: '' });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setInputs(prev => ({ ...prev, estimatedItems: prev.estimatedItems.filter(item => item.id !== id) }));
  };

  const handleExportCSV = () => {
    const rows = [
      ["類別/項目", "金額 (USD)", "備註", "距目標額度"],
      ["總收入基準", inputs.totalIncome, "主錢包", ""],
      ["目前已實支", inputs.actualExpenditure, "已核銷單據", ""],
      ...inputs.estimatedItems.map(item => [item.name, item.amount, item.remark || "", ""]),
      [`目標支出額 (${targetPercentage}%)`, metrics.targetBudget, "基準計算", metrics.targetBudget],
      ["距目標還可支出", "", "預算剩餘", metrics.amountToReachTarget],
      ["預估總支出總計", metrics.totalProjectedExpenditure, metrics.isOverBudget ? "超出" : "合規", ""]
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `財務預算報表_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...inputs.estimatedItems];
    const itemToMove = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, itemToMove);
    setDraggedIndex(index);
    setInputs(prev => ({ ...prev, estimatedItems: newItems }));
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="min-h-screen pb-20 print:bg-white print:pb-0 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">會計預算評估中心</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-200 transition-all">
              <FileDown size={18} />
              <span className="hidden sm:inline">匯出 CSV</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold shadow-md transition-all">
              <Printer size={18} />
              <span className="hidden sm:inline">PDF 報表</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        <section className="lg:col-span-4 flex flex-col gap-6 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-900">
              <Wallet className="text-blue-600" size={20} />
              預算核心設定
            </h2>
            <div className="space-y-5">
              <NumberInput label="目前總收入 (年度)" value={inputs.totalIncome} onChange={(v) => handleUpdateBase('totalIncome', v)} icon={<TrendingUp size={16} className="text-green-600" />} />
              <NumberInput label="目前累計實支" value={inputs.actualExpenditure} onChange={(v) => handleUpdateBase('actualExpenditure', v)} icon={<Briefcase size={16} className="text-blue-600" />} />
              <div className="pt-4 border-t">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest">
                  <Target size={14} className="text-orange-500" />
                  自定義警戒佔比 (%)
                </label>
                <input type="number" value={targetPercentage} onChange={(e) => setTargetPercentage(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-lg focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">預估支出清單</h2>
              <button onClick={() => setIsModalOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {inputs.estimatedItems.map((item, index) => (
                <div 
                  key={item.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
                  className={`group flex items-start gap-3 p-4 bg-slate-50 rounded-xl border-2 transition-all cursor-default ${draggedIndex === index ? 'opacity-40 border-blue-500 bg-blue-50 scale-95' : 'border-transparent hover:border-blue-200 hover:shadow-sm'}`}
                >
                  <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 transition-colors">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between font-black text-slate-800">
                      <span>{item.name}</span>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                    <div className="text-blue-600 font-black text-lg">${item.amount.toLocaleString()}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.remark || "無備註"}</p>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest pt-2 italic">可拖移項目以調整報表順序</p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8 flex flex-col gap-6 print:w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '實支佔比', value: `${metrics.currentSpentPercentage.toFixed(1)}%`, color: 'text-blue-600' },
              { label: '預估總佔比', value: `${metrics.projectedTotalPercentage.toFixed(1)}%`, color: metrics.isOverBudget ? 'text-red-600' : 'text-indigo-600' },
              { label: '剩餘預算額', value: `$${metrics.remainingBudget.toLocaleString()}`, color: 'text-slate-900' }
            ].map((card, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                <div className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                收支詳細清單 (含 {targetPercentage}% 目標對比)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                    <th className="py-4 px-6 text-left">類別名稱</th>
                    <th className="py-4 px-6 text-right">金額 (USD)</th>
                    <th className="py-4 px-6 text-left">數據備註</th>
                    <th className="py-4 px-6 text-right">對比目標額度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-5 px-6 font-bold">1. 總收入基準 (Income)</td>
                    <td className="py-5 px-6 text-right font-black">${inputs.totalIncome.toLocaleString()}</td>
                    <td className="py-5 px-6 text-slate-500 italic">財務主帳戶</td>
                    <td className="py-5 px-6 text-right text-slate-300">—</td>
                  </tr>
                  <tr className="bg-blue-50/20">
                    <td className="py-5 px-6 font-bold underline decoration-blue-200">2. 目前實支項目 (Spent)</td>
                    <td className="py-5 px-6 text-right font-black text-blue-700">${inputs.actualExpenditure.toLocaleString()}</td>
                    <td className="py-5 px-6 text-slate-500 italic">已簽核核銷</td>
                    <td className="py-5 px-6 text-right text-slate-300">—</td>
                  </tr>
                  {inputs.estimatedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-6 text-slate-800 font-bold">{idx + 3}. 預估支出：{item.name}</td>
                      <td className="py-5 px-6 text-right font-black">${item.amount.toLocaleString()}</td>
                      <td className="py-5 px-6 text-slate-600 text-xs font-medium max-w-xs">{item.remark || "無相關細節"}</td>
                      <td className="py-5 px-6 text-right text-slate-300">—</td>
                    </tr>
                  ))}
                  <tr className="bg-orange-50/50">
                    <td className="py-5 px-6 text-orange-900 font-black flex items-center gap-2"><Target size={14}/> 目標支出額度 ({targetPercentage}%)</td>
                    <td className="py-5 px-6 text-right font-black text-orange-900">${metrics.targetBudget.toLocaleString()}</td>
                    <td className="py-5 px-6 text-orange-700 text-[10px] font-bold italic">總收入 {targetPercentage} %</td>
                    <td className="py-5 px-6 text-right font-black text-orange-900">${metrics.targetBudget.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-blue-50 text-blue-800">
                    <td className="py-5 px-6 font-black">距目標可再支出空間</td>
                    <td className="py-5 px-6 text-right text-slate-400">—</td>
                    <td className="py-5 px-6 text-[10px] font-bold italic">預算盈餘監測</td>
                    <td className="py-5 px-6 text-right font-black text-lg">${metrics.amountToReachTarget.toLocaleString()}</td>
                  </tr>
                  <tr className={`border-t-4 border-slate-900 ${metrics.isOverBudget ? 'bg-red-900 text-white' : 'bg-slate-900 text-white'}`}>
                    <td className="py-8 px-6 text-xl font-black italic">預估總額支出 (Total)</td>
                    <td className="py-8 px-6 text-right text-2xl font-black">${metrics.totalProjectedExpenditure.toLocaleString()}</td>
                    <td className="py-8 px-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${metrics.isOverBudget ? 'bg-white text-red-600' : 'bg-green-600 text-white'}`}>
                         {metrics.isOverBudget ? '⚠️ 嚴重超出' : '✅ 健康'}
                       </span>
                    </td>
                    <td className="py-8 px-6 text-right font-black text-xl">{metrics.projectedTotalPercentage.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm no-print">
            <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">財務核心數據趨勢</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} axisLine={false} tickLine={false} fontWeight="900" />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 italic">新增預估支出</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm hover:rotate-90 transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">項目名稱</label>
                <input type="text" autoFocus value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">預估金額 (USD)</label>
                <input type="number" value={newItem.amount || ''} onChange={(e) => setNewItem(prev => ({ ...prev, amount: Number(e.target.value) }))} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">備註內容</label>
                <textarea value={newItem.remark} onChange={(e) => setNewItem(prev => ({ ...prev, remark: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium outline-none focus:border-blue-500 resize-none transition-all" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-black text-slate-500 bg-white border hover:bg-slate-50 transition-all">取消</button>
              <button onClick={handleAddItem} disabled={!newItem.name} className="flex-[2] py-3.5 rounded-2xl font-black text-white bg-blue-600 shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all">確認新增</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
