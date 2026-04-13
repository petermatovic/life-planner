'use client';

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Target, ShieldCheck, TrendingUp, Presentation, Download, FileText, ArrowRight } from 'lucide-react';
import TabAOF from '@/components/TabAOF';
import TabPrepocty from '@/components/TabPrepocty';
import TabCiele from '@/components/TabCiele';
import TabFinancnyPlan from '@/components/TabFinancnyPlan';
import TabVystup from '@/components/TabVystup';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('AOF');
  const { t } = useTranslation();

  // Load global state for header info
  const state = useAppStore();
  const { klient } = state;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `ulozene_${klient.meno || 'klient'}.json`);
    dlAnchorElem.click();
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { id: 'AOF', label: t('sidebar.aof'), icon: LayoutDashboard },
    { id: 'Ciele', label: t('sidebar.ciele'), icon: Target },
    { id: 'Prepocty', label: t('sidebar.prepocty'), icon: ShieldCheck },
    { id: 'FinancnyPlan', label: t('sidebar.financnyPlan'), icon: TrendingUp },
    { id: 'Vystup', label: t('sidebar.vystup'), icon: Presentation }
  ];

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all w-full text-left group ${
        activeTab === id 
          ? 'bg-[#AB0534] text-white shadow-md' 
          : 'text-[#4D4D4D] dark:text-[#989FA7] hover:bg-[#D1D1D1]/50 dark:hover:bg-[#1A1A1A] hover:text-[#171717] dark:hover:text-[#ededed]'
      }`}
    >
      <Icon size={18} className={activeTab === id ? 'text-white' : 'text-[#4D4D4D] dark:text-[#989FA7] group-hover:text-[#171717] dark:group-hover:text-white'} /> 
      <span className="truncate flex-1">{label}</span>
      {activeTab === id && <ArrowRight size={14} className="opacity-70" />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] dark:bg-[var(--background)] font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-[#ECEDED] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] flex flex-col justify-between sticky top-0 h-screen overflow-y-auto hidden md:flex shrink-0 shadow-sm z-10 transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-[#AB0534] flex items-center justify-center text-white font-bold text-xl shadow-md">P</div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#171717] dark:text-[#ededed] leading-none">Planner</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#989FA7] mt-1">2026 Edition</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            {navItems.slice(0, 4).map(item => <SidebarItem key={item.id} {...item} />)}
            <div className="h-px bg-[#ECEDED] dark:border-[#2A2A2A] my-2 border-t border-dashed"></div>
            <SidebarItem {...navItems[4]} />
          </nav>
        </div>

        <div className="p-4 border-t border-[#ECEDED] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#111111]">
          <div className="flex bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-1.5 border border-[#D1D1D1] dark:border-[#333] mb-3">
             <button onClick={() => state.setJazyk('SK')} className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1 rounded transition ${state.jazyk === 'SK' ? 'bg-white dark:bg-[#2A2A2A] shadow text-[#AB0534] dark:text-[#ff4a7d]' : 'text-[#989FA7] hover:text-[#4D4D4D]'}`}>SK</button>
             <button onClick={() => state.setJazyk('EN')} className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1 rounded transition ${state.jazyk === 'EN' ? 'bg-white dark:bg-[#2A2A2A] shadow text-[#AB0534] dark:text-[#ff4a7d]' : 'text-[#989FA7] hover:text-[#4D4D4D]'}`}>EN</button>
             <button onClick={() => state.setJazyk('DE')} className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1 rounded transition ${state.jazyk === 'DE' ? 'bg-white dark:bg-[#2A2A2A] shadow text-[#AB0534] dark:text-[#ff4a7d]' : 'text-[#989FA7] hover:text-[#4D4D4D]'}`}>DE</button>
          </div>
          <div className="flex items-center justify-between mb-3 bg-[#EAEAEA] dark:bg-[#1A1A1A] p-2 rounded border border-[#D1D1D1] dark:border-[#333]">
            <span className="text-xs font-bold text-[#4D4D4D] dark:text-[#989FA7]">{t('sidebar.tema')}</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#AB0534] focus:ring-offset-1 bg-[#D1D1D1] dark:bg-[#4D4D4D]"
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition shadow-sm ${darkMode ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
          <button onClick={handleExportJSON} className="flex items-center justify-center gap-2 w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded shadow hover:opacity-90 transition">
             <Download size={14} /> {t('sidebar.ulozitJson')}
          </button>
          <div className="text-[9px] text-center text-[#989FA7] dark:text-[#4D4D4D] font-bold mt-3">Jadro aktualizované (Zustand) • Live math</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#111111]">
        
        {/* Mobile Header (Fallback) */}
        <header className="md:hidden bg-white dark:bg-[#111111] border-b border-[#ECEDED] dark:border-[#4D4D4D] p-4 flex justify-between">
           <h1 className="font-bold text-[#AB0534]">Partners Planner</h1>
           <select 
             value={activeTab} 
             onChange={(e) => setActiveTab(e.target.value)}
             className="bg-[#FAFAFA] dark:bg-[#2A2A2A] px-2 py-1 border rounded text-xs font-bold"
            >
             <option value="AOF">AOF</option>
             <option value="Ciele">Ciele</option>
             <option value="Prepocty">Prepočty</option>
             <option value="FinancnyPlan">Finančný plán</option>
             <option value="Vystup">Výstup</option>
           </select>
        </header>

        {/* TOP BAR */}
        <div className="h-16 border-b border-[#D1D1D1] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] hidden md:flex items-center justify-between px-8 shadow-sm shrink-0 transition-colors duration-300 print:hidden">
           <h2 className="text-sm font-bold text-[#4D4D4D] dark:text-[#989FA7]">{t('sidebar.modelText')} <span className="text-lg text-[#171717] dark:text-[#ededed] ml-2">{t('sidebar.rodina')} <span className="text-[#AB0534]">{klient.meno || t('sidebar.vzorova')}</span></span></h2>
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#EAEAEA] dark:bg-[#2A2A2A] hover:bg-[#D1D1D1] dark:hover:bg-[#333] transition px-4 py-2 rounded text-sm font-bold border border-[#D1D1D1] dark:border-[#4D4D4D] text-[#171717] dark:text-white">
             <FileText size={16} /> {t('sidebar.exportPdf')}
           </button>
        </div>

        {/* View Router */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1400px] w-full mx-auto custom-scrollbar">
          {activeTab === 'AOF' && <TabAOF />}
          {activeTab === 'Prepocty' && <TabPrepocty />}
          {activeTab === 'Ciele' && <TabCiele />}
          {activeTab === 'FinancnyPlan' && <TabFinancnyPlan />}
          {activeTab === 'Vystup' && <TabVystup />}
        </div>
      </main>
    </div>
  );
}
