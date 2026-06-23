/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ForumPost, Comment } from '../types';
import { MessageSquare, ThumbsUp, Tag, PlusCircle, User, Calendar, CornerDownRight, X, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: "1",
    title: "关于在社科大140报告厅直转播时白平衡偏绿、人物面色发青的避坑指南",
    category: "摄像",
    author: "张学长",
    role: "融媒体资深摄像师",
    content: "大家在140报告厅负责晚会转播时经常会发现，Z190屏幕里的画面白平衡有些偏绿，特别是开聚光灯、顶端暖色金卤灯同开的时候。这是因为140报告厅光谱不连续且混杂，如果开启自动白平衡（ATW）极易偏色。千万不要开ATW！\n\n【学长实战窍门】：带上一张标准A4白纸，放在舞台主持人的灯光焦点区，在Z190机身下方切换白平衡至 B 档，把变焦拉满、对准白纸使其占满整个屏幕，拨动镜头最下缘前方的 WHT BAL 按钮，屏幕上闪烁几下 [OK] 后完成手动测白。这样，主持人和舞演人员的肤色就变得自然白里透红，绝不再是一片惨绿！",
    timestamp: "2026-06-21 15:43:22",
    likes: 18,
    commentsCount: 3,
    isPinned: true,
    comments: [
      {
        id: "c1_1",
        author: "李导播",
        role: "学术部总监",
        content: "非常有用！上次学术报告会我们就吃了这个亏，由于全程开着自动白平衡，舞台灯色一变，主持人的脸一会绿一会红，导播切画时特别突兀。",
        timestamp: "2026-06-21 16:10:00",
        likes: 5
      },
      {
        id: "c1_2",
        author: "王大壮",
        role: "大一摄像组长",
        content: "记下了，下礼拜迎新晚会彩排，我们每架机器都配一张硬白纸，开演前强制手动对齐一次测白！",
        timestamp: "2026-06-21 18:22:15",
        likes: 3
      },
      {
        id: "c1_3",
        author: "张学长",
        role: "融媒体资深摄像师",
        content: "对的，有条件的可以买块18%中性灰板，测出来的曝光也极准。",
        timestamp: "2026-06-21 19:00:20",
        likes: 1
      }
    ]
  },
  {
    id: "2",
    title: "vMix 中文人名条加 GT Title Designer 做透明淡入淡出动效的格式细节说明",
    category: "字幕",
    author: "陆融学姐",
    role: "融媒体字幕主管",
    content: "我们社目前主要用 vMix 和配合的 GT Title Designer 制作字幕。很多干事人名条中文字符导进 vMix 容易乱码，或者在舞台边缘闪烁黑条刺眼。这是因为图层的 Alpha 混合通道属性或打包逻辑不对。\n\n【快速通道】：在 GT Title Designer 中编辑时，中文字体一定要选标准的 [Microsoft YaHei (微软雅黑)]、[SimHei (黑体)] 这种兼容度高的标准库。编辑结束后，千万不要直接复制单独的图层，需要选择 [File] -> [Save] 保存成标准的 [ .gtzip ] 统一包！在 vMix 中 [Add Input] 导入刚才的 gtzip。如果要同步，就在 Title Editor 底部点 DataSource，把 Excel 数据导入绑定相应的图层。在 Shortcuts 把【空格】设为 NextRow，晚会现场一个人敲空格就能行云流水对齐字幕！",
    timestamp: "2026-06-22 09:12:05",
    likes: 14,
    commentsCount: 2,
    isPinned: false,
    comments: [
      {
        id: "c2_1",
        author: "小林子",
        role: "字幕组员",
        content: "学姐太神了！之前的.zip格式总是说不支持或者图层缺少素材，换成.gtzip保存就完全解决了！",
        timestamp: "2026-06-22 10:20:00",
        likes: 4
      },
      {
        id: "c2_2",
        author: "陆融学姐",
        role: "融媒体字幕主管",
        content: "不客气，晚会现场可以用 vMix 软件内部的 OverLay 1 通道，这样能保持渐入渐出的呼吸感，别用硬切（CUT）字幕叠底。",
        timestamp: "2026-06-22 11:45:10",
        likes: 2
      }
    ]
  },
  {
    id: "3",
    title: "时代奥视 OSSE ISO 8 切换台格式无法自适应 1080i50 信号的黑屏排障经历",
    category: "导播",
    author: "李导播",
    role: "融媒体技术总监",
    content: "前天我们融媒体承接了大学生活动中心学术报告厅的转播。一号机 Z190 只要一插上 SDI 线，电视监视墙就全是黑屏与雪花条交叉闪烁。其他二号、三号全是好的，线和转接头换了两圈也无济于事。我们急得满头大汗。\n\n最后，我们抱了个监视器怼到 1 号摄像机跟前，按长按 MENU 进去排查，才找到了原因：原来上一届社团拍摄小电影，把 1 号机的系统格式 [SYSTEM] -> [REC FORMAT] 改成了 [1080/50P]（逐行扫描），而我们当天在时代奥视 OSSE 8 切换台由于要跟校园广电网络对齐，系统 Master Format 统统设定在传统的广电标准 [1080/50i]（隔行扫描）。\n\n【特此警醒】：时代奥视 ISO 8 是个多格式切换台，但各路通道【无法自适应倍频】，若遇到信号制式 P 与 I 混合必出状况！下次开机第一件事：抱个小屏确认所有摄像机全部锁死在 **1080/50i** 再排 SDI 线！",
    timestamp: "2026-06-20 18:30:11",
    likes: 25,
    commentsCount: 1,
    isPinned: false,
    comments: [
      {
        id: "c3_1",
        author: "小夏",
        role: "导播助理",
        content: "当时真的很险，快演大戏了都还黑屏，好在最后查出来了。看来标准化检查清单（Checklist）太有必要了！",
        timestamp: "2026-06-20 19:15:00",
        likes: 6
      }
    ]
  }
];

export default function Forum() {
  // Persistence state
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'全部' | '摄像' | '字幕' | '导播' | '综合讨论'>('全部');
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  
  // New Post Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'摄像' | '字幕' | '导播' | '综合讨论'>('综合讨论');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // New Comment Input
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Local storage synchronization
  useEffect(() => {
    const stored = localStorage.getItem('ucass_media_forum_posts');
    if (stored) {
      try {
        setPosts(JSON.parse(stored));
      } catch (e) {
        setPosts(INITIAL_FORUM_POSTS);
      }
    } else {
      setPosts(INITIAL_FORUM_POSTS);
      localStorage.setItem('ucass_media_forum_posts', JSON.stringify(INITIAL_FORUM_POSTS));
    }
  }, []);

  const savePosts = (updated: ForumPost[]) => {
    setPosts(updated);
    localStorage.setItem('ucass_media_forum_posts', JSON.stringify(updated));
  };

  // Add Post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) {
      setErrorMessage("请填写所有的必填项（名字、标题与干货内容）！");
      return;
    }

    const createdPost: ForumPost = {
      id: Math.random().toString(),
      title: newTitle,
      category: newCategory,
      author: newAuthor,
      role: "融媒体新晋社员",
      content: newContent,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      likes: 1,
      commentsCount: 0,
      comments: []
    };

    const updated = [createdPost, ...posts];
    savePosts(updated);

    // Reset Form
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setErrorMessage('');
    setShowAddForm(false);
  };

  // Like Post
  const handleLikePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    });
    savePosts(updated);
    if (activePost && activePost.id === postId) {
      setActivePost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  // Add Comment/Reply to active post
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost) return;
    if (!newCommentName.trim() || !newCommentText.trim()) {
      alert("请输入发言署名和评论内容！");
      return;
    }

    const createdComment: Comment = {
      id: Math.random().toString(),
      author: newCommentName,
      role: "融媒体社员",
      content: newCommentText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      likes: 1
    };

    const updatedPosts = posts.map(p => {
      if (p.id === activePost.id) {
        const updatedComments = [...p.comments, createdComment];
        return {
          ...p,
          comments: updatedComments,
          commentsCount: updatedComments.length
        };
      }
      return p;
    });

    savePosts(updatedPosts);
    // Sync detailed view
    setActivePost(prev => {
      if (!prev) return null;
      return {
        ...prev,
        comments: [...prev.comments, createdComment],
        commentsCount: prev.commentsCount + 1
      };
    });

    // Reset Form
    setNewCommentText('');
  };

  // Filter categories
  const filteredPosts = posts.filter(post => {
    if (selectedCategory === '全部') return true;
    return post.category === selectedCategory;
  });

  return (
    <div id="forum_component_main" className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Intro header block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>社科大社团经验库</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">社科大融媒体社・直转播交流论谈</h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            凝聚了社科大历届140报告厅、大学生活动中心、学术报告厅的大型直转播避坑经历，也是干事们提问、分享技术心得的实操飞岛。
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-lg text-xs transition-all shadow-md cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> 编写实战心得 / 提问题
        </button>
      </div>

      {/* Main Grid: Details or lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Area (List of posts) */}
        <div className={`${activePost ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6`}>
          
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> 快速过滤:
            </span>
            {(['全部', '摄像', '字幕', '导播', '综合讨论'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 border-indigo-400 text-white' 
                    : 'bg-slate-905 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts iteration list */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs italic">
                当前分类下无讨论帖。你可以点击右上角，发表本板块第一篇实操总结！
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className={`bg-slate-900/60 border rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer relative group space-y-3 ${
                    activePost?.id === post.id ? 'border-indigo-600 ring-1 ring-indigo-500/35 bg-slate-900' : 'border-slate-800'
                  }`}
                >
                  {/* Pin tag & category */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        post.category === '摄像' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        post.category === '字幕' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        post.category === '导播' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {post.category}
                      </span>
                      {post.isPinned && (
                        <span className="text-[10px] bg-red-600/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-black font-mono">
                          📌 顶置
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {post.timestamp}
                    </span>
                  </div>

                  {/* Title & snippet */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors font-sans leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-350 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Footer metadata details */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-850/60 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="font-semibold text-slate-300 text-[11px]">
                        {post.author} 
                        <span className="font-normal text-[10px] text-slate-500 ml-1 bg-slate-950 px-1 rounded-sm">{post.role}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-slate-400">
                      <button 
                        onClick={(e) => handleLikePost(post.id, e)}
                        className="flex items-center gap-1 text-[11px] hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes}</span>
                      </button>
                      <div className="flex items-center gap-1 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area (Post Detailed View or Form Editor) */}
        {activePost ? (
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-6">
            
            {/* Close detail cross */}
            <button
              onClick={() => setActivePost(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-400 p-1 bg-slate-950/60 border border-slate-850 rounded-lg transition-all cursor-pointer"
              title="收起详情"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="space-y-3.5">
              <span className="inline-block text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
                {activePost.category} 板块
              </span>
              
              <h2 className="text-lg font-black text-slate-100 leading-snug">
                {activePost.title}
              </h2>

              <div className="flex items-center space-x-2 pb-4 border-b border-slate-850">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-200">
                    {activePost.author}
                    <span className="text-[9px] font-normal text-slate-500 ml-1.5 bg-slate-950 px-1 py-0.5 rounded">{activePost.role}</span>
                  </p>
                  <p className="text-[10px] text-slate-550 font-mono mt-0.5">{activePost.timestamp}</p>
                </div>
              </div>
            </div>

            {/* Content text block */}
            <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed py-2 bg-slate-950/20 p-4 rounded-xl border border-slate-850">
              {activePost.content}
            </div>

            {/* Actions for detailed post */}
            <div className="flex items-center gap-4 text-xs select-none">
              <button 
                onClick={(e) => handleLikePost(activePost.id, e)}
                className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer font-bold"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>点赞学姐学长 ({activePost.likes})</span>
              </button>
            </div>

            {/* Comments/Replies Area */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                社员互动跟帖 ({activePost.comments.length} 条回复)
              </h3>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {activePost.comments.length === 0 ? (
                  <p className="text-xs text-slate-600 py-3 italic">暂无评论回复。快来抢个沙发贴吧！</p>
                ) : (
                  activePost.comments.map((comm) => (
                    <div key={comm.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2 flex gap-3">
                      <div className="shrink-0">
                        <CornerDownRight className="w-4 h-4 text-slate-600 mt-1" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-300">
                            {comm.author}
                            <span className="text-[8px] font-normal text-slate-500 ml-1 bg-slate-900 px-1 rounded">{comm.role}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{comm.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{comm.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Inline Input Form */}
              <form onSubmit={handleAddComment} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">跟贴发表看法：</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    placeholder="你的名字/花名"
                    className="col-span-1 bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                  <span className="col-span-2 text-[10px] text-slate-500 flex items-center justify-end">请分享您在晚会转播的同理心得</span>
                </div>

                <input
                  type="text"
                  required
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="说点什么吧（支持普通文明词汇）..."
                  className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-indigo-500 text-slate-200"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-4 rounded transition-colors cursor-pointer"
                  >
                    确认贴出跟帖
                  </button>
                </div>
              </form>

            </div>

          </div>
        ) : null}

      </div>

      {/* Write New Post Modal/Overlay Form */}
      {showAddForm && (
        <div id="add_post_modal_overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 relative overflow-hidden space-y-5 animate-scale-up">
            
            {/* Header info modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                编写融媒体直转播干货论坛帖
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setErrorMessage('');
                }}
                className="text-slate-400 hover:text-red-400 p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error indicators */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddPost} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Author Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">1. 你的称呼 / 职务（必填）</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="例如: 睿睿学长、摄影一号干事"
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">2. 归属分类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
                  >
                    <option value="摄像">摄像板块 - Sony Z190、机动调试</option>
                    <option value="字幕">字幕板块 - vMix 数据同步、GT Title</option>
                    <option value="导播">导播板块 - OSSE切换机、应急保障</option>
                    <option value="综合讨论">综合讨论 - 通话暗号、会务协调</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">3. 帖子及求助标题（必填）</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="用一句重点讲清楚痛点 (例如: Z190如何在外场防止大风啸叫？)"
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>

              {/* Content body */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">4. 总结干货内容或具体求助描述（必填）</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="详情说明前因后果、菜单路径或急救措施。学弟学姐们都会在下面交流回帖！"
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 resize-none font-sans"
                />
              </div>

              {/* Actions submit buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setErrorMessage('');
                  }}
                  className="px-4 py-2 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  发布实战贴 🚀
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
