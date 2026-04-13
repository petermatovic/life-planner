'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Wallet, ShieldCheck, PieChart } from 'lucide-react';

export default function TabFinancnyPlan() {
  const { klient, partner, hasPartner, cashFlow } = useAppStore();

  // Basic Calculations for the wow factor
  const prijmySpolu = Number(klient.cistyMesacne || 0) + Number(klient.pasivnyMesacne || 0) + (hasPartner ? Number(partner.cistyMesacne || 0) + Number(partner.pasivnyMesacne || 0) : 0);
  
  const vydavkySpolu = Number(cashFlow.spotrebaMesacne || 0) + Number(cashFlow.uverySplatka || 0) + Number(cashFlow.sporeniaSplatka || 0) + Number(cashFlow.investicieSplatka || 0) + Number(cashFlow.poistZivotSplatka || 0) + Number(cashFlow.poistNezivotMesacne || 0);

  const volnyCashflow = prijmySpolu - vydavkySpolu;

  // Generate 30 year projection for the chart
  const generateChartData = () => {
    const data = [];
    let matrac = 0;
    let investovane = 0;
    const rocnyVynos = 0.07; // 7% stock market return
    
    // Potencialna investicia je len nejaky zlomok z volneho cashflowu (povedzme 50%)
    const mesacnaSplatka = volnyCashflow > 0 ? (volnyCashflow * 0.5) : 100;

    for (let rok = 0; rok <= 30; rok += 2) {
      if (rok > 0) {
        matrac += (mesacnaSplatka * 12 * 2);
        // compound interest for 2 years
        investovane = investovane * Math.pow(1 + rocnyVynos, 2) + mesacnaSplatka * 12 * ((Math.pow(1 + rocnyVynos, 2) - 1) / rocnyVynos);
      }
      
      data.push({
        rok: \`Rok \${rok}\`,
        Banka: Math.round(matrac),
        Investicie: Math.round(investovane)
      });
    }
    return data;
  };

  const chartData = generateChartData();
  const finalInvesticie = chartData[chartData.length - 1].Investicie;
  const finalBanka = chartData[chartData.length - 1].Banka;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">Centrálny Finančný Plán</h2>
          <p className="text-sm font-bold text-[#4D4D4D] dark:text-[#989FA7] mt-2 ml-4">Zlúčenie AOF, Rizík a Cieľov do jednotnej stratégie</p>
        </div>
      </div>

      {/* TOP WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] p-5 rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm flex flex-col gap-1">
           <span className="text-xs font-bold text-[#4D4D4D] dark:text-[#989FA7] uppercase tracking-wider flex items-center gap-2"><Wallet size={14}/> Celkové Príjmy</span>
           <span className="text-2xl font-extrabold text-[#171717] dark:text-white">{prijmySpolu.toLocaleString('sk-SK')} €</span>
         </div>
         <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] p-5 rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm flex flex-col gap-1">
           <span className="text-xs font-bold text-[#4D4D4D] dark:text-[#989FA7] uppercase tracking-wider flex items-center gap-2"><PieChart size={14}/> Súčasné Výdavky</span>
           <span className="text-2xl font-extrabold text-[#171717] dark:text-white">{vydavkySpolu.toLocaleString('sk-SK')} €</span>
         </div>
         <div className={`p-5 rounded-xl border shadow-sm flex flex-col gap-1 ${volnyCashflow > 0 ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
           <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${volnyCashflow > 0 ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}`}><TrendingUp size={14}/> Voľný Cashflow</span>
           <span className={`text-2xl font-extrabold ${volnyCashflow > 0 ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>{volnyCashflow.toLocaleString('sk-SK')} €</span>
         </div>
         <div className="bg-black dark:bg-[#111111] p-5 rounded-xl border border-black dark:border-[#333] shadow-md flex flex-col gap-1">
           <span className="text-xs font-bold text-[#ECEDED] dark:text-[#989FA7] uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={14}/> Hodnota o 30 rokov</span>
           <span className="text-2xl font-extrabold text-[#AB0534] dark:text-[#ff4a7d]">{finalInvesticie.toLocaleString('sk-SK')} €</span>
         </div>
      </div>

      {/* CHART AREA */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#2A2A2A] rounded-xl p-6 shadow-sm mt-4">
        <h3 className="font-extrabold text-lg mb-1 text-[#171717] dark:text-white">Projekcia rastu rodinného majetku</h3>
        <p className="text-xs font-bold text-[#4D4D4D] dark:text-[#989FA7] mb-6">Modelový príklad investovania časti voľného cashflowu ({Math.round(volnyCashflow > 0 ? volnyCashflow * 0.5 : 100)} € / mes) v porovnaní s bežným účtom.</p>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvesticie" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AB0534" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#AB0534" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBanka" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7A8C99" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#7A8C99" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="rok" stroke="#989FA7" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#989FA7" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => \`\${value / 1000}k\`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
              <Tooltip 
                formatter={(value: number) => [\`\${value.toLocaleString('sk-SK')} €\`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="Banka" stroke="#7A8C99" fillOpacity={1} fill="url(#colorBanka)" />
              <Area type="monotone" dataKey="Investicie" stroke="#AB0534" fillOpacity={1} fill="url(#colorInvesticie)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
