import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DailyAbsurdity } from "@/lib/absurdity";

const SHARE_DIR = path.join(process.cwd(), "public", "share");

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, max = 18) {
  const chars = Array.from(text);
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += max) {
    lines.push(chars.slice(i, i + max).join(""));
  }
  return lines.slice(0, 3);
}

export async function generateShareCard(data: DailyAbsurdity) {
  await mkdir(SHARE_DIR, { recursive: true });
  const lead = data.top_items[0];
  const lines = lead ? wrapText(lead.title, 18) : ["今天的世界，", "暂时没有新离谱。"];
  const fileName = `${data.date}.svg`;
  const filePath = path.join(SHARE_DIR, fileName);
  const publicPath = `/share/${fileName}`;

  const lineSvg = lines
    .map((line, index) => `<text x="72" y="${330 + index * 54}" font-size="40" font-weight="700" fill="#F2FFF9">${escapeXml(line)}</text>`)
    .join("\n");

  const keywordSvg = data.keywords
    .slice(0, 4)
    .map((keyword, index) => {
      const x = 72 + index * 150;
      return `
        <rect x="${x}" y="560" rx="22" ry="22" width="132" height="44" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" />
        <text x="${x + 22}" y="589" font-size="20" fill="#CDEFE1">${escapeXml(keyword)}</text>`;
    })
    .join("\n");

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#071018" />
  <circle cx="170" cy="110" r="220" fill="rgba(114,255,191,0.08)" />
  <circle cx="1040" cy="60" r="180" fill="rgba(111,233,255,0.08)" />
  <rect x="42" y="42" width="1116" height="546" rx="32" fill="rgba(10,20,30,0.82)" stroke="rgba(114,255,191,0.15)" />

  <text x="72" y="110" font-size="24" letter-spacing="6" fill="#72FFBF">TODAY'S ABSURDITY INDEX</text>
  <text x="72" y="180" font-size="72" font-weight="800" fill="#F2FFF9">今日荒谬指数</text>
  <text x="74" y="240" font-size="28" fill="#9DC8B7">${escapeXml(data.date)} · ${escapeXml(data.level)}</text>

  <rect x="846" y="88" width="250" height="180" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
  <text x="875" y="138" font-size="22" fill="#9DC8B7">今日指数</text>
  <text x="875" y="242" font-size="110" font-weight="900" fill="#72FFBF">${data.daily_index}</text>

  <text x="72" y="290" font-size="22" fill="#9DC8B7">今日最值得看的离谱事</text>
  ${lineSvg}

  <text x="72" y="520" font-size="24" fill="#E9FFF6">${escapeXml(data.summary)}</text>
  ${keywordSvg}

  <text x="72" y="610" font-size="20" fill="#7EA394">https://collie.cc</text>
</svg>`;

  await writeFile(filePath, svg.trim(), "utf8");
  return { filePath, publicPath };
}
