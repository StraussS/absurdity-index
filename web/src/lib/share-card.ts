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

function wrapText(text: string, max = 16) {
  const chars = Array.from(text);
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += max) {
    lines.push(chars.slice(i, i + max).join(""));
  }
  return lines;
}

function trimLine(text: string, max = 24) {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return `${chars.slice(0, max - 1).join("")}…`;
}

export async function generateShareCard(data: DailyAbsurdity) {
  await mkdir(SHARE_DIR, { recursive: true });
  const lead = data.top_items[0];
  const fileName = `${data.date}.svg`;
  const filePath = path.join(SHARE_DIR, fileName);
  const publicPath = `/share/${fileName}`;

  const leadLines = lead ? wrapText(lead.title, 16).slice(0, 2) : ["今天的世界", "暂时没有新离谱"];
  const leadSvg = leadLines
    .map((line, index) => `<text x="72" y="${284 + index * 50}" font-size="38" font-weight="800" fill="#F2FFF9">${escapeXml(line)}</text>`)
    .join("\n");

  const keywordSvg = data.keywords
    .slice(0, 4)
    .map((keyword, index) => {
      const x = 72 + index * 150;
      return `
        <rect x="${x}" y="548" rx="20" ry="20" width="132" height="42" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" />
        <text x="${x + 20}" y="575" font-size="19" fill="#CDEFE1">${escapeXml(keyword)}</text>`;
    })
    .join("\n");

  const rankingSvg = data.top_items
    .slice(0, 3)
    .map((item, index) => {
      const y = 170 + index * 105;
      return `
        <rect x="760" y="${y}" width="360" height="88" rx="22" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.08)" />
        <text x="788" y="${y + 34}" font-size="18" fill="#7DEAC8">TOP ${index + 1}</text>
        <text x="1090" y="${y + 36}" font-size="34" text-anchor="end" font-weight="900" fill="#72FFBF">${item.score}</text>
        <text x="788" y="${y + 66}" font-size="22" font-weight="700" fill="#F2FFF9">${escapeXml(trimLine(item.title, 18))}</text>
      `;
    })
    .join("\n");

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#071018" />
  <circle cx="170" cy="110" r="220" fill="rgba(114,255,191,0.08)" />
  <circle cx="1040" cy="60" r="180" fill="rgba(111,233,255,0.08)" />
  <circle cx="1040" cy="590" r="220" fill="rgba(255,179,71,0.06)" />
  <rect x="42" y="42" width="1116" height="546" rx="32" fill="rgba(10,20,30,0.86)" stroke="rgba(114,255,191,0.15)" />

  <text x="72" y="98" font-size="24" letter-spacing="6" fill="#72FFBF">TODAY'S ABSURDITY INDEX</text>
  <text x="72" y="162" font-size="68" font-weight="900" fill="#F2FFF9">今日荒谬指数</text>
  <text x="74" y="214" font-size="26" fill="#9DC8B7">${escapeXml(data.date)} · ${escapeXml(data.level)}</text>

  <rect x="72" y="382" width="292" height="126" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
  <text x="100" y="426" font-size="22" fill="#9DC8B7">今日指数</text>
  <text x="100" y="492" font-size="88" font-weight="900" fill="#72FFBF">${data.daily_index}</text>

  <text x="72" y="246" font-size="20" fill="#9DC8B7">今日最值得看的离谱事</text>
  ${leadSvg}

  <text x="72" y="530" font-size="24" fill="#E9FFF6">${escapeXml(trimLine(data.summary, 28))}</text>
  ${keywordSvg}

  <text x="760" y="118" font-size="24" fill="#9DC8B7">今日 TOP 3</text>
  ${rankingSvg}

  <text x="72" y="612" font-size="20" fill="#7EA394">https://collie.cc</text>
  <text x="1118" y="612" font-size="18" text-anchor="end" fill="#5E7E72">Top 10 · Multi-source Digest</text>
</svg>`;

  await writeFile(filePath, svg.trim(), "utf8");
  return { filePath, publicPath };
}
