import nodemailer from 'nodemailer';

async function sendTelegram(config, text) {
  const url = `https://api.telegram.org/bot${encodeURIComponent(config.bot_token)}/sendMessage`;
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: config.chat_id, text, disable_web_page_preview: true }) });
  if (!r.ok) throw new Error(`telegram_http_${r.status}`);
}

async function sendWebhook(config, payload) {
  const r = await fetch(config.url, { method: 'POST', headers: { 'content-type': 'application/json', ...(config.headers || {}) }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`webhook_http_${r.status}`);
}

async function sendEmail(config, subject, text) {
  const transporter = nodemailer.createTransport({ host: config.host, port: Number(config.port || 587), secure: Boolean(config.secure), auth: config.username ? { user: config.username, pass: config.password } : undefined });
  await transporter.sendMail({ from: config.from || config.username, to: config.to, subject, text });
}

export async function notify(channel, alert) {
  const config = typeof channel.config === 'string' ? JSON.parse(channel.config) : channel.config;
  const text = `[${alert.severity}] ${alert.title}\n${alert.message || ''}\nHost: ${alert.host_name || alert.host_id}`;
  if (channel.type === 'TELEGRAM') return sendTelegram(config, text);
  if (channel.type === 'WEBHOOK') return sendWebhook(config, { event: 'ALERT', alert, text });
  if (channel.type === 'EMAIL') return sendEmail(config, alert.title, text);
  throw new Error(`unsupported_channel_${channel.type}`);
}
