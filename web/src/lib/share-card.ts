import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DailyAbsurdity } from "@/lib/absurdity";

const SHARE_DIR = path.join(process.cwd(), "public", "share");

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clampText(text: string, maxChars: number) {
  const chars = Array.from(text || "");
  if (chars.length <= maxChars) return text;
  return `${chars.slice(0, Math.max(0, maxChars - 1)).join("")}…`;
}

function wrapLines(text: string, perLine: number, maxLines: number) {
  const chars = Array.from(text || "");
  const lines: string[] = [];
  for (let i = 0; i < chars.length && lines.length < maxLines; i += perLine) {
    lines.push(chars.slice(i, i + perLine).join(""));
  }

  if (chars.length > perLine * maxLines && lines.length > 0) {
    lines[lines.length - 1] = clampText(lines[lines.length - 1], Math.max(1, perLine - 1));
  }

  return lines;
}

export async function generateShareCard(data: DailyAbsurdity) {
  await mkdir(SHARE_DIR, { recursive: true });

  const fileName = `${data.date}.svg`;
  const filePath = path.join(SHARE_DIR, fileName);
  const publicPath = `/share/${fileName}`;

  const lead = data.top_items[0];
  const leadLines = wrapLines(lead?.title ?? "今天的世界暂时没有新离谱", 15, 2);
  const summary = clampText(data.summary, 34);
  const keywords = data.keywords.slice(0, 4);
  const top3 = data.top_items.slice(0, 3);

  const leadSvg = leadLines
    .map(
      (line, index) =>
        `<text x="72" y="${272 + index * 48}" font-size="36" font-weight="800" fill="#F8FFFC">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const keywordSvg = keywords
    .map((keyword, index) => {
      const x = 72 + index * 138;
      return `
        <rect x="${x}" y="520" rx="18" ry="18" width="120" height="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" />
        <text x="${x + 18}" y="545" font-size="18" fill="#CFEFE3">${escapeXml(clampText(keyword, 5))}</text>`;
    })
    .join("\n");

  const rankingSvg = top3
    .map((item, index) => {
      const y = 164 + index * 108;
      return `
        <text x="760" y="${y}" font-size="16" letter-spacing="2" fill="#7DEAC8">TOP ${index + 1}</text>
        <text x="760" y="${y + 34}" font-size="26" font-weight="800" fill="#F8FFFC">${escapeXml(clampText(item.title, 16))}</text>
        <text x="760" y="${y + 64}" font-size="16" fill="#9CC4B5">${escapeXml(clampText(item.comment, 18))}</text>
        <text x="1088" y="${y + 36}" text-anchor="end" font-size="42" font-weight="900" fill="#72FFBF">${item.score}</text>
        ${index < top3.length - 1 ? '<line x1="760" y1="' + (y + 82) + '" x2="1090" y2="' + (y + 82) + '" stroke="rgba(255,255,255,0.08)" />' : ''}
      `;
    })
    .join("\n");

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#071018" />
  <circle cx="140" cy="90" r="180" fill="rgba(114,255,191,0.08)" />
  <circle cx="1080" cy="70" r="140" fill="rgba(111,233,255,0.08)" />
  <rect x="40" y="40" width="1120" height="550" rx="32" fill="rgba(10,20,30,0.9)" stroke="rgba(114,255,191,0.14)" />

  <text x="72" y="96" font-size="22" letter-spacing="6" fill="#72FFBF">TODAY'S ABSURDITY INDEX</text>
  <text x="72" y="156" font-size="64" font-weight="900" fill="#F8FFFC">今日荒谬指数</text>
  <text x="72" y="206" font-size="24" fill="#95B9AB">${escapeXml(data.date)} · ${escapeXml(data.level)}</text>

  <text x="72" y="236" font-size="18" fill="#7FA494">今日最离谱事件</text>
  ${leadSvg}

  <rect x="72" y="358" width="280" height="122" rx="26" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
  <text x="96" y="398" font-size="20" fill="#95B9AB">今日指数</text>
  <text x="96" y="460" font-size="84" font-weight="900" fill="#72FFBF">${data.daily_index}</text>

  <text x="72" y="498" font-size="22" fill="#E8FFF5">${escapeXml(summary)}</text>
  ${keywordSvg}

  <text x="760" y="96" font-size="22" letter-spacing="4" fill="#95B9AB">TODAY TOP 3</text>
  ${rankingSvg}

  <text x="72" y="614" font-size="18" fill="#6E8C81">https://collie.cc</text>
</svg>`;

  await writeFile(filePath, svg.trim(), "utf8");
  return { filePath, publicPath };
}
