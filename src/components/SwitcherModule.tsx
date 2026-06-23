/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Monitor, Cpu, HelpCircle, Activity, Sparkles, AlertTriangle, Play, RefreshCw, Scissors, Zap, ShieldAlert, CheckCircle } from 'lucide-react';
import AIConsultant from './AIConsultant';

export default function SwitcherModule() {
  // Switcher State
  const [pgmActive, setPgmActive] = useState<number>(1); // PGM channel active (1-8)
  const [pvwActive, setPvwActive] = useState<number>(2); // PVW channel active (1-8)
  const [transitionStyle, setTransitionStyle] = useState<'cut' | 'fade' | 'slide'>('cut');
  const [tBarValue, setTBarValue] = useState<number>(0); // 0 (pvw ready) to 100 (pgm swapped)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [switcherLog, setSwitcherLog] = useState<string>("时代奥视 OSSE ISO 8 切换台已就绪。");

  // Selected Emergency Handbook Tab
  const [selectedDisaster, setSelectedDisaster] = useState<string>('black_screen');

  // Trigger CUT transition swapping PVW and PGM
  const triggerCut = () => {
    if (isTransitioning) return;
    const oldPgm = pgmActive;
    const oldPvw = pvwActive;

    setSwitcherLog(`[CUT] 瞬切操作：机位 ${oldPgm} ➡️ 机位 ${oldPvw}。零延时切换。`);
    setPgmActive(oldPvw);
    setPvwActive(oldPgm);
  };

  // Trigger AUTO transition (simulating transition duration)
  const triggerAuto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSwitcherLog(`[AUTO] 特技转场启动：正在以 ${transitionStyle === 'fade' ? '混叠淡入淡出' : '划像'} 切换中...`);
    
    // Simulate T-Bar movement
    let i = 0;
    const timer = setInterval(() => {
      i += 10;
      setTBarValue(i);
      if (i >= 100) {
        clearInterval(timer);
        const oldPgm = pgmActive;
        const oldPvw = pvwActive;
        setPgmActive(oldPvw);
        setPvwActive(oldPgm);
        setTBarValue(0);
        setIsTransitioning(false);
        setSwitcherLog(`[AUTO EFFECT] 转场完成：当前输出 PGM 为 ${oldPvw} 机位。`);
      }
    }, 40);
  };

  // Handle T-Bar sliding simulation manually
  const handleTBarSlide = (val: number) => {
    setTBarValue(val);
    if (val === 100) {
      const oldPgm = pgmActive;
      const oldPvw = pvwActive;
      setPgmActive(oldPvw);
      setPvwActive(oldPgm);
      setTBarValue(0);
      setSwitcherLog(`[T-BAR MANUAL] 手动拉杆切换：PGM 更新为原 ${oldPvw} 机位。`);
    } else if (val > 0) {
      setSwitcherLog(`[T-BAR] 手动拉杆变焦对齐中 (${val}%)...`);
    }
  };

  const getSourceLabel = (id: number) => {
    switch (id) {
      case 1: return 'CAM1 (舞台固定远景)';
      case 2: return 'CAM2 (舞台移动特写)';
      case 3: return 'CAM3 (主持人叙事中景)';
      case 4: return 'CAM4 (摇臂/游机辅助位)';
      case 5: return 'vMix (字幕上屏上叠加色)';
      case 6: return 'PPT (观众席大屏幻灯)';
      case 7: return 'PVW-7 (备用线路7)';
      case 8: return 'AUX (暖场视频循环播放)';
      default: return `INPUT ${id}`;
    }
  };

  const DISASTER_HANDBOOK = {
    black_screen: {
      title: "某一机位瞬间黑屏（无信号输入）",
      signs: "切换台多画面分割器（Multiview）上对应输入方框变全黑，或显示红色 [NO SIGNAL] / [LOST SYNC] 条纹。",
      remedies: [
        "1. 【底线保底原则】：禁止切往该黑屏机位！若黑屏机位正在 PGM 输出中，导播必须以闪电般速度瞬间拍击【1键】或【AUX键】强制切回‘安全舞台大远景全景’，避免播出事故。",
        "2. 【内通话呼叫】：呼叫对应机位摄像师：‘X号机，你的画面黑了！排查下是摄像机断电、还是 SDI 线头松脱？’",
        "3. 【物理连线复位】：如果摄像机有电，立刻重新插拔摄像机侧 SDI 接口与切换台对应通道。若仍无信号，检查机器端输出格式是否因误触变为了其他低帧率（如 1080/50i 或 1080/25p），须调回 1080/60p 匹配系统。"
      ],
      prevent: "开演前1小时，使用扎带将摄像机的所有 SDI 线缆、电源线进行防扯拉环装固定，严防现场观众不小心踢倒或拉拽线缆。"
    },
    audio_howl: {
      title: "现场音响产生巨大啸叫声/电流麦克音",
      signs: "音响发出极度刺耳的啸叫（Feedback loop），或者给切换台的音轨电平指示条直接爆红（Over-Clip），导致耳机监听到剧烈电流音。",
      remedies: [
        "1. 【降噪急救针】：在切换台控制面板的音频控制一栏，快速找到 Line-In 音量推子，向下拉低 12dB，或直接点击 麦克风 MUTE 按钮一键静音转播流音频，换成 PGM 备用背景音乐垫音。",
        "2. 【对讲调音台】：通过对讲呼叫舞台侧调音组：‘调音台，给转播的 XLR 音频输出爆红了，且有啸叫，请迅速在AUX输出端压限或拉低混响麦克电平。’",
        "3. 【降噪自适应】：待啸叫稳定后，缓缓推回音量推子，监视峰值维持在安全黄绿线（-6dB 至 -12dB 之间）。"
      ],
      prevent: "摄像机切忌将自带的话筒电平调至 Auto Gain，应设为 Manual 且保持在 20% 通道，或全部从外部调音台走卡侬平衡线统筹输入。"
    },
    switcher_freeze: {
      title: "时代奥视 osse iso 8 物理切换台系统死机、图像定格",
      signs: "所有按键灯常亮或熄灭，按下 CUT/PGM 键全无响应，操作旋钮没动静，液晶屏卡死不动。",
      remedies: [
        "1. 【副导播应急替代】：若有外接的 vMix 副切主机担任备用节点，副导播迅速通过分配器（Matrix）将流推送源切到 vMix 本地 PGM 应急输出（播放循环垫片视频）。",
        "2. 【强行热复位】：让现场助理在导播桌侧面摸到 OSSE 开关阀，迅速关掉，等待 5 秒钟后【重新开机】。时代奥视切换台硬件是非系统化微控制级架构，15秒内即可复启动复位同步信号。",
        "3. 【重置输入总控】：检查供电电压是否因140报告厅大功率灯光启动导致电压不稳击穿，启动备用 220V UPS 电池续命。"
      ],
      prevent: "导播主机电插头必须插在独立的 UPS 不间断电源上，不与其他高瓦数返听音箱或舞台射灯共用同一排拖线板。"
    },
    ppt_mismatch: {
      title: "大屏幕 PPT 幻灯片临时加塞，且比例拉伸变形",
      signs: "宣读PPT环节，选手临时拷过来由 16:9 变成了 4:3 比例，切换台显示边缘被切，文字无法完全出框。",
      remedies: [
        "1. vMix 快速调控：字幕机组选手迅速双击该路电脑输入（PPT Capture），进入 [Input Options] - [Position]。",
        "2. 修改比例（Aspect）：在宽高轴中输入 1.33 或点击 Stretch 自适应铺满，或调整 [Aspect Ratio] 为 16:9，使背景带黑色留白条，主文字完整居中保留。",
        "3. 特写机位托底：告知3号特写机摄像，如果幻灯片看不清，立刻拉远变焦框，将舞台一侧大屏幕全部框入实体特写构图中作为辅图输出。"
      ],
      prevent: "在晚会初审及前两次彩排中，设立硬性规范：所有选手的伴奏PPT一律强制提交 1920x1080 MP4 / Sizing PDF 格式，拒绝过时的 4:3 比例文件。"
    }
  };

  return (
    <div id="switcher_module_container" className="space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Monitor className="w-3.5 h-3.5" />
            <span>导播切换与多机位策略</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">时代奥视 OSSE ISO 8 切换台排布与实操方案</h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            提供直观的硬件板面实操模拟器，辅以融媒体社团经典迎新晚会的多机位（全景/中景/特写）画面切换心法、安全救火防断连应急处置规程。
          </p>
        </div>
        <div className="shrink-0 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <div className="text-indigo-400 font-mono text-xs font-semibold uppercase">切镜主法门</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">动接动・静接静</div>
          <div className="text-[10px] text-slate-500 mt-0.5">呼吸感切镜，绝不停滞画面</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Switcher Simulator + Checklists */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* OSSE ISO 8 Interactive Switcher Desk Simulation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-indigo-400" />
                硬件板面模拟：OSSE ISO 8 核心控制键位
              </h3>
              <span className="text-xs text-slate-400 font-mono tracking-wider">Multi-Format Switcher</span>
            </div>

            {/* Virtual Split-view Monitoring Panel */}
            <div className="bg-slate-950 border-2 border-slate-850 rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-3 relative overflow-hidden">
              <div className="absolute top-1 left-2 text-[8px] text-indigo-400 font-mono">
                MULTIVIEW 1080/60P 分割画面监视
              </div>
              
              {/* Box 1 (CAM 1) */}
              <div className={`p-2 rounded border aspect-video flex flex-col justify-between relative ${pgmActive === 1 ? 'border-red-600 bg-red-950/20' : pvwActive === 1 ? 'border-emerald-600 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/40'}`}>
                <span className="text-[9px] font-mono font-bold text-slate-400">CH1 CAM1舞台全景</span>
                <span className="text-[7px] text-slate-500">固定定海神针位</span>
                {pgmActive === 1 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-red-600 text-white rounded font-bold animate-pulse">PGM</span>}
                {pvwActive === 1 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-emerald-600 text-white rounded font-bold">PVW</span>}
              </div>

              {/* Box 2 (CAM 2) */}
              <div className={`p-2 rounded border aspect-video flex flex-col justify-between relative ${pgmActive === 2 ? 'border-red-600 bg-red-950/20' : pvwActive === 2 ? 'border-emerald-600 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/40'}`}>
                <span className="text-[9px] font-mono font-bold text-slate-400">CH2 CAM2特写游机</span>
                <span className="text-[7px] text-slate-500">缓推慢拉大倍焦点</span>
                {pgmActive === 2 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-red-600 text-white rounded font-bold animate-pulse">PGM</span>}
                {pvwActive === 2 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-emerald-600 text-white rounded font-bold">PVW</span>}
              </div>

              {/* Box 3 (CAM 3) */}
              <div className={`p-2 rounded border aspect-video flex flex-col justify-between relative ${pgmActive === 3 ? 'border-red-600 bg-red-950/20' : pvwActive === 3 ? 'border-emerald-600 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/40'}`}>
                <span className="text-[9px] font-mono font-bold text-slate-400">CH3 CAM3主持人中景</span>
                <span className="text-[7px] text-slate-500">人物叙事三分线对齐</span>
                {pgmActive === 3 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-red-600 text-white rounded font-bold animate-pulse">PGM</span>}
                {pvwActive === 3 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-emerald-600 text-white rounded font-bold">PVW</span>}
              </div>

              {/* Box 4 (vMix) */}
              <div className={`p-2 rounded border aspect-video flex flex-col justify-between relative ${pgmActive === 5 ? 'border-red-600 bg-red-950/20' : pvwActive === 5 ? 'border-emerald-600 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/40'}`}>
                <span className="text-[9px] font-mono font-bold text-slate-400">CH5 vMix字幕层</span>
                <span className="text-[7px] text-slate-500">透明卡扣 NDI 叠层</span>
                {pgmActive === 5 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-red-600 text-white rounded font-bold animate-pulse">PGM</span>}
                {pvwActive === 5 && <span className="absolute bottom-1 right-1 px-1 text-[7px] bg-emerald-600 text-white rounded font-bold">PVW</span>}
              </div>
            </div>

            {/* Current Outputs monitor */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 px-4 py-3 rounded-lg border border-slate-850">
              <div className="text-center p-2 rounded bg-slate-900/60 border border-slate-800 relative">
                <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">PGM 主输出 (当前公网正在观看)</span>
                <p className="text-xs font-semibold text-slate-100 mt-1">{getSourceLabel(pgmActive)}</p>
              </div>
              <div className="text-center p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">PVW 备看 (下一个准备切入画面)</span>
                <p className="text-xs font-semibold text-slate-200 mt-1">{getSourceLabel(pvwActive)}</p>
              </div>
            </div>

            {/* The Switcher Physical Rails Panel layout */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
              
              {/* PGM Rail (Red buttons for Program output) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-red-400 font-semibold tracking-widest uppercase">
                  <span>🔴 PROGRAM RAIL (主输出总控排键位)</span>
                  <span>PGM</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                    <button
                      key={id}
                      onClick={() => setPgmActive(id)}
                      className={`py-3.5 rounded text-xs font-black font-mono transition-all flex flex-col items-center justify-center cursor-pointer border ${pgmActive === id ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/35 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      <span>{id}</span>
                      <span className="text-[7px] opacity-70 mt-0.5">{id === 1 ? 'CAM1' : id === 2 ? 'CAM2' : id === 3 ? 'CAM3' : id === 5 ? 'vMix' : `CH${id}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PVW Rail (Green buttons for Preset visual/next in line) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
                  <span>🟢 PREVIEW RAIL (预监选键排键位)</span>
                  <span>PVW</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                    <button
                      key={id}
                      onClick={() => setPvwActive(id)}
                      className={`py-3.5 rounded text-xs font-black font-mono transition-all flex flex-col items-center justify-center cursor-pointer border ${pvwActive === id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/35' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      <span>{id}</span>
                      <span className="text-[7px] opacity-70 mt-0.5">{id === 1 ? 'CAM1' : id === 2 ? 'CAM2' : id === 3 ? 'CAM3' : id === 5 ? 'vMix' : `CH${id}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Transition controls + T-Bar side by side */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-slate-850">
                
                {/* Mode Selector and Buttons */}
                <div className="md:col-span-8 space-y-4">
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">特技样式 (Fader Mode)</span>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-905 p-1 rounded-lg border border-slate-850">
                        {(['cut', 'fade', 'slide'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setTransitionStyle(style)}
                            className={`py-1 text-[10px] font-bold rounded capitalize cursor-pointer transition-colors ${transitionStyle === style ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-400/20' : 'text-slate-500 hover:text-slate-400'}`}
                          >
                            {style === 'cut' ? '硬切' : style === 'fade' ? '画中叠' : '划像'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={triggerCut}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95"
                    >
                      <Scissors className="w-4 h-4" /> CUT / 瞬切对切
                    </button>
                    <button
                      onClick={triggerAuto}
                      disabled={isTransitioning}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95"
                    >
                      <Zap className="w-4 h-4" /> AUTO / 自动特技转场
                    </button>
                  </div>
                </div>

                {/* Hand Action T-Bar Slider */}
                <div className="md:col-span-4 bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col justify-between items-center text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">手动切换杆 (T-Bar)</span>
                  
                  {/* Slider rail represented vertically */}
                  <div className="relative w-7 h-24 bg-slate-950 border border-slate-800 rounded-lg flex justify-center py-2 mt-1.5">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={tBarValue}
                      onChange={(e) => handleTBarSlide(parseInt(e.target.value))}
                      className="accent-red-500 cursor-ns-resize h-full vertical-range"
                      style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
                    />
                  </div>

                  <span className="text-[10px] font-mono mt-1 text-slate-400 font-bold">{tBarValue}%</span>
                </div>

              </div>

            </div>

            {/* Switcher System logging terminal */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Activity className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-300">
                  {switcherLog}
                </span>
              </div>
              <button 
                onClick={() => {
                  setPgmActive(1);
                  setPvwActive(2);
                  setSwitcherLog("重置切换台成功：1号全景设为PGM，2号特写设为PVW。");
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                title="重启复位"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Emergency Handbook (应急方案交互手册) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
                直转播事故排爆：现场应急方案掌上手册
              </h3>
              <span className="text-xs text-red-400 bg-red-400/10 border border-red-500/20 px-2 py-0.5 rounded font-mono font-medium">救火必备</span>
            </div>

            <p className="text-xs text-slate-400">
              提示：晚会直转播最讲究零失误，一旦出现瞬时事故，点击左侧异常卡，右侧可查看秒级应急急救流程以及后续排查手段。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Disaster List Tabs */}
              <div className="md:col-span-5 space-y-2">
                {Object.entries(DISASTER_HANDBOOK).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDisaster(key)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      selectedDisaster === key 
                        ? 'bg-red-950/30 border-red-500/50 text-red-200 font-semibold' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>{value.title}</span>
                    <span className="text-[10px] text-red-500 shrink-0 select-none">🚨 触发</span>
                  </button>
                ))}
              </div>

              {/* Disaster Remedies instructions panel */}
              {(() => {
                const handbookData = DISASTER_HANDBOOK[selectedDisaster as keyof typeof DISASTER_HANDBOOK];
                return (
                  <div className="md:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3.5">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">故障表征：</span>
                      <p className="text-xs text-red-300 font-medium leading-relaxed italic mt-0.5">{handbookData.signs}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">⚡ 瞬时应急手段 (秒级响应流程)：</span>
                      <div className="space-y-2">
                        {handbookData.remedies.map((step, i) => (
                          <div key={i} className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-850">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-850 pt-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        预防机制（大片起底）：
                      </span>
                      <p className="mt-1 leading-relaxed">{handbookData.prevent}</p>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Directing Switching Principles Card */}
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-2">
              <span className="text-xs font-semibold text-indigo-400">🎬 融媒体直转播多机位切镜法门：</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. **动接动・静接静**：正在向左推镜头或推近的画面，绝不可立刻对接到另一个正在旋转摇推的画面，否则会产生强烈眩晕感；要切，等其中一端镜头停稳（变静），或者在歌词乐理小节奏高潮处顺应切过去。<br />
                2. **同轴严防大跳跃**：严禁把 1号机（歌手特写）切到 2号机（同轴方向，歌手更窄特写）。两个相连镜头的视轴夹角必须大于 30度，或有着极其明显的景别大小变化（如：巨变全景），否则属于“穿帮越轴跳切”。
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Embedded Consulting specifically tailored to Switcher queries */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-2 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="text-slate-300">
              我是为中国社会科学院大学融媒体社定制的导播顾问，你可以随时向我提问关于 时代奥视 ISO 8 的连线匹配参数、多机位构图配合和现场大事故救火方案！
            </p>
          </div>
          <AIConsultant initialTopic="导播" embeddedMode={false} />
        </div>

      </div>
    </div>
  );
}
