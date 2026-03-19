/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  Handshake, 
  TrendingUp, 
  BookOpen, 
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LightColor = 'green' | 'yellow' | 'red' | 'black';

export default function App() {
  // State for inputs (PALMS raw data)
  const [weeks, setWeeks] = useState<number>(24); // 週數
  const [absences, setAbsences] = useState<number>(0); // 缺席
  const [lates, setLates] = useState<number>(0); // 遲到
  const [trainingPoints, setTrainingPoints] = useState<number>(0); // 分會教育單位 (CEU)
  const [totalOneToOnes, setTotalOneToOnes] = useState<number>(0); // 一對一總計
  const [totalReferrals, setTotalReferrals] = useState<number>(0); // 提供引薦總計
  const [totalVisitors, setTotalVisitors] = useState<number>(0); // 來賓總計
  const [referralAmount, setReferralAmount] = useState<number>(0); // 交易價值 (萬)

  // Scoring Logic
  const scores = useMemo(() => {
    const currentWeeks = weeks || 1; // 避免除以 0

    // 1. Training (CEU)
    let trainingScore = 0;
    if (trainingPoints >= 6) trainingScore = 15;
    else if (trainingPoints >= 4) trainingScore = 10;
    else if (trainingPoints >= 2) trainingScore = 5;

    // 2. Attendance (Absences + Lates)
    // 規則：3次遲到 = 1次缺席
    const effectiveAbsences = absences + Math.floor(lates / 3);
    let attendanceScore = 0;
    if (effectiveAbsences === 0) attendanceScore = 20;
    else if (effectiveAbsences === 1) attendanceScore = 15;
    else if (effectiveAbsences === 2) attendanceScore = 10;

    // 3. One-to-Ones (per week avg)
    const otoAvg = totalOneToOnes / currentWeeks;
    let otoScore = 0;
    if (otoAvg >= 2) otoScore = 15;
    else if (otoAvg >= 1) otoScore = 10;
    else if (otoAvg >= 0.5) otoScore = 5;

    // 4. Referrals (per week avg)
    const referralAvg = totalReferrals / currentWeeks;
    let referralScore = 0;
    if (referralAvg >= 1.5) referralScore = 20;
    else if (referralAvg >= 1.2) referralScore = 15;
    else if (referralAvg >= 1) referralScore = 10;
    else if (referralAvg >= 0.75) referralScore = 5;

    // 5. Visitors (per 4 weeks avg)
    const visitorAvg = (totalVisitors / currentWeeks) * 4;
    let visitorScore = 0;
    if (visitorAvg >= 2) visitorScore = 15;
    else if (visitorAvg >= 1) visitorScore = 10;

    // 6. Referral Amount (TYFCB, 萬)
    let amountScore = 0;
    if (referralAmount >= 200) amountScore = 15;
    else if (referralAmount >= 80) amountScore = 10;
    else if (referralAmount >= 40) amountScore = 5;

    const total = trainingScore + attendanceScore + otoScore + referralScore + visitorScore + amountScore;

    // Calculate Gaps to Green (Target values for each metric)
    const gaps = {
      training: Math.max(0, 6 - trainingPoints),
      attendance: effectiveAbsences,
      oto: Math.max(0, Math.ceil(2 * currentWeeks - totalOneToOnes)),
      referral: Math.max(0, Math.ceil(1.5 * currentWeeks - totalReferrals)),
      visitor: Math.max(0, Math.ceil(0.5 * currentWeeks - totalVisitors)),
      amount: Math.max(0, 200 - referralAmount)
    };

    let light: LightColor = 'black';
    if (total >= 70) light = 'green';
    else if (total >= 50) light = 'yellow';
    else if (total >= 30) light = 'red';

    return {
      training: trainingScore,
      attendance: attendanceScore,
      oto: otoScore,
      referral: referralScore,
      visitor: visitorScore,
      amount: amountScore,
      total,
      light,
      gaps,
      effectiveAbsences,
      averages: {
        oto: otoAvg.toFixed(2),
        referral: referralAvg.toFixed(2),
        visitor: visitorAvg.toFixed(2)
      }
    };
  }, [weeks, absences, lates, trainingPoints, totalOneToOnes, totalReferrals, totalVisitors, referralAmount]);

  const getLightStyles = (light: LightColor) => {
    switch (light) {
      case 'green': return 'bg-emerald-500 shadow-emerald-500/20 text-white';
      case 'yellow': return 'bg-amber-400 shadow-amber-400/20 text-black';
      case 'red': return 'bg-rose-500 shadow-rose-500/20 text-white';
      case 'black': return 'bg-zinc-900 shadow-zinc-900/20 text-white';
    }
  };

  const getLightLabel = (light: LightColor) => {
    switch (light) {
      case 'green': return '綠燈 (優秀)';
      case 'yellow': return '黃燈 (良好)';
      case 'red': return '紅燈 (待加強)';
      case 'black': return '黑燈 (警示)';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">BNI PALMS 紅綠燈計算機</h1>
          </div>
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            v2.4 Professional
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">輸入 PALMS 數據</h2>
                </div>
                <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-lg">
                  <span className="text-xs font-bold text-zinc-500">統計週數:</span>
                  <input 
                    type="number" 
                    value={weeks}
                    onChange={(e) => setWeeks(Number(e.target.value))}
                    className="w-12 bg-transparent text-center font-mono text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance & Lates */}
                <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <Calendar className="w-4 h-4" /> 缺席次數
                    </label>
                    <input 
                      type="number" 
                      value={absences}
                      onChange={(e) => setAbsences(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> 遲到次數
                    </label>
                    <input 
                      type="number" 
                      value={lates}
                      onChange={(e) => setLates(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-400">註：3次遲到折算1次缺席。當前折算缺席：{scores.effectiveAbsences} 次</p>
                  </div>
                </div>

                {/* Training (CEU) */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <BookOpen className="w-4 h-4" /> 分會教育單位 (CEU)
                  </label>
                  <input 
                    type="number" 
                    value={trainingPoints}
                    onChange={(e) => setTrainingPoints(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    placeholder="例如: 6"
                  />
                  <p className="text-[10px] text-zinc-400 italic">2/4/6 單位對應 5/10/15 積分</p>
                </div>

                {/* One-to-Ones */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Handshake className="w-4 h-4" /> 一對一會面 (總計)
                  </label>
                  <input 
                    type="number" 
                    value={totalOneToOnes}
                    onChange={(e) => setTotalOneToOnes(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                  <p className="text-[10px] text-emerald-600 font-medium">平均每週: {scores.averages.oto} 次</p>
                </div>

                {/* Referrals */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <TrendingUp className="w-4 h-4" /> 提供引薦 (總計)
                  </label>
                  <input 
                    type="number" 
                    value={totalReferrals}
                    onChange={(e) => setTotalReferrals(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                  <p className="text-[10px] text-emerald-600 font-medium">平均每週: {scores.averages.referral} 筆</p>
                </div>

                {/* Visitors */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Users className="w-4 h-4" /> 來賓 (總計)
                  </label>
                  <input 
                    type="number" 
                    value={totalVisitors}
                    onChange={(e) => setTotalVisitors(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                  <p className="text-[10px] text-emerald-600 font-medium">平均每4週: {scores.averages.visitor} 位</p>
                </div>

                {/* Referral Amount */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Activity className="w-4 h-4" /> 交易價值 (萬)
                  </label>
                  <input 
                    type="number" 
                    value={referralAmount}
                    onChange={(e) => setReferralAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                  <p className="text-[10px] text-zinc-400 italic">40/80/200 萬對應 5/10/15 積分</p>
                </div>
              </div>
            </section>

            {/* Score Breakdown */}
            <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">評分明細 (對標 PALMS 報表)</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                <div className="flex justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-600">出席積分 (含遲到折算)</span>
                  <span className="font-mono font-medium">{scores.attendance}</span>
                </div>
                <div className="flex justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-600">培訓積分 (CEU)</span>
                  <span className="font-mono font-medium">{scores.training}</span>
                </div>
                <div className="flex justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-600">一對一積分</span>
                  <span className="font-mono font-medium">{scores.oto}</span>
                </div>
                <div className="flex justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-600">提供引薦積分</span>
                  <span className="font-mono font-medium">{scores.referral}</span>
                </div>
                <div className="flex justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-600">來賓積分</span>
                  <span className="font-mono font-medium">{scores.visitor}</span>
                </div>
                <div className="flex justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-600">交易價值積分</span>
                  <span className="font-mono font-medium">{scores.amount}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div 
              layout
              className={`rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl transition-colors duration-500 ${getLightStyles(scores.light)}`}
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={scores.light}
                className="mb-6"
              >
                <div className={`w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center`}>
                  <div className="text-5xl font-black tracking-tighter">
                    {scores.total}
                  </div>
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">{getLightLabel(scores.light)}</h3>
              <p className="text-sm opacity-80 max-w-[200px]">
                您的總積分為 {scores.total} 分，目前處於{getLightLabel(scores.light).split(' ')[0]}狀態。
              </p>
            </motion.div>

            {/* Reference Table */}
            <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">燈號對照表</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">綠燈</span>
                  </div>
                  <span className="text-sm font-mono">70+ 分</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-amber-400">黃燈</span>
                  </div>
                  <span className="text-sm font-mono text-amber-400">50 - 65 分</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-sm font-medium text-rose-500">紅燈</span>
                  </div>
                  <span className="text-sm font-mono text-rose-500">30 - 45 分</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-zinc-600" />
                    <span className="text-sm font-medium text-zinc-400">黑燈</span>
                  </div>
                  <span className="text-sm font-mono text-zinc-400">25 分以下</span>
                </div>
              </div>
            </div>

            {/* Gap to Green Section */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">距離綠燈目標還差多少？</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">培訓積分 (CEU)</span>
                  <span className={`font-mono font-bold ${scores.gaps.training > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {scores.gaps.training > 0 ? `再加 ${scores.gaps.training} 單位` : '已達標'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">出席 (缺席/遲到)</span>
                  <span className={`font-mono font-bold ${scores.gaps.attendance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {scores.gaps.attendance > 0 ? `需減少 ${scores.gaps.attendance} 次缺席` : '已達標'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">一對一會面</span>
                  <span className={`font-mono font-bold ${scores.gaps.oto > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {scores.gaps.oto > 0 ? `再加 ${scores.gaps.oto} 次` : '已達標'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">提供引薦</span>
                  <span className={`font-mono font-bold ${scores.gaps.referral > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {scores.gaps.referral > 0 ? `再加 ${scores.gaps.referral} 筆` : '已達標'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">來賓</span>
                  <span className={`font-mono font-bold ${scores.gaps.visitor > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {scores.gaps.visitor > 0 ? `再加 ${scores.gaps.visitor} 位` : '已達標'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">交易價值 (TYFCB)</span>
                  <span className={`font-mono font-bold ${scores.gaps.amount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {scores.gaps.amount > 0 ? `再加 ${scores.gaps.amount} 萬` : '已達標'}
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  💡 <strong>提示：</strong> 以上數值是為了讓該單項指標達到「綠燈評分」所需的總量。
                  達成這些目標能顯著提升您的總積分，幫助您邁向分會綠燈會員！
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-zinc-400 text-xs">
        <p>© 2026 BNI PALMS Traffic Lights Calculator. 數據對標 PALMS 報表邏輯。</p>
      </footer>
    </div>
  );
}
