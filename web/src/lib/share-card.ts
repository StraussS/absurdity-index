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
  const leadLines = wrapLines(lead?.title ?? "今天的世界暂时没有新离谱", 12, 3);
  const summary = clampText(data.summary, 24);
  const top3 = data.top_items.slice(0, 3);
  const keywords = data.keywords.slice(0, 3);

  const leadSvg = leadLines
    .map(
      (line, index) =>
        `<text x="72" y="${320 + index * 74}" font-size="60" font-weight="900" fill="#0B0F14">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const rankingSvg = top3
    .map((item, index) => {
      const y = 960 + index * 116;
      return `
        <rect x="68" y="${y}" width="944" height="92" rx="28" fill="rgba(255,255,255,0.82)" />
        <text x="100" y="${y + 34}" font-size="20" font-weight="800" fill="#FF3B30">TOP ${index + 1}</text>
        <text x="100" y="${y + 68}" font-size="28" font-weight="800" fill="#111827">${escapeXml(clampText(item.title, 19))}</text>
        <text x="970" y="${y + 64}" text-anchor="end" font-size="40" font-weight="900" fill="#111827">${item.score}</text>
      `;
    })
    .join("\n");

  const keywordSvg = keywords
    .map((keyword, index) => {
      const x = 72 + index * 180;
      return `
        <rect x="${x}" y="858" rx="22" ry="22" width="150" height="46" fill="#111827" fill-opacity="0.08" />
        <text x="${x + 22}" y="888" font-size="24" font-weight="700" fill="#1F2937">${escapeXml(clampText(keyword, 6))}</text>`;
    })
    .join("\n");

  const svg = `
<svg width="1080" height="1440" viewBox="0 0 1080 1440" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1440" fill="#F5F1E8" />
  <rect x="0" y="0" width="1080" height="260" fill="#FF5A36" />
  <circle cx="950" cy="160" r="220" fill="rgba(255,255,255,0.12)" />
  <circle cx="120" cy="1320" r="200" fill="rgba(255,90,54,0.10)" />

  <text x="72" y="110" font-size="34" font-weight="800" fill="#FFF7ED">今日荒谬指数</text>
  <text x="72" y="162" font-size="24" font-weight="700" fill="#FFE7D9">${escapeXml(data.date)}</text>
  <text x="72" y="220" font-size="88" font-weight="900" fill="#FFFFFF">TOP 10 离谱事件</text>

  <rect x="56" y="286" width="968" height="520" rx="42" fill="#FFF8EE" />
  <text x="72" y="272" font-size="22" font-weight="800" fill="#9A3412">今日最离谱</text>
  ${leadSvg}

  <rect x="72" y="620" width="330" height="122" rx="34" fill="#111827" />
  <text x="108" y="674" font-size="28" font-weight="700" fill="#D1FAE5">今日指数</text>
  <text x="108" y="730" font-size="86" font-weight="900" fill="#6EE7B7">${data.daily_index}</text>

  <rect x="430" y="620" width="520" height="122" rx="34" fill="#FFFFFF" fill-opacity="0.88" />
  <text x="466" y="674" font-size="24" font-weight="800" fill="#374151">${escapeXml(data.level)}</text>
  <text x="466" y="722" font-size="28" font-weight="700" fill="#111827">${escapeXml(summary)}</text>

  ${keywordSvg}

  <text x="72" y="934" font-size="30" font-weight="900" fill="#111827">今天最值得看的 3 条</text>
  ${rankingSvg}

  <text x="72" y="1374" font-size="24" font-weight="700" fill="#6B7280">${escapeXml(lead?.comment ? clampText(lead.comment, 18) : "现实有时比段子更会写段子")}</text>
  <text x="72" y="1412" font-size="18" font-weight="700" fill="#9CA3AF">collie.cc</text>
</svg>`;

  await writeFile(filePath, svg.trim(), "utf8");
  return { filePath, publicPath };
}
