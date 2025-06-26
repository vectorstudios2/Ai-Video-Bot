# 🎥 AI Video Generator + Telegram Bot Delivery

Generate videos from prompts using [multimodalart/self-forcing](https://huggingface.co/spaces/multimodalart/self-forcing), upload them to Gofile, and send them directly to a Telegram group with message link support. All wrapped in a sexy Node.js + Express API.

---

## 🚀 Deploy

### 🔧 Environment Variables (set via `.env` or Render dashboard)

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
````

### 📦 Install Dependencies

```bash
apt-get update && apt-get install -y ffmpeg && npm install
```

### ▶️ Start the Server

```bash
node index.js
```

---

## 🛠️ API Endpoint

### `GET /generate-video`

Generate a video from a prompt and send it to Telegram.

#### Query Parameters:

| Param  | Type   | Required | Description                      |
| ------ | ------ | -------- | -------------------------------- |
| prompt | string | ✅        | The prompt to generate video for |
| seed   | number | ❌        | Random seed (default: 3)         |
| fps    | number | ❌        | Frames per second (default: 10)  |

---

## 📤 Sample Request

```http
GET /generate-video?prompt=elon%20musk%20vs%20zuckerberg
```

### Full Example:

```bash
curl "https://your-render-app.onrender.com/generate-video?prompt=elon%20musk%20vs%20zuckerberg"
```

---

## ✅ Sample JSON Response

```json
{
  "url": "https://gofile.io/d/abc123",
  "message": "Sent to group successfully.",
  "link": "https://t.me/codewithprakhar/87"
}
```

---

## 📦 Features

* ✅ Prompt-based video generation via HuggingFace
* ✅ FFmpeg download of M3U8 streams
* ✅ Gofile upload (no API key needed)
* ✅ Telegram bot sends video to group
* ✅ Response includes direct Telegram message link

---

## 🧠 Notes

* Make sure your **Telegram bot is an admin** in the group.
* `@codewithprakhar` must be a **public group**, or message links won't work.
* `.env` file should never be committed.

---

## 🤖 Example Telegram Message

> 🎥 Prompt: elon musk vs zuckerberg
> *(MP4 video sent to group)*

---

## 💀 Skill Issues?

* FFmpeg not found? Add it in Render build setup or use a Docker image that includes it.
* Telegram errors? Make sure the bot has permission to send videos.
* Gofile upload failed? Retry or check size limits.

---

## 📸 Credits

* Video Gen: [multimodalart/self-forcing](https://huggingface.co/spaces/multimodalart/self-forcing)
* Upload: [Gofile.io](https://gofile.io)
* Messaging: [Telegram Bot API](https://core.telegram.org/bots/api)

---

Made with ❤️ by [Prakhar Doneria](https://t.me/codewithprakhar)