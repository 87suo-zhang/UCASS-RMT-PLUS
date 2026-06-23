/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera, Layers, Settings, HelpCircle, Sliders, ArrowUpRight, CheckCircle2, AlertTriangle, Monitor, Sparkles } from 'lucide-react';
import AIConsultant from './AIConsultant';

export default function CameraModule() {
  // Sony Z190 Virtual Panel State
  const [wbSetting, setWbSetting] = useState<'preset' | 'A' | 'B' | 'atw'>('preset');
  const [presetTemp, setPresetTemp] = useState<3200 | 5600>(5600);
  const [ndFilter, setNdFilter] = useState<'off' | '1/4' | '1/16' | '1/64'>('off');
  const [iris, setIris] = useState<number>(4.0); // F-stop
  const [gain, setGain] = useState<number>(0); // dB
  const [shutter, setShutter] = useState<string>('1/100');

  // Shot position slider for interactive composition guide
  const [subjectX, setSubjectX] = useState<number>(50); // percentage 0-100
  const [subjectY, setSubjectY] = useState<number>(45); // percentage 0-100
  const [headroom, setHeadroom] = useState<number>(50); // head size/height slider

  // Live dynamic simulation states
  const [timecode, setTimecode] = useState('01:14:02:00');
  const [audioCh1, setAudioCh1] = useState(-18);
  const [audioCh2, setAudioCh2] = useState(-16);

  useEffect(() => {
    let frame = 0;
    let sec = 2;
    let min = 14;
    let hr = 1;

    const tcInterval = setInterval(() => {
      frame++;
      if (frame >= 60) {
        frame = 0;
        sec++;
        if (sec >= 60) {
          sec = 0;
          min++;
          if (min >= 60) {
            min = 0;
            hr++;
          }
        }
      }
      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimecode(`${pad(hr)}:${pad(min)}:${pad(sec)}:${pad(frame)}`);
    }, 16.6); // 60 FPS tick

    const audioInterval = setInterval(() => {
      // Bouncing audio meters around -20dB to -3dB
      setAudioCh1(Math.floor(Math.random() * 15) - 18);
      setAudioCh2(Math.floor(Math.random() * 15) - 16);
    }, 150);

    return () => {
      clearInterval(tcInterval);
      clearInterval(audioInterval);
    };
  }, []);

  const getWbDescription = () => {
    switch (wbSetting) {
      case 'preset':
        return presetTemp === 5600 
          ? '室外常用色温块。日光、阴天或普通白色聚光灯推荐，还原真实昼光。'
          : '室内暖色光源常用。金卤灯、普通白炽灯或钨丝舞台灯推荐，避免画面偏橘红。';
      case 'A':
        return '手动白平衡A档（内存。将焦距对准白色卡片/白纸，占满画面，向内拨动镜头前方底部的 WHT BAL 按钮，屏幕提示 [OK] 即完成本次现场自定测白。极其精准。';
      case 'B':
        return '手动白平衡B档（辅助或备用自定）。操作步骤与A档一致，建议在舞台一侧测白，常用于备份不同灯光舞台区域的自适应。';
      case 'atw':
        return '自动追踪白平衡（Auto Tracing WB）。摄像机会自适应外界光改变不断追白。注意：直转播时【严禁开启】，当舞台大面积彩光变幻（如打绿光、红光时），ATW会将红绿彩色强行测定成反白，造成画面主人物面色奇异！';
    }
  };

  const getNdGuidance = () => {
    switch (ndFilter) {
      case 'off':
        return {
          status: '普通照度',
          text: '当前处于通光无损模式。适用于室内低照度或夜晚舞台，光圈 F3.2-F5.6 之间即可。',
          variant: 'success'
        };
      case '1/4':
        return {
          status: '轻微减光 - 衰减2档',
          text: '适度减低强光，适用于140报告厅大聚光灯直射，或者下午云层较厚的室外转播。',
          variant: 'info'
        };
      case '1/16':
        return {
          status: '中度减光 - 衰减4档',
          text: '明显减低强光。舞台上有多组大瓦数LED帕灯、光束灯暴晒，为降噪让开光圈（避免小光圈衍射）时开启。',
          variant: 'warning'
        };
      case '1/64':
        return {
          status: '深度减光 - 衰减6档',
          text: '强力过滤，常在大太阳底下的户外操场校会直转播时使用。可使光圈开大以获得漂亮的景深，或防止雪白过曝。',
          variant: 'danger'
        };
    }
  };

  // Calculate Composition Score based on Subject Coordinates (Target Rule of Thirds Intersection points approx: X=33 or 66, Y=33 or 66)
  const calculateCompositionRating = () => {
    const isXThird = Math.abs(subjectX - 33.3) < 10 || Math.abs(subjectX - 66.6) < 10;
    const isYUpperThird = Math.abs(subjectY - 35) < 10;
    const isCenter = Math.abs(subjectX - 50) < 8;

    if (headroom > 70) {
      return {
        label: '极限越画框特写 (情感爆发常用景别)',
        color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
        tip: '完美！过满构图在融媒体实操中是非常常用、饱含张力的情感表达镜头。当歌手唱到高潮处或主角发言情绪饱满时，用这种过满的绝美特写去卡画面，能够最大化传递五官和眼神里的情绪张力。'
      };
    }
    if (headroom < 25) {
      return {
        label: '头顶空洞 (留白过多)',
        color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        tip: '头顶空出太多无用空地（俗称：吃天花板），构图重心下塌，极为业余。应向上微摇机头，将三分线对准人物眼睛。'
      };
    }

    if (isXThird && isYUpperThird) {
      return {
        label: '黄金分割三分法极佳构图',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        tip: '完美！人物眼神刚好位于黄金切割交汇节点。视线前方留有合理的延伸视觉空间，极具电影感。'
      };
    }
    if (isCenter && isYUpperThird) {
      return {
        label: '标准主持人对称构图',
        color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
        tip: '规范！中间单人对白或新闻宣读的标准构图。左右基本等宽，头顶留有约1拳半距离。'
      };
    }
    
    return {
      label: '普通/随意构图',
      color: 'text-slate-400 border-slate-700 bg-slate-800/40',
      tip: '当前构图位置可以接受，但可以通过微调让眼睛落在上三分之一线条、在两边焦点交叉处停留，提升画面艺术性。'
    };
  };

  const compRating = calculateCompositionRating();

  return (
    <div id="camera_module_container" className="space-y-8 animate-fade-in">
      {/* Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Camera className="w-3.5 h-3.5" />
            <span>摄像机器与参数调节</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">Sony PXW-Z190 直转播实操规程</h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            融媒体社直转播的主力摄像机机型。本模块系统化规范 Sony Z190 的机身按钮调节、曝光三要素平衡、无极测白方法，并搭配动态交互模拟器。
          </p>
        </div>
        <div className="shrink-0 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <div className="text-indigo-400 font-mono text-xs font-semibold uppercase">标准输出制式推荐</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">1080/60p</div>
          <div className="text-[10px] text-slate-500 mt-0.5">社团通用高帧率高清晰度制作标准</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Settings and Simulators */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Interactive Sony Z190 Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                Sony Z190 关键核心参数模拟器
              </h3>
              <span className="text-xs text-slate-400 font-mono">物理控制与菜单复刻</span>
            </div>

            <p className="text-xs text-slate-400">
              提示：点击并拖动参数选项，查看其对转播画面或亮度的实时改变以及社团规范要领。
            </p>

            <div className="space-y-6">
              
              {/* White Balance Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                    1. 测白平衡 (White Balance)
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" title="晚会直播中最最核心防偏色的参数" />
                  </span>
                  <span className="text-xs text-indigo-400 font-semibold font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                    当前: {wbSetting === 'preset' ? `PRESET ${presetTemp}K` : wbSetting.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setWbSetting('preset')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${wbSetting === 'preset' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'}`}
                  >
                    PRESET 预设档
                  </button>
                  <button
                    onClick={() => setWbSetting('A')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${wbSetting === 'A' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'}`}
                  >
                    Memory A 档
                  </button>
                  <button
                    onClick={() => setWbSetting('B')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${wbSetting === 'B' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'}`}
                  >
                    Memory B 档
                  </button>
                  <button
                    onClick={() => setWbSetting('atw')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${wbSetting === 'atw' ? 'bg-red-950/60 border-red-800/80 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'}`}
                  >
                    ATW (自动追踪) ⚠️
                  </button>
                </div>

                {wbSetting === 'preset' && (
                  <div className="flex bg-slate-950 p-2 rounded-lg gap-2 mt-1.5 justify-center">
                    <button
                      onClick={() => setPresetTemp(5605 as any)}
                      className={`text-xs py-1 px-3.5 rounded transition-all cursor-pointer ${presetTemp === 5600 ? 'bg-slate-800 text-amber-200 font-bold border border-slate-700' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      5600K阳光色 (白炽聚光灯、外景)
                    </button>
                    <button
                      onClick={() => setPresetTemp(3200)}
                      className={`text-xs py-1 px-3.5 rounded transition-all cursor-pointer ${presetTemp === 3200 ? 'bg-slate-800 text-amber-500 font-bold border border-slate-700' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      3200K钨丝色 (暖色卤素舞台灯)
                    </button>
                  </div>
                )}

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {getWbDescription()}
                </div>
              </div>

              {/* ND Filter Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">2. 减光镜 (ND Filter Dial)</span>
                  <span className="text-xs text-indigo-400 font-mono font-semibold uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                    减光: {ndFilter === 'off' ? '关 (Clear)' : ndFilter}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['off', '1/4', '1/16', '1/64'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setNdFilter(val as any)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${ndFilter === val ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'}`}
                    >
                      {val === 'off' ? 'Clear' : val}
                    </button>
                  ))}
                </div>
                
                {/* Dynamic guidance box */}
                {(() => {
                  const guidance = getNdGuidance();
                  return (
                    <div className={`p-3.5 rounded-lg border text-xs leading-relaxed flex gap-2 ${
                      guidance.variant === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 
                      guidance.variant === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                      guidance.variant === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 
                      'bg-slate-950 border-slate-800 text-slate-300'
                    }`}>
                      <span className="font-bold whitespace-nowrap">【{guidance.status}】</span>
                      <span>{guidance.text}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Exposure Elements (Iris, Gain, Shutter) */}
              <div className="space-y-4">
                <span className="text-sm font-medium text-slate-200 block">3. 曝光控制三要素</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Iris */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">光圈（Iris）</span>
                      <span className="font-mono text-indigo-400 font-bold">F{iris.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1.9" 
                      max="16" 
                      step="0.5"
                      value={iris}
                      onChange={(e) => setIris(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400 leading-tight">
                      F1.9通光量大，舞台暗可全开；甜点值 F4.0-F5.6 画面最锐；F11以上可能因衍射导致模糊。
                    </div>
                  </div>

                  {/* Gain */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">增益（Gain）</span>
                      <span className="font-mono text-indigo-400 font-bold">{gain} dB</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="18" 
                      step="3"
                      value={gain}
                      onChange={(e) => setGain(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-[10px] space-y-1 mt-1 leading-normal">
                      <p className="text-slate-300 font-extrabold flex items-center gap-1">📢 画面亮度增益演算法解读：</p>
                      {gain === 0 && <p className="text-emerald-400 font-medium">【0dB / L档】基准照度。信噪比极佳，画面无颗粒黑噪。推荐在充足追光/140报告厅强顶灯下锁定使用。</p>}
                      {gain === 3 && <p className="text-emerald-300 font-medium">【3dB / M档】轻微补强。极轻微噪声，几乎不可见。适合舞台光照基本自足、侧翼偏暗时使用。</p>}
                      {gain === 6 && <p className="text-indigo-300">【6dB / M档】适度补偿。暗部隐起微弱灰斑，但不影响播出。适合大型主持、非聚光焦点区修正。</p>}
                      {gain === 9 && <p className="text-amber-300">【9dB / H档】强行补充。暗底大色块开始有些微颗粒噪点，须配合监视器防止主持面面部肤色发枯。</p>}
                      {gain === 12 && <p className="text-amber-500 font-semibold">【12dB / 预警线】增益上限。噪点雪花明显增加。此时建议宁亏点曝光也别强行往上硬加档。</p>}
                      {gain === 15 && <p className="text-rose-400 font-bold">【15dB / 严卡】明显劣化。彩色像素碎屑遍及全画框，会严重影响画质细节，后期降噪无法挽救。</p>}
                      {gain === 18 && <p className="text-red-500 font-extrabold animate-pulse">【18dB / 警戒崩坏】彩色满天飞！严禁在直转播中使用此档位，请通知舞美/主光灯老师开亮射灯！</p>}
                      <p className="text-[9px] text-slate-500 italic mt-1 font-mono leading-tight">（注：电子增益每 +6dB 亮度翻倍。直播中【严禁使用 AGC 自动增益】以防画面呼吸感忽亮忽暗）</p>
                    </div>
                  </div>

                  {/* Shutter */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">快门（Shutter）</span>
                      <span className="font-mono text-indigo-400 font-bold">{shutter}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {['1/50', '1/100', '1/250'].map((val) => (
                        <button
                          key={val}
                          onClick={() => setShutter(val)}
                          className={`py-1 text-[10px] rounded border transition-all cursor-pointer ${shutter === val ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200' : 'bg-slate-900 border-slate-850 text-slate-400'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight pt-1">
                      {shutter === '1/100' ? '✅ 140报告厅大屏幕防频闪首选。' : shutter === '1/50' ? '标准对齐偏暗，但舞台上有LED大屏时容易频闪，不推荐。' : '光线充足、有剧烈运动时可选。'}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Interactive Composition Guide */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-indigo-400" />
                视听语言：多机位构图安全格模拟
              </h3>
              <span className="text-xs text-slate-400 font-mono">动眼比对</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Composition Interactive Canvas Area */}
              <div id="composition_interactive_canvas" className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden relative aspect-video flex items-center justify-center shadow-inner">
                
                {/* 140 Presentation Hall Stage Light Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1122] via-[#0b0c16] to-[#07080f] pointer-events-none overflow-hidden select-none">
                  {/* Subtle Grid Floor */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  {/* Outer Stage Curtains (Deep red/purple gradient blur) */}
                  <div className="absolute -inset-x-20 top-0 bottom-0 bg-gradient-to-r from-red-950/10 via-transparent to-red-950/10 blur-xl"></div>
                  
                  {/* Left Spotlight cone */}
                  <div className="absolute top-0 left-[20%] w-[120px] h-full bg-gradient-to-b from-amber-500/10 via-transparent to-transparent -rotate-15 transform origin-top blur-xl"></div>
                  {/* Right Spotlight cone */}
                  <div className="absolute top-0 right-[20%] w-[120px] h-full bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent rotate-15 transform origin-top blur-xl"></div>
                  
                  {/* Soft floor reflection backdrop glow */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-indigo-500/20 via-purple-500/5 to-transparent blur-md"></div>
                  
                  {/* Small "140 Presentation Hall" Badge backdrop indicator */}
                  <div className="absolute bottom-2 left-3 text-[7px] text-slate-600 font-mono tracking-widest uppercase opacity-40">
                    140 REPORT HALL • STAGE CENTER
                  </div>
                </div>

                {/* Grid Lines of Thirds */}
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none z-10">
                  <div className="border-r border-dashed border-slate-700/40 h-full"></div>
                  <div className="border-r border-dashed border-slate-700/40 h-full"></div>
                </div>
                <div className="absolute inset-0 grid grid-rows-3 pointer-events-none z-10">
                  <div className="border-b border-dashed border-slate-700/40 w-full"></div>
                  <div className="border-b border-dashed border-slate-700/40 w-full"></div>
                </div>

                {/* Safe Frame Overlays: Brackets */}
                <div className="absolute inset-4 border border-slate-800/60 pointer-events-none rounded z-10">
                  {/* Corner bracket dashes for cinematic display */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-500/70"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-500/70"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-500/70"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500/70"></div>
                </div>

                {/* Center crosshair */}
                <div className="absolute w-6 h-6 flex items-center justify-center pointer-events-none z-10 opacity-60">
                  <div className="absolute w-3 h-0.5 bg-slate-500"></div>
                  <div className="absolute w-0.5 h-3 bg-slate-500"></div>
                  <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                </div>

                {/* Simulated Subject (Presenter avatar) - Vector & Fully Proportioned */}
                <div 
                  className="absolute transition-all duration-200 pointer-events-none flex flex-col items-center z-10"
                  style={{ 
                    left: `${subjectX}%`, 
                    top: `${subjectY}%`, 
                    transform: 'translate(-50%, -24%)', 
                    width: `${(headroom * 3.5) + 30}px`,
                  }}
                >
                  {/* Eye level guidelines across the screen */}
                  <div className="absolute top-[28%] -left-[1000px] -right-[1000px] border-t border-dashed border-pink-500/30 pointer-events-none flex justify-between px-[1010px]">
                    <span className="text-[7px] bg-slate-950/90 text-pink-400 px-1 py-0.5 rounded -translate-y-2.5 font-mono tracking-tighter">EYE LEVEL (推荐视平线)</span>
                  </div>

                  {/* SVG Presenter Silhouette */}
                  <svg 
                    viewBox="0 0 120 120" 
                    className="w-full drop-shadow-[0_8px_24px_rgba(30,27,75,0.8)] filter transition-all duration-200"
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Upper back-hair shadow */}
                    <path d="M45,15 C45,5 75,5 75,15 C85,15 85,38 75,38 C60,40 60,40 45,38 C35,38 35,15 45,15 Z" fill="#1e1b4b" />
                    
                    {/* Face / Jaw */}
                    <path d="M42,26 C42,16 78,16 78,26 C78,38 72,48 60,48 C48,48 42,38 42,26 Z" fill="#2d3748" stroke="#4f46e5" strokeWidth="1" />
                    
                    {/* Hair strands front */}
                    <path d="M42,18 C48,10 72,10 78,18 C72,12 48,12 42,18 Z" fill="#1e1b4b" />
                    
                    {/* Ears */}
                    <ellipse cx="40" cy="28" rx="2" ry="3" fill="#1e1b4b" />
                    <ellipse cx="80" cy="28" rx="2" ry="3" fill="#1e1b4b" />

                    {/* Highly Professional Cam Target Face Markings (E.g. Eyes overlay) */}
                    <g className="opacity-95">
                      {/* Left Eye & pupil */}
                      <ellipse cx="51" cy="28" rx="3" ry="3.5" fill="#0f172a" />
                      <circle cx="51.5" cy="27.5" r="0.8" fill="#ffffff" />
                      
                      {/* Right Eye & pupil */}
                      <ellipse cx="69" cy="28" rx="3" ry="3.5" fill="#0f172a" />
                      <circle cx="69.5" cy="27.5" r="0.8" fill="#ffffff" />
                      
                      {/* Eyebrows */}
                      <path d="M46,23 Q51,20 56,24" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M64,24 Q69,20 74,23" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />

                      {/* Smile face */}
                      <path d="M54,38 Q60,42 66,38" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </g>

                    {/* Neck */}
                    <rect x="55" y="44" width="10" height="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />

                    {/* Blazer Suit */}
                    <path d="M22,57 C12,85 8,118 8,118 L112,118 C112,118 108,85 98,57 C90,48 30,48 22,57 Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2" />
                    
                    {/* White Shirt Collar */}
                    <path d="M46,55 L60,78 L74,55 Z" fill="#f8fafc" />
                    
                    {/* Elite Red Necktie */}
                    <path d="M56,66 L64,66 L66,88 L60,110 L54,88 Z" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.8" />
                    <polygon points="56,66 64,66 60,55" fill="#991b1b" />

                    {/* Microphone on Lapel */}
                    <circle cx="34" cy="68" r="1.5" fill="#020617" />
                    <line x1="34" y1="68" x2="38" y2="76" stroke="#020617" strokeWidth="0.8" />
                  </svg>
                </div>

                {/* Viewfinder OSD Overlays (Highly Aesthetic HUD) */}
                <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between font-mono text-[9px] z-20">
                  
                  {/* Top Row HUD */}
                  <div className="flex justify-between items-start">
                    {/* Top Left: REC Status */}
                    <div className="flex flex-col gap-0.5 bg-slate-950/75 p-1 rounded border border-slate-800/40">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-red-500 font-bold uppercase tracking-wider">● REC</span>
                      </div>
                      <div className="text-slate-300">CARD A: 124 MIN</div>
                    </div>

                    {/* Top Right: Timecode and Power */}
                    <div className="flex flex-col gap-0.5 items-end bg-slate-950/75 p-1 rounded border border-slate-800/40">
                      <div className="text-indigo-300 font-bold tracking-widest text-[9px]">
                        TC {timecode}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1 rounded flex items-center gap-0.5">
                          [▰▰▰▰░] 78%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row HUD */}
                  <div className="flex items-end justify-between">
                    
                    {/* Bottom Left: Physical Lens Parameters */}
                    <div className="flex flex-col gap-0.5 bg-slate-950/75 p-1 rounded border border-slate-800/40">
                      <div className="flex gap-2">
                        <span className="text-slate-400">IRIS: <strong className="text-white">F{iris.toFixed(1)}</strong></span>
                        <span className="text-slate-400">SHT: <strong className="text-white">{shutter}</strong></span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">GAIN: <strong className="text-white">{gain}dB</strong></span>
                        <span className="text-slate-400">ND: <strong className="text-yellow-400">{ndFilter === 'off' ? 'CLEAR' : ndFilter}</strong></span>
                      </div>
                    </div>

                    {/* Bottom Right: Stereo Bouncing Audio Level Bar */}
                    <div className="flex flex-col gap-1 bg-slate-950/75 p-1 rounded border border-slate-800/40 w-[95px] items-end">
                      <div className="text-right text-[7px] text-indigo-300 font-bold uppercase tracking-wider">AUDIO CH1/2</div>
                      
                      {/* Audio Meter 1 */}
                      <div className="w-full flex items-center gap-1">
                        <span className="text-[7px] text-slate-500">L</span>
                        <div className="flex-1 h-1 bg-slate-850 rounded-xs overflow-hidden flex gap-[0.5px]">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const dbVal = -24 + i * 2;
                            const isActive = audioCh1 > dbVal;
                            const colorClass = dbVal > -6 ? 'bg-red-500' : dbVal > -12 ? 'bg-yellow-500' : 'bg-emerald-400';
                            return (
                              <div 
                                key={i} 
                                className={`h-full flex-1 transition-all duration-700 ${isActive ? colorClass : 'bg-slate-900'}`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Audio Meter 2 */}
                      <div className="w-full flex items-center gap-1">
                        <span className="text-[7px] text-slate-500">R</span>
                        <div className="flex-1 h-1 bg-slate-850 rounded-xs overflow-hidden flex gap-[0.5px]">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const dbVal = -24 + i * 2;
                            const isActive = audioCh2 > dbVal;
                            const colorClass = dbVal > -6 ? 'bg-red-500' : dbVal > -12 ? 'bg-yellow-500' : 'bg-emerald-400';
                            return (
                              <div 
                                key={i} 
                                className={`h-full flex-1 transition-all duration-700 ${isActive ? colorClass : 'bg-slate-900'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="absolute top-2 left-1/3 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono tracking-wider z-20">
                  PVW - 140报告厅画面安全框 (90%)
                </div>
              </div>

              {/* Sliders for composition adjustment */}
              <div className="md:col-span-5 space-y-4">
                <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">画面机位微调</span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>左右轴摇推 (Pan - X)</span>
                      <span className="font-mono text-slate-300">{subjectX}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="80" 
                      value={subjectX} 
                      onChange={(e) => setSubjectX(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>上下摇机首 (Tilt - Y)</span>
                      <span className="font-mono text-slate-300">{subjectY}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="60" 
                      value={subjectY} 
                      onChange={(e) => setSubjectY(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>人物距离/特写尺寸 (Headroom)</span>
                      <span className="font-mono text-slate-300">{headroom}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="85" 
                      value={headroom} 
                      onChange={(e) => setHeadroom(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${compRating.color}`}>
                  <div className="font-bold flex items-center gap-1">
                    <span>💡 评级：{compRating.label}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">{compRating.tip}</p>
                </div>
              </div>

            </div>

            {/* Audiovisual Language (视听语言极速卡片) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <div className="bg-slate-950 p-4 border border-slate-800/85 rounded-lg space-y-2">
                <span className="text-xs font-semibold text-indigo-400">🎥 晚会大景别原则：</span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>全景 (极速保底位)：负责记录主持或整舞场景，放在 PVW 备份。</li>
                  <li>中景 (叙事位)：卡在主持人膝盖以上，保证手势、台风清晰。</li>
                  <li>近景 (情感位)：胸部以上，主歌手、重点人物发言特写。</li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-800/85 rounded-lg space-y-2">
                <span className="text-xs font-semibold text-indigo-400">⚠️ 摄像操作四大铁律：</span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>禁止 ATW 自动白平衡</li>
                  <li>禁止随意的忽快忽慢推拉镜头（慢推慢拉才好切）</li>
                  <li>宁愿欠曝一点，千万不能过曝（曝光死，没有细节）</li>
                  <li>严禁擅自转动镜头机头。任何移动或调整需听从导播耳机呼叫！</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Connection Tutorial & Switcher Configuration */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-indigo-400" />
              如何连接 摄像机 与 时代奥视切换台
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850">
                <div className="w-1.5 h-auto bg-indigo-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold text-slate-200">物理物理排线与接头 (SDI 最优)</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    1. 将 Z190 摄像机后部的 **SDI OUT** 接头旋转扭入 SDI 实屏蔽线缆的一端（拧紧卡扣）。<br />
                    2. 将另一端接入时代奥视 OSSE ISO 8 切换台背面的编号输入口（如, SDI 1-4 输入端。如用 HDMI 信号，需自配 HDMI-to-SDI 转换盒子，否则长距离大于 15 米信号易中断断连。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850">
                <div className="w-1.5 h-auto bg-amber-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold text-slate-200">制式频率必做对齐（最易出错：出现无量黑屏）</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    1. 【摄像机端设置】：长按 Z190 [MENU] 按键 ➔ 找到 [SYSTEM] ➔ [REC FORMAT] 选 **1080/60p**。<br />
                    2. 【切换台端配置】：在 switcher 菜单中，把 Master Format 及各路 Input Format 全部统一设为 **1080/60p**。<br />
                    由于社团制作格式采用高帧率全逐行扫描 **1080/60p**，若由于一端误设为 1080/50i 或 1080/25p，切换台内部倍频与场同步失配，必然导致信号丢失且完全黑屏。必须完全对齐！
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850">
                <div className="w-1.5 h-auto bg-violet-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold text-slate-200">🚀 现场流动游机 稳定器/图传规范</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    社团游机标准配置：**手持三轴稳定器 + 轻量级单反/微单相机 ➔ 挂载无线视频图传（如猛玛/威固）➔ 信号传回导播切换台**。<br />
                    1. 【图传参数】：相机输出分辨率务必强锁 **1080/60p**（切勿设为 Auto/1080/25p），图传发射机采用同一格式传输视频。<br />
                    2. 【天线升空】：图传接收机应使用魔术手臂固定于导播台一侧的灯光架或支架高处（离地至少2米），避开人群肉体吸收电磁波，维持空旷的视距（LOS）传输。<br />
                    3. 【机位运动】：游机摄像师配戴低延时全双工无线通话，在140报告厅或活动中心内机动走位时，前推、后拉、环绕大范围走动要平顺，预备起跑时提前知会导播，确保图传天线对齐、不出现瞬时雪花或断联。
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Embedded Gemini AI Assistant */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-2 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="text-slate-300">
              我是为中国社会科学院大学融媒体社定制的摄像顾问，向我提出任何 Sony Z190 的参数、菜单或者实战排爆疑问！
            </p>
          </div>
          <AIConsultant initialTopic="摄像" embeddedMode={false} />
        </div>

      </div>
    </div>
  );
}
