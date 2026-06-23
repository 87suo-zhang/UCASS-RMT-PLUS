/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Layers, Monitor, MessageSquare, Sparkles, Tv, Library, BookOpen, AlertCircle, Heart, Award } from 'lucide-react';
import CameraModule from './components/CameraModule';
import SubtitleModule from './components/SubtitleModule';
import SwitcherModule from './components/SwitcherModule';
import Forum from './components/Forum';
import AIConsultant from './components/AIConsultant';

export default function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'subtitle' | 'switcher' | 'forum' | 'ai'>('camera');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col Selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Universal Sticky Top Broadcast Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 flex flex-all justify-between items-center">
        <div className="flex items-center space-x-3.5">
          {/* Logo visual marker */}
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group cursor-pointer hover:rotate-6 transition-all duration-300">
            <Tv className="w-5.5 h-5.5 text-white active:scale-95" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black font-sans uppercase tracking-widest scale-95">
                UCASS Converged Media
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title="系统活动就绪"></span>
            </div>
            <h1 className="text-base md:text-lg font-black font-sans text-slate-100 tracking-tight leading-none mt-1">
              中国社会科学院大学 ｜ 融媒体直转播助手
            </h1>
          </div>
        </div>

        {/* Short Campus Tagline decoration (Desktop-only) */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span>140报告厅・活动中心实战保障知识库</span>
        </div>
      </header>

      {/* Main Multi-Screen Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side menu selector column (Desk: 3 spans, Mobile: full layout grid tab bar) */}
        <nav className="col-span-1 md:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl md:space-y-1 shadow-lg text-slate-400">
            <p className="text-[10px] tracking-widest uppercase font-extrabold text-slate-500 px-3 pb-3 border-b border-slate-850/60 mb-2">
              直转播中心三大模块
            </p>

            <button
              onClick={() => setActiveTab('camera')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'camera' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                  : 'hover:bg-slate-850/60 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4.5 h-4.5" />
              <span>1. 摄像核心模块</span>
            </button>

            <button
              onClick={() => setActiveTab('subtitle')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'subtitle' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                  : 'hover:bg-slate-850/60 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
              <span>2. 字幕模块 (vMix/GT)</span>
            </button>

            <button
              onClick={() => setActiveTab('switcher')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'switcher' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                  : 'hover:bg-slate-850/60 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4.5 h-4.5" />
              <span>3. 导播核心模块</span>
            </button>

            <p className="text-[10px] tracking-widest uppercase font-extrabold text-slate-500 px-3 pt-4 pb-2 border-b border-slate-850/60 mb-2">
              社员深度交互
            </p>

            <button
              onClick={() => setActiveTab('forum')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'forum' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                  : 'hover:bg-slate-850/60 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>4. 经验交流论坛</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'ai' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                  : 'hover:bg-slate-850/60 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
              <span className="font-bold">5. AI 导演技术顾问</span>
            </button>

          </div>

          {/* Guidelines Sidebar Tip card */}
          <div className="hidden md:block bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1 leading-none">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>融媒体直播安全指引</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              现场导播切换与摄像组联络口诀：“宁可保留远景全景保底，切莫盲目对切推拉动作。” 保持通话冷静，听从指挥。
            </p>
          </div>
        </nav>

        {/* Right main tab context block (colspan: 9 spans) */}
        <div id="main_tab_viewport" className="col-span-1 md:col-span-9">
          {activeTab === 'camera' && <CameraModule />}
          {activeTab === 'subtitle' && <SubtitleModule />}
          {activeTab === 'switcher' && <SwitcherModule />}
          {activeTab === 'forum' && <Forum />}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI 导演顾问独立版
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  本技术顾问已深度融入融媒体直播、拍摄、字幕与硬件设置知识图谱中。你可以自由交谈。
                </p>
              </div>
              <AIConsultant initialTopic="综合" embeddedMode={false} />
            </div>
          )}
        </div>

      </main>

      {/* Campus footer info bar */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1.5">
        <p>© 2026 中国社会科学院大学融媒体社 (UCASS Media Club). All Rights Reserved.</p>
        <p className="flex items-center justify-center gap-1">
          <span>用匠心与实战为每场大型晚会保驾护航</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
        </p>
      </footer>

    </div>
  );
}
