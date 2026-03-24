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
  const leadLines = wrapLines(lead?.title ?? "今天的世界暂时没有新离谱", 13, 3);
  const summary = clampText(data.summary, 22);
  const top5 = data.top_items.slice(0, 5);
  const keywords = data.keywords.slice(0, 3);

  const leadSvg = leadLines
    .map(
      (line, index) =>
        `<text x="68" y="${330 + index * 62}" font-size="50" font-weight="900" fill="#111827">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const rankingSvg = top5
    .map((item, index) => {
      const y = 884 + index * 88;
      return `
        <rect x="56" y="${y}" width="968" height="68" rx="22" fill="rgba(255,255,255,0.86)" />
        <text x="86" y="${y + 24}" font-size="17" font-weight="800" fill="#F97316">TOP ${index + 1}</text>
        <text x="86" y="${y + 48}" font-size="24" font-weight="800" fill="#111827">${escapeXml(clampText(item.title, 22))}</text>
        <text x="986" y="${y + 46}" text-anchor="end" font-size="28" font-weight="900" fill="#111827">${item.score}</text>
      `;
    })
    .join("\n");

  const keywordSvg = keywords
    .map((keyword, index) => {
      const x = 68 + index * 168;
      return `
        <rect x="${x}" y="820" rx="20" ry="20" width="138" height="42" fill="#111827" fill-opacity="0.08" />
        <text x="${x + 18}" y="847" font-size="22" font-weight="700" fill="#374151">${escapeXml(clampText(keyword, 6))}</text>`;
    })
    .join("\n");

  const svg = `
<svg width="1080" height="1440" viewBox="0 0 1080 1440" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1440" fill="#F7F3EC" />
  <rect x="0" y="0" width="1080" height="230" fill="#FF6A3D" />
  <circle cx="940" cy="120" r="200" fill="rgba(255,255,255,0.12)" />
  <circle cx="160" cy="1290" r="180" fill="rgba(255,106,61,0.08)" />

  <text x="68" y="96" font-size="32" font-weight="800" fill="#FFF7ED">今日荒谬指数</text>
  <text x="68" y="142" font-size="22" font-weight="700" fill="#FFE7D9">${escapeXml(data.date)}</text>
  <text x="68" y="204" font-size="72" font-weight="900" fill="#FFFFFF">TOP 5 离谱事件</text>

  <rect x="44" y="254" width="992" height="500" rx="42" fill="#FFF8EE" />
  <text x="68" y="276" font-size="20" font-weight="800" fill="#C2410C">今天最离谱</text>
  ${leadSvg}

  <rect x="68" y="596" width="260" height="110" rx="30" fill="#111827" />
  <text x="96" y="640" font-size="24" font-weight="700" fill="#D1FAE5">今日指数</text>
  <text x="96" y="694" font-size="64" font-weight="900" fill="#6EE7B7">${data.daily_index}</text>

  <rect x="352" y="596" width="628" height="110" rx="30" fill="rgba(255,255,255,0.88)" />
  <text x="386" y="638" font-size="22" font-weight="800" fill="#374151">${escapeXml(data.level)}</text>
  <text x="386" y="684" font-size="26" font-weight="700" fill="#111827">${escapeXml(summary)}</text>

  ${keywordSvg}

  <text x="68" y="856" font-size="28" font-weight="900" fill="#111827">今天最值得看的 5 条</text>
  ${rankingSvg}

  <text x="68" y="1372" font-size="22" font-weight="700" fill="#6B7280">${escapeXml(lead?.comment ? clampText(lead.comment, 18) : "现实有时比段子更会写段子")}</text>
  <text x="68" y="1410" font-size="18" font-weight="700" fill="#9CA3AF">collie.cc</text>
</svg>`;

  await writeFile(filePath, svg.trim(), "utf8");
  return { filePath, publicPath };
}
