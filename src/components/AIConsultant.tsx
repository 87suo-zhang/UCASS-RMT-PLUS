/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Database, ArrowRight, CornerDownLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { Message } from '../types';

interface AIConsultantProps {
  initialTopic?: '摄像' | '字幕' | '导播' | '综合';
  embeddedMode?: boolean;
}

const DEFAULT_SUGGESTIONS = {
  摄像: [
    "索尼 Z190 白平衡如何手动校准？",
    "大型舞台环境下，Z190 怎么调曝光和ND镜？",
    "如何把 Z190 摄像机连到导播台？格式怎么设置？",
    "介绍一下直转播中常用的视听语言和构图原则"
  ],
  字幕: [
    "如何用 GT Title Designer 快速做带入场动画的字幕？",
    "vMix 怎么同步加载 excel 的多个嘉宾人名条字幕？",
    "晚会现场字幕容易错，有什么快捷核对及同步工作流？",
    "vMix 通过 NDI 给导播台送字幕的操作步骤"
  ],
  导播: [
    "时代奥视 osse iso 8 切换台物理按键怎么分配？",
    "多机位直转播中，如何贯彻‘动接动静接静’原则？",
    "直转播过程中突发某一路摄像机断线黑屏，该怎么处理？",
    "切换台如何接入调音台音频进行声画同步？"
  ],
  综合: [
    "社科大140报告厅晚会直转播有什么实战布线排坑经验？",
    "雨天室外直转播，设备防雨防潮和安全接地的应急案",
    "作为一个零基础导播生，应该如何组织第一次彩排？",
    "直转播过程中，导播与摄像、字幕的通话呼叫暗号"
  ]
};

export default function AIConsultant({ initialTopic = '综合', embeddedMode = false }: AIConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `同学你好！我是社科大融媒体社的 **AI直转播技术指导**。👋

我熟悉 **索尼 PXW-Z190 摄像机**、**vMix 字幕同步（含 GT Title Designer）** 以及 **时代奥视 OSSE ISO 8 切换台** 的所有硬软件操作细节。

如果你当前在直转播现场（140报告厅、活动中心等）遇到设备黑屏、字幕格式不支持、白平衡调偏或不知道该用什么视频格式，请尽管向我咨询！`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = DEFAULT_SUGGESTIONS[initialTopic] || DEFAULT_SUGGESTIONS['综合'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      const replyMsg: Message = {
        id: Math.random().toString(),
        role: 'model',
        content: data.content,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'model',
          content: '⚠️ 系统连接异常，请检查网络后再试。你也可以在左侧查看极速实操手册！',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("确定要清空与 AI 导演的会话历史吗？")) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          content: "会话历史已清空。有什么我可以帮你的，融媒体社员？",
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div id="ai_consultant_panel" className={`flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${embeddedMode ? 'h-[500px]' : 'h-[calc(100vh-140px)] min-h-[550px]'}`}>
      {/* Header */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-100 flex items-center gap-1.5 text-sm">
              AI 导演技术顾问
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/20">
                联机知识库
              </span>
            </h3>
            <p className="text-xs text-slate-400">解答 Z190 使用、vMix字幕同步与 OSSE 8 切换</p>
          </div>
        </div>
        <button 
          onClick={handleClearHistory}
          className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          title="清空历史"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex space-x-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              msg.role === 'user' 
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-emerald-600 font-normal text-white rounded-tr-none' 
                : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none whitespace-pre-wrap'
            }`}>
              {msg.content}
              <span className="block text-[10px] mt-1 text-slate-500 text-right select-none">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="rounded-xl px-4 py-3 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs text-slate-400">学长正在调阅直转播手册中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommendations */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/60">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 font-medium">
          <MessageSquare className="w-3 h-3 text-indigo-400" />
          推荐提问 / 实战高频疑难点：
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className="text-xs bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-left truncate max-w-full transition-all disabled:opacity-50 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`请输入有关${initialTopic}的任何实操问题...`}
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500 px-1">
          <span>💡 提示: 键入核心痛点（如“白平衡变绿”或“断线”）可触发快速方案</span>
          <span className="flex items-center gap-1">
            发送 <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
