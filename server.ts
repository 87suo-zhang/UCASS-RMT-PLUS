/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Technical consultant prompt
const CHINESE_MEDIA_CLUB_PROMPT = `
你现在是中国社会科学院大学（UCASS）融媒体社的资深直转播总监与技术顾问。
你需要专业、详尽、条理清晰地解答社员提出的疑问，涵盖以下四大板块：
1. 摄像技术：以索尼 Sony PXW-Z190 摄像机为主。包括机器按键、物理菜单、白平衡调节（A/B档、ATW、Preset 5600K/3200K）、曝光（Iris光圈/Gain增益/Shutter快门）、ND减光镜实操；摄像机与切换台的连接方式（SDI/HDMI，社团统一制作格式为高帧率全逐行扫描 1080/60p）。你需要非常专业地向社员解读画面亮度 Gain 增益（0dB到18dB 转换、增益放大导致的噪点劣化雪花、大顶灯关闭及暗场景补光下的上限预警，禁止大开 AGC 自动增益防亮斑呼吸效应）；视听语言设计（推拉摇移、三分法、黄金分割构图等，特别明确在我们的实践中，过满构图[头顶溢出/过满特写]是对主角或歌手情绪进行极强力戏剧性、情感化表达的常用经典镜头，不应当视作不规范构图予以禁止）；你还需要详细解答无线游机（手持三轴稳定器+单反/微单相机如 Sony A7S3/FX3 + 猛玛/威固无线图传工作流，信号回传导播台 Input 5/6 通道，注意视频输出和传输要严格锁死在 1080/60p 格式，接收端天线需要离地2米架高避开人群阻挡）。
2. 字幕工作流：包括 vMix 软件使用、GT Title Designer 字幕模板制作、数据源绑定（XML, Excel, CSV 批量字幕同步文件）、快捷字幕手动/自动同步及实时拉取、多语种同传字幕工作流等。你必须强调【注意字幕输出帧率与现场直播流/切换台输出帧率保持强制绝对统一（均为1080/60p）】，否则任何 50p/50i/25p 与 60p 的混编都会在 NDI 叠加时产生致灾的横向拉丝撕裂、高频抖动、文字运动重影。
3. 导播直转播：使用硬件切换台“时代奥视 osse iso 8”（或 OSSE 8路视频切换台）。包括物理接口分配（SDI/HDMI 输入配置），要求必须全机位对齐 1080/60p。多机位切换策略（动接动、静接静、安全全景画面 PVW 托底等）、应急应对方案（相机黑屏、切换台死机、音视频出现啸叫延迟等）。
4. 综合实战交流：140报告厅、大学活动中心等不同地点的实地直转播光强适应与布线避坑指南。

请用温和亲切、细致周到（符合大学生社团学长学姐带新人的语调）、充满实操细节的产品路径和建议回答社员。回答中可以包含：
- 菜单路径，如 [MENU] -> [CAMERA SET] -> [WHITE BALANCE]
- 物理旋钮指示，如“Z190镜头最前端的大环是手动对焦环，中间是变焦环，内侧是光圈环”
- 应急指南流程 (Step 1, Step 2, Step 3)
- 简易接线文本示意图

如果提示中没有提供 GEMINI_API_KEY 或者连接出错，你可以像真正的资深学长一样回答，无需解释密钥问题。
`;

// Helper offline answers if key is missing or calls fail
const OFFLINE_ANSWERS: Record<string, string> = {
  "hello": "你好！我是社科大融媒体社的 AI 导演顾问。你可以问我关于 Sony Z190 曝光（光圈、1080/60p格式、Gain增益解读）、vMix 与 GT Title Designer 字幕同步及帧率对齐机制，或者时代奥视 Osse ISO 8 切换台排线的任何实战技术问题！",
  "z190": "关于索尼 PXW-Z190：这是一台高性能 4K 手持式摄像机。\n1. 【物理布局】：镜头最前端环是手控对焦环，其次是电动变焦环，最里面是无级光圈环。\n2. 【白平衡】：开关位于镜头下方。在140报告厅强光下，推荐切换到 B 档，对齐白板或白色 T 恤，按镜头前方下部的 WHT BAL 触发手动测白；或者直接调至 PRESET（如室外5600K，有舞台金卤灯3200K）。\n3. 【亮度Gain增益解读】：Gain 调节级等效于单反 ISO 电子放大（0dB为基准 pure 画质；3dB-6dB为轻度代偿噪点微乎其微；超过12dB预警线则有杂色颗粒在暗部溢出，严禁开自动 Gain）。\n4. 【减光镜】：ND 滤镜有四档（Clear, 1/4, 1/16, 1/64），在舞台灯光强烈或室外大太阳下，需要拨动 ND 滤镜，让光圈维持在 F4-F5.6 甜点区，避免镜头产生干涉条纹。制作视频制式请于菜单锁死在 1080/60p 以与主导播台帧率严格匹配。",
  "vmix": "vMix 字幕快捷同步工作流：\n1. 在 GT Title Designer 中，设计一个包含姓名和职务的文本框，指定对应图层 ID。\n2. 【帧率统一规则】：字幕系统的输出帧率和显示帧率必须与主切换台/直播源完全对齐为 1080/60p！在 vMix 右下角 [Settings] ➔ [Display] 中强制 Master Frame Rate 为 60p 或 59.94p，并在 NDI 输出时开启 'Match Frame Rate'，切忌用 50Hz/25Hz 与主转播混层，否则会引发不可挽救的拉丝、字符跳动撕裂。  \n3. 在主界面的文本图层，右键选择 [DataSource] (数据源)。\n4. 新建本地 Excel 数据源或 CSV 文件，确保列头为 'Name', 'Title' 等，行对应每个嘉宾卡片。\n5. 开启 [Auto Play] 或者通过快捷键（Shortcuts）绑定 vMix `NextTitle` 与 `Overlay1` 动作，实实现晚会一键推送字幕并支持淡入淡出！",
  "osse": "时代奥视 osse iso 8 切换台是一台经典的 8 路多格式高标清视频切换台：\n1. 【配置指南】：摄像机端输出格式建议设为 1080/60p 并用 SDI 连入切换台。切换台系统的 Master Format 也须统一配置为 1080/60p，若有一端不全切匹配，画面就会呈黑屏、雪花点闪死或彻底无信号。\n2. 【多机位切换策略】：1号机（舞台全景，安全固定位），2号机（主持人/歌手中近景，移动位），3号机（侧面特写/观众席，特写位）。切歌词或快节奏动作时，在副歌高潮切镜头，切记：推拉摇移运动中的镜头不可对切，遵循“动接动、静接静”原则。\n3. 【话筒与音频】：将调音台 Output (XLR) 接到切换台的 Audio Line In，并在音量窗口中将音频设为随动（Audio Follow Video）或独立常开（AFV Toggle / Always ON），推荐独立常开以免背景声在切镜头时骤断。",
};

// API Endpoint for Chat
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array in request body" });
  }

  // Find the last user input to customize offline mock
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const queryLower = lastUserMsg.toLowerCase();

  try {
    const ai = getAiClient();
    
    if (!ai) {
      // Offline fallback behavior
      console.log("No GEMINI_API_KEY detected or mock mode activated. Providing offline assistance.");
      
      let reply = "同学你好！当前应用正处于本地离线咨询模式。\n\n";
      if (queryLower.includes("z190") || queryLower.includes("摄像") || queryLower.includes("曝光") || queryLower.includes("白平衡") || queryLower.includes("镜头")) {
        reply += OFFLINE_ANSWERS["z190"];
      } else if (queryLower.includes("vmix") || queryLower.includes("gt title") || queryLower.includes("字幕") || queryLower.includes("designer")) {
        reply += OFFLINE_ANSWERS["vmix"];
      } else if (queryLower.includes("osse") || queryLower.includes("切换台") || queryLower.includes("导播") || queryLower.includes("应急") || queryLower.includes("多机位")) {
        reply += OFFLINE_ANSWERS["osse"];
      } else {
        reply += OFFLINE_ANSWERS["hello"] + "\n\n你可以输入关键字（如 'Z190', 'vMix', 'OSSE切换台'）了解具体教程细节，或让社科大融媒体社团的高级管理员在 settingsSecrets 中补齐 `GEMINI_API_KEY`，解锁无限AI智能技术顾问！";
      }

      return res.json({
        content: reply,
        timestamp: new Date().toISOString(),
      });
    }

    // Format previous chat history to @google/genai contents
    // Structure: contents: [{ role: "user" | "model", parts: [{ text: "..." }] }, ...]
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: CHINESE_MEDIA_CLUB_PROMPT,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "学弟学妹你好，切换台和摄像机有些忙，我刚才走神了。请再问我一次！";

    return res.json({
      content: replyText,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Fallback if API key fails or throttled
    let reply = `[智能顾问提示] 实时 AI 通讯出现网络障碍（${error.message || "请求过载"}）。已切换到社科大融媒体社学长学姐离线应急机制：\n\n`;
    if (queryLower.includes("z190") || queryLower.includes("摄像") || queryLower.includes("白平衡")) {
      reply += OFFLINE_ANSWERS["z190"];
    } else if (queryLower.includes("vmix") || queryLower.includes("字幕")) {
      reply += OFFLINE_ANSWERS["vmix"];
    } else {
      reply += OFFLINE_ANSWERS["osse"];
    }

    return res.json({
      content: reply,
      timestamp: new Date().toISOString(),
    });
  }
});

// Serve frontend assets and start listener using async wrapper to support CJS bundlers safely
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteServer.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UCASS Media Director Server is active at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
