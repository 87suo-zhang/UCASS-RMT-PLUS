/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 100% offline fallback handbook answers
const OFFLINE_ANSWERS: Record<string, string> = {
  "hello": "你好！当前应用全速运行在【100%本地安全离线模式】，不加载任何外部大模型组件。你可以问我关于 Sony Z190 曝光（光圈、1080/60p格式、Gain增益解读）、vMix 与 GT Title Designer 字幕同步及帧率对齐机制，或者时代奥视 Osse ISO 8 切换台排线的任何实战技术问题！",
  "z190": "关于索尼 PXW-Z190：这是一台高性能 4K 手持式摄像机。\n1. 【物理布局】：镜头最前端环是手控对焦环，其次是电动变焦环，最里面是无级光圈环。\n2. 【白平衡】：开关位于镜头下方。在140报告厅强光下，推荐切换到 B 档，对齐白板或白色 T 恤，按镜头前方下部的 WHT BAL 触发手动测白；或者直接调至 PRESET（如室外5600K，有舞台金卤灯3200K）。\n3. 【亮度Gain增益解读】：Gain 调节级等效于单反 ISO 电子放大（0dB为基准 pure 画质；3dB-6dB为轻度代偿噪点微乎其微；超过12dB预警线则有杂色颗粒在暗部溢出，严禁开自动 Gain）。\n4. 【减光镜】：ND 滤镜有四档（Clear, 1/4, 1/16, 1/64），在舞台灯光强烈或室外大太阳下，需要拨动 ND 滤镜，让光圈维持在 F4-F5.6 甜点区，避免镜头产生干涉条纹。制作视频制式请于菜单锁死在 1080/60p 以与主导播台帧率严格匹配。",
  "vmix": "vMix 字幕快捷同步工作流：\n1. 在 GT Title Designer 中，设计一个包含姓名 and 职务的文本框，指定对应图层 ID。\n2. 【帧率统一规则】：字幕系统的输出帧率和显示帧率必须与主切换台/直播源完全对齐为 1080/60p！在 vMix 右下角 [Settings] ➔ [Display] 中强制 Master Frame Rate 为 60p 或 59.94p，并在 NDI 输出时开启 'Match Frame Rate'，切忌用 50Hz/25Hz 与主转播混层，否则会引发不可挽救的拉丝、字符跳动撕裂。  \n3. 在主界面的文本图层，右键选择 [DataSource] (数据源)。\n4. 新建本地 Excel 数据源或 CSV 文件，确保列头为 'Name', 'Title' 等，行对应每个嘉宾卡片。\n5. 开启 [Auto Play] 或者通过快捷键（Shortcuts）绑定 vMix `NextTitle` 与 `Overlay1` 动作，实现晚会一键推送字幕并支持淡入淡出！",
  "osse": "时代奥视 osse iso 8 切换台是一台经典的 8 路多格式高标清视频切换台：\n1. 【配置指南】：摄像机端输出格式建议设为 1080/60p 并用 SDI 连入切换台。切换台系统的 Master Format 也须统一配置为 1080/60p，若有一端不全切匹配，画面就会呈黑屏、雪花点闪死或彻底无信号。\n2. 【多机位切换策略】：1号机（舞台全景，安全固定位），2号机（主持人/歌手中近景，移动位），3号机（侧面特写/观众席，特写位）。切歌词或快节奏动作时，在副歌高潮切镜头，切记：推拉摇移运动中的镜头不可对切，遵循“动接动、静接静”原则。\n3. 【话筒与音频】：将调音台 Output (XLR) 接到切换台的 Audio Line In，并在音量窗口中将音频设为随动（Audio Follow Video）或独立常开（AFV Toggle / Always ON），推荐独立常开以免背景声在切镜头时骤断。",
};

// Purely local static API Endpoint for Chat (Safe Fallback)
app.post("/api/chat", (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array in request body" });
  }

  // Find the last user input to customize offline mock response
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const queryLower = lastUserMsg.toLowerCase();

  let reply = "同学你好！当前应用正处于本地离线速查模式。\n\n";
  if (queryLower.includes("z190") || queryLower.includes("摄像") || queryLower.includes("曝光") || queryLower.includes("白平衡") || queryLower.includes("镜头")) {
    reply += OFFLINE_ANSWERS["z190"];
  } else if (queryLower.includes("vmix") || queryLower.includes("gt title") || queryLower.includes("字幕") || queryLower.includes("designer")) {
    reply += OFFLINE_ANSWERS["vmix"];
  } else if (queryLower.includes("osse") || queryLower.includes("切换台") || queryLower.includes("导播") || queryLower.includes("应急") || queryLower.includes("多机位")) {
    reply += OFFLINE_ANSWERS["osse"];
  } else {
    reply += OFFLINE_ANSWERS["hello"];
  }

  return res.json({
    content: reply,
    timestamp: new Date().toISOString(),
  });
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
    console.log(`UCASS Media Director Server is active locally at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
