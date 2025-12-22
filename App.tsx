
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, Area
} from 'recharts';
import { 
  Wallet, TrendingUp, Calculator, 
  AlertCircle, CheckCircle2, Briefcase, 
  Users, Building, Settings, Wrench, ShoppingCart, Info, Printer
} from 'lucide-react';
import { BudgetInputs, BudgetMetrics } from './types';
import NumberInput from './components/NumberInput';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BudgetInputs>({
    totalIncome: 1000000,
    actualExpenditure: 350000,
    personnelCosts: 150000,
    officeCosts: 50000,
    businessCosts: 80000,
    maintenanceCosts: 20000,
    procurementCosts: 100000,
    otherCosts: 50000,
    remarks: {
      personnel: '',
      office: '',
      business: '',
      maintenance: '',
      procurement: '',
      other: ''
    }
  });

  const metrics = useMemo<BudgetMetrics>(() => {
    const futureTotal = inputs.personnelCosts + inputs.officeCosts + inputs.businessCosts + 
                        inputs.maintenanceCosts + inputs.procurementCosts + inputs.otherCosts;
    const projectedTotal = inputs.actualExpenditure + futureTotal;
    
    return {
      totalEstimatedFuture: futureTotal,
      totalProjectedExpenditure: projectedTotal,
      currentSpentPercentage: (inputs.actualExpenditure / (inputs.totalIncome || 1)) * 100,
      projectedTotalPercentage: (projectedTotal / (inputs.totalIncome || 1)) * 100,
      remainingBudget: inputs.totalIncome - projectedTotal,
      isOverBudget: projectedTotal > inputs.totalIncome
    };
  }, [inputs]);

  const chartData = [
    { name: '目前已支出', value: inputs.actualExpenditure },
    { name: '預計支出', value: metrics.totalEstimatedFuture },
    { name: '剩餘預算', value: Math.max(0, metrics.remainingBudget) }
  ];

  const breakdownData = [
    { name: '人事費', value: inputs.personnelCosts },
    { name: '辦公費', value: inputs.officeCosts },
    { name: '業務費', value: inputs.businessCosts },
    { name: '維修費', value: inputs.maintenanceCosts },
    { name: '採購費', value: inputs.procurementCosts },
    { name: '其他', value: inputs.otherCosts },
  ];

  const updateInput = <K extends keyof Omit<BudgetInputs, 'remarks'>>(key: K, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const updateRemark = (key: keyof BudgetInputs['remarks'], value: string) => {
    setInputs(prev => ({
      ...prev,
      remarks: { ...prev.remarks, [key]: value }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 print:bg-white print:pb-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white;
            font-size: 12pt;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">專業預算評估系統</h1>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Printer size={18} />
            列印報表 (A4)
          </button>
        </div>
      </header>

      {/* Print Only Header */}
      <div className="print-only mb-8 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-3xl font-black text-slate-900">預算評估報告書</h1>
        <p className="text-slate-500 mt-2">列印日期：{new Date().toLocaleDateString()}</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:p-0">
        
        {/* Left Side: Inputs */}
        <section className="lg:col-span-5 flex flex-col gap-6 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wallet className="text-blue-500" size={20} />
              基礎財務資料
            </h2>
            <div className="flex flex-col gap-5">
              <NumberInput 
                label="目前總收入" 
                value={inputs.totalIncome} 
                onChange={(v) => updateInput('totalIncome', v)} 
                icon={<TrendingUp size={16} className="text-green-500" />}
              />
              <NumberInput 
                label="目前已支出金額" 
                value={inputs.actualExpenditure} 
                onChange={(v) => updateInput('actualExpenditure', v)} 
                icon={<Briefcase size={16} className="text-blue-500" />}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="text-slate-500" size={20} />
              預估支出項目與備註
            </h2>
            <div className="space-y-6">
              {[
                { label: '人事費', id: 'personnelCosts', rid: 'personnel', icon: <Users size={16} className="text-indigo-500" /> },
                { label: '辦公費', id: 'officeCosts', rid: 'office', icon: <Building size={16} className="text-amber-500" /> },
                { label: '業務費', id: 'businessCosts', rid: 'business', icon: <TrendingUp size={16} className="text-emerald-500" /> },
                { label: '維修費', id: 'maintenanceCosts', rid: 'maintenance', icon: <Wrench size={16} className="text-rose-500" /> },
                { label: '採購費', id: 'procurementCosts', rid: 'procurement', icon: <ShoppingCart size={16} className="text-cyan-500" /> },
                { label: '其他費用', id: 'otherCosts', rid: 'other', icon: <Info size={16} className="text-slate-400" /> },
              ].map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 w-full">
                    <NumberInput 
                      label={item.label} 
                      value={inputs[item.id as keyof BudgetInputs] as number} 
                      onChange={(v) => updateInput(item.id as any, v)} 
                      icon={item.icon}
                    />
                  </div>
                  <div className="w-full md:w-48 lg:w-40 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-500">備註</label>
                    <input
                      type="text"
                      placeholder="輸入備註..."
                      value={inputs.remarks[item.rid as keyof BudgetInputs['remarks']]}
                      onChange={(e) => updateRemark(item.rid as any, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Side / Print View: Dashboard */}
        <section className="lg:col-span-7 flex flex-col gap-6 print:w-full">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card">
              <p className="text-slate-500 text-sm font-medium">當前支出佔比</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800">{metrics.currentSpentPercentage.toFixed(1)}%</h3>
              <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden no-print">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, metrics.currentSpentPercentage)}%` }}
                />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card">
              <p className="text-slate-500 text-sm font-medium">總預估支出佔比</p>
              <h3 className={`text-3xl font-bold mt-1 ${metrics.isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                {metrics.projectedTotalPercentage.toFixed(1)}%
              </h3>
              <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden no-print">
                <div 
                  className={`${metrics.isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'} h-full rounded-full transition-all duration-500`} 
                  style={{ width: `${Math.min(100, metrics.projectedTotalPercentage)}%` }}
                />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between card">
              <div>
                <p className="text-slate-500 text-sm font-medium">剩餘預算額度</p>
                <h3 className={`text-3xl font-bold mt-1 ${metrics.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${metrics.remainingBudget.toLocaleString()}
                </h3>
              </div>
              <div className="no-print">
                {metrics.isOverBudget ? (
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold mt-2">
                    <AlertCircle size={14} /> 預算超支 Warning
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mt-2">
                    <CheckCircle2 size={14} /> 預算內安全
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Table - Vital for Print */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">收支詳細明細</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="text-left py-3 px-2">項目名稱</th>
                  <th className="text-right py-3 px-2">金額 (USD)</th>
                  <th className="text-left py-3 px-4">備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="font-bold bg-slate-50">
                  <td className="py-3 px-2">目前總收入</td>
                  <td className="text-right py-3 px-2">${inputs.totalIncome.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-3 px-2">目前已支出</td>
                  <td className="text-right py-3 px-2">${inputs.actualExpenditure.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">-</td>
                </tr>
                {[
                  { label: '人事費', val: inputs.personnelCosts, rem: inputs.remarks.personnel },
                  { label: '辦公費', val: inputs.officeCosts, rem: inputs.remarks.office },
                  { label: '業務費', val: inputs.businessCosts, rem: inputs.remarks.business },
                  { label: '維修費', val: inputs.maintenanceCosts, rem: inputs.remarks.maintenance },
                  { label: '採購費', val: inputs.procurementCosts, rem: inputs.remarks.procurement },
                  { label: '其他預估', val: inputs.otherCosts, rem: inputs.remarks.other },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 px-2 text-slate-600">{row.label}</td>
                    <td className="text-right py-3 px-2 font-medium">${row.val.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{row.rem || <span className="text-slate-300">無</span>}</td>
                  </tr>
                ))}
                <tr className={`border-t-2 border-slate-200 font-black text-lg ${metrics.isOverBudget ? 'text-rose-600' : 'text-blue-600'}`}>
                  <td className="py-4 px-2">總計預估支出</td>
                  <td className="text-right py-4 px-2">${metrics.totalProjectedExpenditure.toLocaleString()}</td>
                  <td className="py-4 px-4 text-base">
                    佔比: {metrics.projectedTotalPercentage.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charts Section - Also needed in print */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card">
              <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">支出分佈比例</h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card">
              <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">預算對比模擬</h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={70} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                       cursor={{ fill: '#f8fafc' }}
                       formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : (index === 0 ? '#3b82f6' : '#8b5cf6')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card print:mt-10">
            <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">預算總體趨勢圖</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { name: '起始', spent: 0, budget: inputs.totalIncome },
                  { name: '目前', spent: inputs.actualExpenditure, budget: inputs.totalIncome },
                  { name: '預計完成', spent: metrics.totalProjectedExpenditure, budget: inputs.totalIncome },
                ]}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="spent" fill="#3b82f61a" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="budget" stroke="#e2e8f0" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>
      </main>

      {/* Footer / Mobile Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 lg:hidden no-print">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">預估總額</span>
            <span className={`text-lg font-black ${metrics.isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
              ${metrics.totalProjectedExpenditure.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            列印 A4 報表
          </button>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="print-only mt-20 text-center text-slate-400 text-xs italic">
        本文件由 專業預算評估系統 自動生成，僅供內部財務參考。
      </div>
    </div>
  );
};

export default App;
