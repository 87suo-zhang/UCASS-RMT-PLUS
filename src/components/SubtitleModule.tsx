/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Database, Sparkles, Play, Rewind, Check, RefreshCw, Layers, Keyboard, AlertCircle, ArrowRight } from 'lucide-react';
import AIConsultant from './AIConsultant';

interface SubtitleLine {
  id: number;
  cueTime: number; // in seconds relative to start
  text: string;
  name: string;
}

const MOCK_STAGE_SCRIPT: SubtitleLine[] = [
  { id: 1, cueTime: 3, name: "主持人1", text: "大家晚上好！欢迎来到中国社会科学院大学 融媒体迎新晚会现场。" },
  { id: 2, cueTime: 8, name: "主持人2", text: "我是今天的主持人陆融，正代表社团向各位学子致以最诚挚的问候。" },
  { id: 3, cueTime: 14, name: "主持人1", text: "今晚我们将进行全网多平台多机位直转播，这离不开台前幕后的默契。" },
  { id: 4, cueTime: 20, name: "主持人2", text: "首先，让我们用最热烈的掌声，欢迎校合唱团为我们带来开场曲目——《青春之歌》！" },
  { id: 5, cueTime: 26, name: "系统指示", text: "【演出人员下场，灯光切蓝，合唱队就位。切3号机全身，切近景】" }
];

export default function SubtitleModule() {
  // Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeSubIndex, setActiveSubIndex] = useState<number>(-1); // Live current text being pushed
  const [successLogs, setSuccessLogs] = useState<{ id: string; msg: string; rating: 'cool' | 'good' | 'late' | 'early' }[]>([]);
  const [score, setScore] = useState<number>(100);
  const [stageLog, setStageLog] = useState<string>("点击‘开始模拟演练’以进入晚会现场字幕推送操控");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop/Start simulation
  const startSimulation = () => {
    setIsPlaying(true);
    setCurrentTime(0);
    setActiveSubIndex(-1);
    setSuccessLogs([]);
    setScore(100);
    setStageLog("晚会大幕拉开！音频台倒计时中... 演员准备发言！在黄灯亮起（对应台词读秒）时，迅速敲击【推送下一条(SPACER)】键绑定字幕");
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentTime(0);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = Math.round((prev + 0.1) * 10) / 10;
          if (nextTime >= 30) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            setStageLog("演练圆满结束！检查下方的对齐准确率，你可以刷新重新挑战。");
            return 30;
          }
          return nextTime;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Handle Manual Subtitle Tricking (Shortcuts/Spec key clicking)
  const triggerNextSubtitle = () => {
    if (!isPlaying) return;
    
    // Find what should be triggerable next
    const nextIndex = activeSubIndex + 1;
    if (nextIndex >= MOCK_STAGE_SCRIPT.length) {
      setStageLog("数据包已推空！所有台本字幕已加载完毕。");
      return;
    }

    const currentLine = MOCK_STAGE_SCRIPT[nextIndex];
    // Calculate deviation margin
    const deviation = currentTime - currentLine.cueTime;
    let rating: 'cool' | 'good' | 'late' | 'early' = 'good';
    let ratingText = '';
    let scoreCut = 0;

    if (Math.abs(deviation) <= 0.6) {
      rating = 'cool';
      ratingText = '同步极佳！误差超低';
    } else if (deviation < -0.6) {
      rating = 'early';
      ratingText = '切早了！演员台词还没念到';
      scoreCut = Math.abs(Math.round(deviation * 8));
    } else {
      rating = 'late';
      ratingText = '切晚滞后！画面词意不衔接';
      scoreCut = Math.round(deviation * 8);
    }

    setScore(prev => Math.max(0, prev - scoreCut));
    setActiveSubIndex(nextIndex);
    setSuccessLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        msg: `第 ${nextIndex + 1} 句字幕[${currentLine.name}]推送成功: "${currentLine.text.substring(0, 15)}..." (触发时间: ${currentTime}s - 应切时间: ${currentLine.cueTime}s) -> ${ratingText}`,
        rating
      }
    ]);
    setStageLog(`当前画面输出: [${currentLine.name}] - "${currentLine.text}"`);
  };

  // Keyboard binding for Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // anti scroll
        triggerNextSubtitle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeSubIndex, currentTime]);

  return (
    <div id="subtitle_module_container" className="space-y-8 animate-fade-in">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>GT Title Designer & vMix 字幕工作流</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">vMix & GT Title 字幕工程极速制作与同步</h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            规范融媒体社晚会演出字幕、嘉宾人名条、台词文本的快速制作、动态排布和现场逐句逐帧同步流程。
          </p>
        </div>
        <div className="shrink-0 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <div className="text-indigo-400 font-mono text-xs font-semibold uppercase">字幕连接格式</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">NDI Key Out / XML Data</div>
          <div className="text-[10px] text-slate-500 mt-0.5">透明通道叠加，零延迟同步</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Guides and Games */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Subtitle Manual Steps */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-400" />
                第一手指南：GT Title 快速制作与 vMix 同步绑定
              </h3>
              <span className="text-xs text-slate-500">新手学姐带教</span>
            </div>

            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">STEP 01</span>
                  <span className="text-xs text-slate-400">GT Title Designer 模版建模</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">设计规范及图层命名（GT Title Designer）</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. 打开 **GT Title Designer** 新建 1920x1080 模板。<br />
                  2. 拖入一个带圆角的 Rectangle 背景框（颜色设为融媒体社标准藏蓝 [#1A2A4A]，不透明度设为 75% 获得舞台磨砂微透感）。<br />
                  3. 添加 Text Block。选择易读耐看的中文无杂字体（如 **黑体**、**微软雅黑**、或者是中文字体对齐，粗度中等），字体颜色选 **白/米黄**（高对比度，亮度不闪眼）。<br />
                  4. **关键步骤（必须命名属性名称）**：在右边属性面板的 [Block Format] - [Name] 中，分别命名为 **NameField** (主名字图层) 和 **DescField** (职务或歌词图层)。
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">STEP 02</span>
                  <span className="text-xs text-slate-400">数据源 Excel 文件快速配置</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">利用 Excel/CSV 批量字幕同步文件快速制作</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  在直转播现场，若纯手动敲字或反复新建字幕，极易手忙脚乱遗漏。推荐数据源绑定工作流：<br />
                  1. 新建一空白 Excel，第一行 A1 与 B1 列头分别写上 **Name**、**Desc**。<br />
                  2. 将晚会准备好的主持人名字、演出嘉宾和歌词，依次往下逐行填入，保存后置于易于取用的桌面。<br />
                  3. 打开 **vMix** ➔ [Add Input] ➔ [Title] 选择你在 GT Title Designer 做的底纸模型导入。<br />
                  4. 右键该字幕卡 ➔ 选择 **Title Editor** ➔ 菜单底部点选 [Data Source] (数据源) ➔ Add Excel。选择刚做的表，指定 Name 映射到 NameField。
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">STEP 03</span>
                  <span className="text-xs text-slate-400">现场快捷键同步 (Keyboard Mapping)</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">利用 Shortcuts 同步点击推送字幕</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. 打开 vMix 的 [Settings] ➔ [Shortcuts] ➔ [Add]。<br />
                  2. Key (按键) 绑定为 **Space** 键，Function 选 **NextRow** (下一行)，Value 选择 Excel 字幕绑定通道。这样，在转播现场，当主持人念出新台词，字幕师只需敲下【空格】，字幕就完全自动替换并伴随淡入淡出动效。
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 p-4 rounded-lg border border-red-500/25 bg-red-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">STEP 04 ・ 避坑规范</span>
                  <span className="text-xs text-red-400 font-semibold font-mono animate-pulse">⚠️ 帧率对齐原则</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">字幕输出帧率与直播系统帧率必须完全统一</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. 【核心病因】：在 vMix 的工程中，若 NDI 子图层字幕的分辨率/帧率设计为 50Hz/25p，而切换台及直播流强制运行在社团标准的 **1080/60p** 时，混层器会由于时钟信号抖动频繁丢帧。<br />
                  2. 【实操对准】：创建 vMix 字幕工程第一步，前往右下角 **[Settings] ➔ [Display]** ➔ 将 **Master Frame Rate** 强行锁定为 **60p** 或 **59.94p**，并确保 NDI 输出通道强制开启 **"Match Frame Rate" (匹配主帧率)**。<br />
                  3. 【严重后果】：任何帧率失配，会在舞台强光边缘形成高频横向拉丝撕裂，甚至在推拉动态字幕时发生文字颤红、字幕卡顿、重影丢失，切莫大意！
                </p>
              </div>

            </div>
          </div>

          {/* Interactive Live Subtitle Timing Simulator */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Keyboard className="w-4.5 h-4.5 text-indigo-400" />
                实战对齐模拟器：晚会现场台词推送挑战
              </h3>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">实时表现分</span>
                <span className={`text-sm font-bold font-mono ${score > 80 ? 'text-emerald-400' : score > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {score} / 100 分
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              请扮演**字幕操盘手**：点击“开始模拟演练”启动舞台进度。当时间到达台词【预期声学点】时，快速点击【推送下一句(空格键)】或敲击实体键盘【空格键】，对齐台本！
            </p>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-4">
              
              {/* Simulator PGM Overlay View */}
              <div className="relative aspect-[21/9] bg-slate-950 border border-indigo-500/25 rounded-lg overflow-hidden flex flex-col justify-end p-4">
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="text-[10px] text-slate-300 font-mono tracking-wider font-semibold">LIVE PGM SCREEN (1080/60p)</span>
                </div>
                
                <div className="absolute top-2 right-2 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 font-mono">
                  时间轴: {currentTime.toFixed(1)}s
                </div>

                {/* Simulated visual background image mock */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="text-slate-500 text-center space-y-1">
                    <p className="text-sm">【社科大140报告厅迎新大联欢现场】</p>
                    <p className="text-[10px] font-mono">Camera 2 Medium Close Up</p>
                  </div>
                </div>

                {/* Simulated Subtitle overlay render */}
                {activeSubIndex >= 0 && activeSubIndex < MOCK_STAGE_SCRIPT.length ? (
                  <div className="transition-all duration-300 bg-slate-900/90 border-l-4 border-indigo-500 px-3.5 py-2 mx-auto max-w-[85%] rounded-r animate-fade-in relative z-20">
                    <span className="text-[10px] font-bold text-indigo-400 block mb-0.5 uppercase tracking-wide">
                      {MOCK_STAGE_SCRIPT[activeSubIndex].name} 字幕叠加层
                    </span>
                    <p className="text-xs font-semibold text-slate-100 italic">
                      “ {MOCK_STAGE_SCRIPT[activeSubIndex].text} ”
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto max-w-[85%] text-center text-[10px] text-slate-600 border border-dashed border-slate-850 py-3 rounded-md italic">
                    暂无字幕推送叠加（透明零底纸模式）
                  </div>
                )}
              </div>

              {/* Console logs */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                <p className="text-slate-400 font-medium pb-1.5 border-b border-slate-850 mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                  当前现场舞台播报日志：
                </p>
                <div className="text-amber-200 font-mono">{stageLog}</div>
                {successLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`text-[10px] mt-1 flex items-start gap-1 font-mono ${
                      log.rating === 'cool' ? 'text-emerald-400' :
                      log.rating === 'early' ? 'text-red-400' :
                      log.rating === 'late' ? 'text-yellow-400' : 'text-slate-400'
                    }`}
                  >
                    <span>✦</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                {!isPlaying ? (
                  <button
                    onClick={startSimulation}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded-lg text-xs transition-all tracking-wider font-sans cursor-pointer shadow"
                  >
                    <Play className="w-3.5 h-3.5" /> Start / 开始模拟演练
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={triggerNextSubtitle}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-5 rounded-lg text-xs transition-colors cursor-pointer shadow-lg active:scale-95"
                    >
                      <Check className="w-4 h-4" /> 推送下一条 (击打 空格键 / Space)
                    </button>
                    <button
                      onClick={stopSimulation}
                      className="bg-red-950 hover:bg-red-900 text-red-300 font-normal py-3 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      中止
                    </button>
                  </div>
                )}
              </div>

              {/* Script Checklist Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">晚会提白台本对照表：</p>
                <div className="space-y-1.5">
                  {MOCK_STAGE_SCRIPT.map((line, idx) => {
                    const isPassed = activeSubIndex >= idx;
                    const isUpcoming = activeSubIndex + 1 === idx;
                    return (
                      <div 
                        key={line.id} 
                        className={`p-2 rounded flex justify-between items-center text-[11px] transition-colors ${
                          isUpcoming && isPlaying ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200 animate-pulse' :
                          isPassed ? 'bg-slate-900/60 text-slate-500 border border-transparent' :
                          'bg-slate-900 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isPassed ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-950 text-slate-500'}`}>
                            {idx + 1}
                          </span>
                          <span className="font-semibold">{line.name}:</span>
                          <span className="truncate max-w-[240px] md:max-w-[360px]">{line.text}</span>
                        </div>
                        <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 shrink-0">
                          预定读秒: {line.cueTime}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: AI Consultant Panel specifically tailored */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-2 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="text-slate-300">
              我是为中国社会科学院大学融媒体社定制的字幕顾问，你可以随时向我提问关于 GT Title Designer 底纸自定、EXCEL数据绑定以及同传字幕疑难！
            </p>
          </div>
          <AIConsultant initialTopic="字幕" embeddedMode={false} />
        </div>

      </div>
    </div>
  );
}
