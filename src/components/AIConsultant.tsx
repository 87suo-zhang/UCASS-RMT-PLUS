/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Database, ArrowRight, CornerDownLeft, MessageSquare, RefreshCw, BookOpen, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    "雨天室外直转播，设备防雨防潮和安全接地的应急方案",
    "作为一个零基础导播生，应该如何组织第一次彩排？",
    "直转播过程中，导播与摄像、字幕的通话呼叫暗号"
  ]
};

// 100% Local Handbook and Guide Database
const LOCAL_KNOWLEDGE: { keywords: string[]; title: string; content: string }[] = [
  {
    keywords: ["白平衡", "wb", "测白", "白卡", "色温", "b档", "wht bal"],
    title: "索尼 Z190 双档手动白平衡校准指引",
    content: `【索尼 Z190 摄像机白平衡校准极速指南】：

1. **选择白平衡档位**：
   - 在镜头下方找到白平衡拨档开关：可在 [A], [B], [PRESET] 中选择。
   - 推荐在140报告厅或大学活动中心大功率多温光源下，将档位拨至 [B] 档进行手动测白存放。

2. **放置基准白色源**：
   - 让现场助理拿一张纯白纸或身穿纯白棉 T 恤，站在中央舞台。
   - 推进镜头给白纸大特写，使其充满取景器画面的 80% 以上。

3. **触动物理测白键**：
   - 按下镜头前下方、遮光罩底部的圆形黑色 【WHT BAL】 触发按钮。
   - 寻像器中将出现闪烁的“COLOR TEMP”及白平衡校正数据（例如：4500K）。
   - 等待闪烁消失、显示“OK”字样后即算校准完成。当前环境值已精确锁存入 B 档！

4. **预配档 (PRESET) 备用**：
   - 如舞台灯光频繁变换，可直接调到 PRESET 档（通过菜单预设 3200K 舞台钨丝灯色温 或 5600K 户外日光色温，一键快速契合主流环境色调）。`
  },
  {
    keywords: ["曝光", "gain", "增益", "nd", "nd镜", "滤镜", "光圈", "快门", "iris", "agc", "shutter"],
    title: "舞台剧烈灯光下的曝光、Gain增益与ND镜匹配",
    content: `【高端亮度调校与镜头进光配挡规范】：

1. **亮度增益 (Gain) 物理防抖红线**：
   - Gain 是对感光器信号的电子放大（等价于单反 ISO 放大）。
   - 【0dB】 为高还原 pure 纯净画质；【3dB - 6dB】 为夜间轻度代偿，噪点几乎不可见。
   - **严禁开启自动增益 (AUTO GAIN / AGC)**！否则舞台暗场一旦到来，机器会自动强拉至 18dB，使黑夜暗部溢出海量灾难性雪花噪点。
   - **超过 12dB 则启动预警线**。

2. **ND 减光滤镜配档 (ND FILTER)**：
   - 当舞台追光开启或大太阳直射，画面瞬间过曝、白花一片时：
   - 拨动机身侧边的 [ND FILTER] 滑动档。共有 CLEAR (无阻碍)、1/4、1/16、1/64 四档物理减光。
   - 动态调整 ND 并配合 Iris 无极光圈环，使光圈值维持在 **F4 - F5.6 甜点区**，避免极端过小光圈（F11以上）产生镜头衍射干涉发虚，也避免过大光圈导致背景过浅跑焦。

3. **快门限速 (Shutter)**：
   - 现场拍摄 1080/60p 时，快门速度应强制锁死在 **1/100 或 1/120 秒**，避免快速运动重影；严禁快门过低（如1/30）产生拖影，也严禁快门过高（如1/500）导致高频灯光高频水波纹闪烁。`
  },
  {
    keywords: ["格式", "制式", "1080", "1080p", "60p", "60帧", "帧率", "分辨率", "sdi", "hdmi"],
    title: "1080/60p 全社团唯一通用格式标准政策说明",
    content: `【融媒体社团通用视频制式规范】：

1. **全链路统一格式为 1080/60p**：
   - 所有连接在物理视频通道（SDI 或 HDMI）上的摄像机，其输出制式必须在机身菜单中**锁死在 1080/60p**（即全逐行扫描，1920x1080分辨率，每秒60张画幅）。
   - **禁用冲突制式**：
     - *1080/50i* (隔行扫描，画面高频交错，极易导致字幕和动作上下拉条抖动)
     - *1080/24p* (电影长片格式，在体育、晚会直播中会卡顿发涩)
     - *1080/25p* 或 *1080/50p* (混合使用会产生画面横向拉丝撕裂，造成重大播出事故)

2. **Sony Z190 格式设置菜单路径**：
   - 主菜单 [MENU] ➔ [PROJECT] ➔ [REC FORMAT] ➔ 选择 [1920x1080 59.94P] 或 [1920x1080 60P]。
   - 同时将主切换台系统的主时钟、主画幅也配置为 1080/60p，即可顺利握手无缝匹配，避死机或黑屏。`
  },
  {
    keywords: ["视听", "构图", "三分法", "三分", "黄金", "特写", "走线", "镜头", "三分之一", "过满"],
    title: "直转播多机位景别、经典九宫格与情绪特写构图",
    content: `【多机位景别控制与构图美学规范】：

1. **留空原理 (Headroom)**：
   - 拍摄主持人或演讲嘉宾时，头顶以上的空白部分 (Headroom) 不宜过大，也不宜直接贴着发际。
   - 理想头顶留空高度为：寻像器垂直高度的约 8% ~ 10%。
   - 人物眼睛应正好落于九宫格的上三分之一水平辅助线上。

2. **“过满构图”的强烈特定戏剧性表达**：
   - 传统大厂教科书中，画面头顶切除被视为不规范。
   - 但在**晚会歌手副歌渲染、吉他独奏特写、或独白高潮**中，我们的导播工作流中**强烈鼓励使用过满的超大特写**！
   - 这种构图直接将眼部及肌肉微表情放大，能对观众展现强大的情绪张力和戏剧表现力。

3. **运镜平滑铁律**：
   - 保持运动极其平滑，切忌在移动中高频颤抖。
   - 在没有导播切流指示前，不要高频无意义拉镜头（推拉应缓缓进行，为导播提供可用的动接动安全切片素材）。`
  },
  {
    keywords: ["gt", "designer", "title", "字幕", "入场", "动画", "gt title"],
    title: "GT Title Designer 动态入场字幕制作流程",
    content: `【GT Title Designer 动态入场字幕配置指南】：

1. **动画设计步骤**：
   - 打开 vMix 附带的 *GT Title Designer* 独立编辑软件。
   - 绘制好人名条、职务条等基本几何形体。
   - 在右侧属性面板选择 [Animations] (动画标签页)。
   - 在 Animation [TransitionIn] 中：指定 Trigger（触发方式）为 **OnTransitionIn** (淡入渲染)。
   - 动画效果选择 [Fade] (渐变) 加上 [Pan] (平移，方向：从左至右)，持续时间 Duration 设为 0.5s，缓动效果选 [CubicOut]。

2. **参数命名与绑定**：
   - 将主标题文本重命名为 'Name'，副标题重命名为 'Title'，以便绑定。
   - 存盘为 .gtzip 格式即可完美导入 vMix NDI 渲染队列！

3. **输出帧率严禁混编**：
   - 字幕输出帧率必须和主切一致（1080/60p）。否则在主切换叠加时会高频闪烁、重影文字撕裂。`
  },
  {
    keywords: ["excel", "csv", "数据", "批量", "名单", "人名条", "数据源", "表格"],
    title: "vMix 联动 Excel 数据源批量人名字幕快捷流",
    content: `【vMix Data Sources 批量实时字幕注入】：

1. **整理表格文件**：
   - 新建一个标准的 Excel 或 CSV 文件。
   - 首行第一列设为 \`Name\`（人名），第二列设为 \`Title\`（嘉宾职务及介绍）。
   - 按出场顺序依次在此表格内录入 10 位嘉宾信息并保存。

2. **在 vMix 绑定数据源**：
   - 在 vMix 界面左下角点击 [Add Input] ➔ [Data Sources] ➔ [Excel / CSV]。
   - 浏览选中刚才的表格，设置轮询间隔或手动更新，并命名此数据源。

3. **将数据源关联至 GT 字幕图层**：
   - 在 vMix 窗口里的字幕图层，右键选择 [Title Editor] ➔ 点击右上角的 [DataSource]。
   - 将 \`Name-Text\` 关联至刚才数据源的 Excel, 选 Column 'Name'。
   - 将 \`Title-Text\` 关联至 Excel, 选 Column 'Title'。
   - 此时在 DataSource 控制台上点击“Next”，字幕上的汉字将随动一秒刷新！不用人工在现场打字！`
  },
  {
    keywords: ["核对", "同步", "快捷键", "跟词", "人名", "快捷键", "更改"],
    title: "晚会重磅实时名单字幕核对与跟词流程",
    content: `【双人合作：高阶快捷同步流程】：
大型晚会中，嘉宾致辞顺序可能由于突发情况发生剧烈变动。我们社团采取【双字幕员岗】协作：

1. **主控屏 (Excel 表格管理员)**：
   负责时刻盯着台侧，如果发现原定的 A 嘉宾临时换成了 C 嘉宾，立刻在 Excel/CSV 数据源表格内右键激活对应的行。

2. **推流员 (vMix 快捷键控制手)**：
   - 在 vMix ➔ [Settings] ➔ [Shortcuts] 中配置快键。
   - 键 A ➔ 动作：\`DataSourceNextRow\`（切到下一排字幕）。
   - 键 S ➔ 动作：\`OverlayInput1\` (一键将 1号图层送上 NDI 混叠网络)。
   - 键 D ➔ 动作：\`ActiveInput\` (如果字幕需要带入场动画全切)。
   - 这样的物理按键反馈最坚实、反应速度少于 0.1s，最稳妥不会在现场误点。`
  },
  {
    keywords: ["ndi", "NDI", "拉丝", "横向", "抖动", "撕裂", "闪烁"],
    title: "NDI 字幕网路混叠拉丝与撕裂应急调试",
    content: `【解决 NDI 叠加动态拉丝与高频文字高频发抖】：

1. **横向拉丝与撕裂的成因**：
   - 现场 99% 的字幕边缘毛刺和文字拖尾都是因为**字幕源帧率不配**引起。
   - 任何 50i / 25p / 50p 与主转播的 60p 混用，都会产生双重交织拉丝。

2. **终极排查自救步骤**：
   - **步骤一**：在 vMix 主界面右下角点击 [Settings] ➔ [Display]。
   - **步骤二**：确保 Master Frame Rate (主视频制式) 设定在 **60p 或 59.94p (NTSC)**，绝不能是 50p / PAL！
   - **步骤三**：在 NDI 外部输出设置上激活 “Match Frame Rate” 框。
   - **步骤四**：主切换台 osse ISO 8 的接收端也锁定 1080/60p 无损流。重新握手一次，瞬间恢复晶莹剔透、毫无闪烁和毛刺画质！`
  },
  {
    keywords: ["osse", "OSSE", "切换", "主控", "按键", "物理接口", "切换台", "面板", "矩阵"],
    title: "时代奥视 Osse ISO 8 物理按键与配置映射",
    content: `【时代奥视 OSSE 8 路切换台接线配置表】：

1. **物理视频通道输入映射 (Input Channel Config)**：
   - **Input 1**：1号机（固定全景机，架于 140报告厅后排核心区，负责托底安全）。
   - **Input 2**：2号机（舞台中景机，位于正前中场，追踪主体发声人物）。
   - **Input 3**：3号机（特写侧面机，捕提乐器演奏、眼神特写）。
   - **Input 4**：4号机（备用机/手持）。
   - **Input 5 / 6**：无线图传接收机（手持稳定器游机、观众席微表情）。
   - **Input 7**：vMix 实时的 NDI 转 SDI 动态字幕输出（黑背景纯人名条）。
   - **Input 8**：备用或 PPT 演示背景图片输入。

2. **主输出分配 (Output Assign)**：
   - **PGM (主输出)** ➔ SDI 分配器 ➔ 联接直播推流采集卡 (Magewell) 及 140大屏幕。
   - **PVW (预监)** ➔ 导播大液晶屏多画面（Multi-view 分割）。`
  },
  {
    keywords: ["多机位", "静", "动", "切换策略", "配合", "走位", "动接动", "静接静"],
    title: "直导多机位切换核心原则：“动接动、静接静”",
    content: `【多机位安全转播控制手册】：

1. **多机位切换红线**：
   - **动接动、静接静，严禁画面交叉打架**：
     - 若 1 号机正在缓缓向右横移，2 号机正在拉焦，此时**绝对不要直接对切**！混合动接动会导致观众产生方向失衡和眩晕。
     - **极简公式**：要切入运动镜头，前一个镜头也必须有同向动感；如果要平复情绪，切回安全全景（静止）后再缓缓切定焦。

2. **安全全景 PVW 托底**：
   - 遇到台上有演讲人突发失误（衣服掉扣、突然背台、被追光直射暴曝光）或机位突然剧震。
   - 导播在 0.5s 内手掌迅速拍击 **Input 1 按键 (主固定全景) 或 PGM 安全键**，将安全全景切出。
   - 期间通知其他分机位迅速重新构图，完成视觉修复。`
  },
  {
    keywords: ["断线", "黑屏", "死机", "故障", "应急", "断线黑屏", "复位", "重新开机"],
    title: "现场突发：相机黑屏、切换台死机应急反应",
    content: `【直转播大案核心抢救应急工作流】：

1. **现象：一路摄像机突发断线黑屏 / 无信号**：
   - **步骤一**：导播不可慌张，迅速切到【Input 1 (安全舞台全景)】拖住时长。
   - **步骤二**：通过无线对讲询问该机位摄像师：“2号机，注意你当前无输出状态。检查你的 HDMI/SDI 线、监视器电缆、看相机菜单开机了没有！”
   - **步骤三**：让备用场务立刻飞步推入 5号机 (无线备用游机) 进行该角度临时侧补。

2. **现象：硬件切换台死机 / 控制按键无响应**：
   - **步骤一【副导播应急替代】**：若有外接的 vMix 副切主机担任备用节点，副导播迅速通过分配器（Matrix）将流推送源切到 vMix 本地 PGM 应急输出（播放循环垫片视频形式）。
   - **步骤二【强行热复位】**：让现场助理在导播桌侧面摸到 OSSE 开关阀，迅速关掉，等待 5 秒钟后【重新开机】。时代奥视切换台硬件是非系统化微控制级架构，15秒内即可复启动复位同步信号。
   - **步骤三【重置输入总控】**：检查供电电压是否因140报告厅大功率灯光启动导致电压不稳击穿，启动备用 220V UPS 电池续命。`
  },
  {
    keywords: ["音频", "话筒", "调音", "声画", "音频同步", "啸叫", "啸", "嘴型", "不同步", "延迟"],
    title: "音频调音台接入与声画对齐/啸叫消除",
    content: `【音频通道接入及对齐规范】：

1. **接口分配接线**：
   - 现场不能使用普通摄像机自带的内置立体声电容麦去收现场晚会声音，那样会有巨大的大空洞混响。
   - 必须通过卡农线或大二芯线，从现场大型专业调音台 (Soundcraft等) 的 MASTER OUTPUT L/R 或者 AUX 输出孔，拉一根路引接到我们的 osse 录制端 / 或者是 vMix 输入卡的 Line-In 接口。

2. **声画对齐防滞后 (Delay)**：
   - 数字视频（尤其是经过无线图传传输的游机）会有 80ms - 150ms 不等的系统物理延时。
   - 如果声音是直接从调音台拉的大无延迟模拟，就会产生严重的【音画不同步】（嘴型和声不同步）。
   - **解决办法**：在 vMix 点击该音频通道的齿轮设置，找到 [Delay] (音频延时配置)，手动**往后延迟 +110毫秒**，即可实现音画珠联璧合、精准对齐！

3. **啸叫抑制**：
   - 摄像机附近的监听音箱严禁回传过高音量，一旦对讲或手持话筒路过返听音响会产生刺耳高频啸叫。
   - 立即压下调音台对应推子或断开反馈源。`
  },
  {
    keywords: ["140", "报告厅", "走线", "布线", "避坑", "大灯", "大灯干扰", "大功率", "光差"],
    title: "140 报告厅实地直转播光强适应与布线防干扰",
    content: `【140 报告厅实战大排雷】：

1. **防大功率舞台灯强干扰 (电干扰)**：
   - 140 报告厅的舞台顶灯和大屏属于超高功率用电载荷。当它们在晚会中猛烈合闸一瞬，会通过地线产生瞬时高压击穿（电感应涌流），导致长 SDI 线传输的视频流瞬间花屏黑屏！
   - **避坑法**：
     - **严禁**将摄像机音视频同轴长线和舞台重型强电缆平行贴着捆在一起！必须相隔 1.5 米以上。
     - 必须使用【双屏蔽高强韧 SDI 铜轴专用物理电缆】，保证地线与信号完全高阻隔离。

2. **舞台光差适应**：
   - 140报告厅前舞台亮度极强，而后舞台暗角很大。
   - 摄像机光圈在推拉至全景和特写时，必须适时手动微调光圈环，防止人脸在特写时直接变成亮白大光板（过曝），或全景时暗部糊成一块黑色。`
  },
  {
    keywords: ["雨天", "雨", "防潮", "接地", "室外", "漏电", "潮湿"],
    title: "户外室外雨天直播安全供电与防潮接地",
    content: `【复杂天气下户外直转播保障规范】：

1. **设备防雨密封 (雨衣防护)**：
   - 户外即使没有瓢泼大雨，露水和微雨也会在索尼 Z190 镜头防抖马达和按键电路处凝结，导致镜头失焦报故障。
   - 必须使用【防雨密封罩（或简便封口保鲜膜）】包裹电池尾部及手柄区。

2. **单平地独立安全接地**：
   - 户外长距离拉电线由于未接入体育馆主防雷接地网，一旦由于周边高频用电瞬时漏电，很容易导致整个控制台连带操作人员被刺微电。
   - **防范**：供电配电箱上端必须安装带漏电保护空气开关的拖线板，总机金属壳用零线引出一根小铁钉插入泥土进行人工接地泄流。`
  },
  {
    keywords: ["彩排", "组织", "新手", "零基础", "流程", "首次"],
    title: "零基础导播：如何科学组织第一次直转播彩排？",
    content: `【首秀彩排组织标准化一二三步骤】：

1. **彩排前 2小时 (基本通信核对)**：
   - 组织摄像师、字幕师人手配戴好通话对讲。
   - 逐一呼叫核对：“1号机、2号机、3号机听到请举右手示意”。
   - 在主监视大屏上检查各路格式是否【全线绿灯 1080/60p】，排除任何异格式导致的丢帧。

2. **彩排中 (镜头与大本校准)**：
   - **走流程**：不喊停把完整的开场秀、节目流程拉一遍，做好【切记：导播切出标记单（对歌单/本子标记切换点）】。
   - 字幕员演练多位人名快速推送，观察人名条颜色和字体在 140 报告厅投影大屏上的可辨度，如果太浅，在 GT 里立即添加黑底边描。`
  },
  {
    keywords: ["暗号", "对讲", "呼叫", "通话", "指令", "口令", "tally"],
    title: "融媒体现场统驭：专业对讲呼叫暗号大全",
    content: `【现场通话导播流控制暗语（请所有机位背诵）】：

1. **导播核心下令口诀**：
   - **全景托底安全指令**：“1号机，舞台全景锁死，做好保底准备。我快切过来。”
   - **变焦准备命令**：“2号机，迅速推中景，找正在唱歌的主唱。到了停稳后给我，不稳时不要切你！”
   - **追踪微调命令**：“3号机，右转一点抓那个吉他手的手指大特写。带上，好的，倒数三秒我切过来。三、二、一，切。”
   - **紧急撤场命令**：“2号机，迅速出画面！你卡里电池快干了，场务上去帮你换，1号全景顶上！”

2. **摄像反馈话术 (言简意赅)**：
   - 保证只用短词，不要发表大篇段议论：
     - *“1号稳”*
     - *“2号已推，到位，干净”*
     - *“3号光圈对齐”*
     - *“注意：2号需要重测白”*`
  }
];

export default function AIConsultant({ initialTopic = '综合', embeddedMode = false }: AIConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `社科大融媒体社员，你好！欢迎使用 **联机极速本地技术知识库**。👋

本系统已完全本地化，不再需要依赖云端 AI 或读取任何 API Keys，100% 极速秒级响应。

我收录了关于 **索尼 PXW-Z190 摄像机**、**vMix 字幕同步（含 GT Title Designer）** 以及 **时代奥视 OSSE ISO 8 切换台** 的所有实操细节。

请在下方直接输入你的问题，或者点击推荐的高频提问卡片，我会立刻为你调出对应官方操作手册与排坑指南！`,
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

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Simulate instant local database lookup
    setTimeout(() => {
      const normText = text.toLowerCase().trim();
      let matchedItem = null;

      // Match logic
      for (const item of LOCAL_KNOWLEDGE) {
        const found = item.keywords.some(kw => normText.includes(kw) || kw.includes(normText));
        if (found) {
          matchedItem = item;
          break;
        }
      }

      let replyContent = '';
      if (matchedItem) {
        replyContent = `### 🔍 本地知识库为您查到以下条目： **${matchedItem.title}**\n\n${matchedItem.content}`;
      } else {
        replyContent = `⚠️ **本地知识库未直接匹配到指定词条。**

您可以输入或点击包含以下核心痛点关键词的问题：
- **摄像机器类**: \`白平衡\`、\`曝光\`、\`增益\`、\`ND镜\`、\`格式\`、\`制式\`
- **画面设计类**: \`视听语言\`、\`构图\`、\`三分法\`、\`多机位\`、\`动接动\`
- **字幕处理类**: \`GT Title\`、\`Excel数据源\`、\`同步\`、\`核对\`、\`NDI\`、\`帧率\`、\`拉丝\`
- **现场导播类**: \`OSSE按键\`、\`断线黑屏\`、\`音频\`、\`调音台\`、\`啸叫\`
- **实操布线类**: \`140报告厅\`、\`雨天\`、\`彩排\`、\`对讲暗号\``;
      }

      const replyMsg: Message = {
        id: Math.random().toString(),
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, replyMsg]);
      setIsLoading(false);
    }, 380); // Tiny realistic responsive lag for smooth user experience
  };

  const handleClearHistory = () => {
    if (window.confirm("确定要清空本次查询历史吗？")) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          content: "历史信息已清空。随时输入关键词，为您秒级检索融媒体速查数据库！",
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
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-100 flex items-center gap-1.5 text-sm">
              融媒体现场手册智能速查箱
              <span className="text-[10px] bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30 font-semibold tracking-wider">
                100% 极速本地版
              </span>
            </h3>
            <p className="text-xs text-slate-400">零网络延迟，速刷 Z190、vMix字幕与 OSSE切换台指令</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium">免 API 密钥</span>
          </div>
          <button 
            onClick={handleClearHistory}
            className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="清空历史"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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
                ? 'bg-sky-600/20 text-sky-400 border-sky-500/30' 
                : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Search className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-sky-600 font-normal text-white rounded-tr-none shadow-md' 
                : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none whitespace-pre-wrap shadow-inner'
            }`}>
              {/* Simple client-side Markdown titles parsing */}
              {msg.role === 'model' && msg.content.startsWith('### ') ? (
                <div>
                  <div className="text-emerald-400 border-b border-slate-800 pb-2 mb-2 font-bold flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    {msg.content.split('\n\n')[0].replace('### ', '')}
                  </div>
                  <div className="whitespace-pre-wrap text-slate-200">
                    {msg.content.split('\n\n').slice(1).join('\n\n')}
                  </div>
                </div>
              ) : (
                msg.content
              )}
              <span className="block text-[10px] mt-1 text-slate-500 text-right select-none">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="rounded-xl px-4 py-3 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              </div>
              <span className="text-xs text-slate-400 font-mono">正在速查数据库中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommendations */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/60">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 font-medium">
          <MessageSquare className="w-3 h-3 text-emerald-400" />
          点击即刻进行本地数据库秒级匹配：
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className="text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-left truncate max-w-full transition-all disabled:opacity-50 cursor-pointer"
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
            placeholder={`可以直接点击下方卡片，或输入“白平衡”、“140报告厅”等进行速查...`}
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none rounded-xl py-3 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500 px-1">
          <span>💡 提示: 键入关键词或命令不仅可以获得详细解答，更能秒级排除现场高频故障</span>
          <span className="flex items-center gap-1">
            发送 <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
