import express from "express";
import { Client } from "@gradio/client";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NOW LOADED FROM .env 🔐
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "@codewithprakhar";

if (!TELEGRAM_BOT_TOKEN) {
  console.error("💀 TELEGRAM_BOT_TOKEN is missing. Go check your .env.");
  process.exit(1);
}

function downloadWithFFmpeg(m3u8Url, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -i "${m3u8Url}" -c copy "${outputPath}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(new Error("FFmpeg error: " + stderr));
      else resolve();
    });
  });
}

async function uploadToGofile(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "https://store1.gofile.io/uploadFile",
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    const data = response.data;
    if (data.status === "ok" && data.data?.downloadPage) {
      return data.data.downloadPage;
    } else {
      throw new Error("Gofile API failed: " + JSON.stringify(data));
    }
  } catch (err) {
    throw new Error("Gofile upload error: " + err.message);
  }
}

function sendToTelegram(filePath, prompt) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("chat_id", TELEGRAM_CHAT_ID);
    form.append("caption", `🎥 Prompt: ${prompt}`);
    form.append("video", fs.createReadStream(filePath));

    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendVideo`,
      method: "POST",
      headers: form.getHeaders(),
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.ok && json.result?.message_id) {
            const msgId = json.result.message_id;
            const messageLink = `https://t.me/${TELEGRAM_CHAT_ID.replace('@', '')}/${msgId}`;
            resolve({
              message_id: msgId,
              message_link: messageLink
            });
          } else {
            reject(new Error("Telegram failed: " + data));
          }
        } catch {
          reject(new Error("Invalid response from Telegram"));
        }
      });
    });

    req.on("error", reject);
    form.pipe(req);
  });
}

app.get("/generate-video", async (req, res) => {
  const { prompt, seed = 3, fps = 10 } = req.query;
  if (!prompt) return res.status(400).send("Missing prompt. This ain't it, chief.");

  try {
    const client = await Client.connect("multimodalart/self-forcing");
    const result = await client.predict("/video_generation_handler_streaming", {
      prompt,
      seed: Number(seed),
      fps: Number(fps),
    });

    const m3u8Url = result.data[0]?.video?.url;
    if (!m3u8Url?.startsWith("http")) throw new Error("Invalid M3U8 URL");

    const filename = `gen_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, filename);

    await downloadWithFFmpeg(m3u8Url, outputPath);
    const publicUrl = await uploadToGofile(outputPath);
    const telegramInfo = await sendToTelegram(outputPath, prompt);

    fs.unlink(outputPath, () => {});
    res.json({
      url: publicUrl,
      message: "Sent to group successfully.",
      link: telegramInfo.message_link
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`🔥 API running on http://localhost:${port}`));
