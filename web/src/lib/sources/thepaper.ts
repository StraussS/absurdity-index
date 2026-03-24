import { fetchJson, toAbsurdityItems } from "@/lib/source-utils";

interface ThePaperRes {
  data: {
    hotNews: {
      contId: string;
      name: string;
      pubTimeLong: string;
    }[];
  };
}

export async function fetchThePaperItems(limit = 8) {
  const url = "https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar";
  const res = await fetchJson<ThePaperRes>(url);
  return toAbsurdityItems(
    res.data.hotNews.slice(0, limit).map((item) => ({
      title: item.name,
      link: `https://www.thepaper.cn/newsDetail_forward_${item.contId}`,
      pubDate: Number(item.pubTimeLong),
      source: "澎湃新闻",
    })),
    "thepaper",
  );
}
