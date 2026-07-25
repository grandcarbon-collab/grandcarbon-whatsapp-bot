# Grand Carbon Manufacturing Co. - WhatsApp Cloud API Chatbot

Production-ready Node.js & Express WhatsApp Chatbot engineered specifically for **Render.com**.

## 🚀 Features

- **Automated Customer Support & Lead Generation**: Auto-replies with product options, dimensions guide, and phone support.
- **Admin Lead Alert**: Instant forward of incoming customer enquiries directly to Admin WhatsApp number (`+91 9580868774`).
- **Meta Cloud API Compliant**: Native support for GET `/webhook` verification and POST `/webhook` event receiver.
- **Render.com Ready**: Ships with `render.yaml` Blueprint for zero-friction 1-click web service setup.

---

## 🛠️ Project Structure

```
grandcarbon-whatsapp-bot/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── render.yaml
└── server.js
```

---

## ⚙️ Environment Variables

Add the following environment variables in your Render Dashboard or `.env` file:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Web server port (Render sets this automatically) | `10000` |
| `VERIFY_TOKEN` | Webhook verification token set in Meta Portal | `grandcarbon_verify_123` |
| `WHATSAPP_TOKEN` | Meta Access Token (System User / Permanent) | `EAAG...` |
| `PHONE_NUMBER_ID` | WhatsApp Business Phone Number ID | `941937408996841` |
| `ADMIN_NUMBER` | Admin phone number to receive enquiry alerts | `919580868774` |

---

## 📦 How to Deploy on Render.com

### Step 1: Push Code to GitHub
1. Create a new GitHub Repository named `grandcarbon-whatsapp-bot`.
2. Push all files (`server.js`, `package.json`, `render.yaml`, `.gitignore`, `README.md`) to your main branch:
   ```bash
   git init
   git add .
   git commit -m "Initial Grand Carbon WhatsApp Bot for Render"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/grandcarbon-whatsapp-bot.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `grandcarbon-whatsapp-bot` GitHub repository.
4. Render will automatically detect `render.yaml` configuration:
   - **Name**: `grandcarbon-whatsapp-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, enter your credentials:
   - `VERIFY_TOKEN` = `grandcarbon_verify_123`
   - `WHATSAPP_TOKEN` = `EAAG...`
   - `PHONE_NUMBER_ID` = `941937408996841`
   - `ADMIN_NUMBER` = `919580868774`
6. Click **Create Web Service**.
7. Once deployed, Render will provide your live URL (e.g., `https://grandcarbon-whatsapp-bot.onrender.com`).

---

## 🔗 How to Configure Meta WhatsApp Webhook

1. Go to [Meta Developer Portal](https://developers.facebook.com/apps).
2. Select your WhatsApp App → **WhatsApp** → **Configuration**.
3. Under **Webhook**, click **Edit**:
   - **Callback URL**: `https://grandcarbon-whatsapp-bot.onrender.com/webhook`
   - **Verify Token**: `grandcarbon_verify_123`
4. Click **Verify and Save**.
5. Click **Manage Webhook Fields** and subscribe to **`messages`**.

---

## 🧪 Testing Your Bot

1. Open WhatsApp and send any text message to your WhatsApp Business phone number.
2. The bot will instantly greet you with the Grand Carbon menu!
3. Reply `1` and type your required brush dimensions (`12 × 6 × 4 mm, 200 pairs`).
4. Admin at `+919580868774` will instantly receive the enquiry alert on WhatsApp!
