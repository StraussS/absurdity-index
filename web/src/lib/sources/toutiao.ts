import { fetchJson, toAbsurdityItems } from "@/lib/source-utils";

interface ToutiaoRes {
  data: {
    ClusterIdStr: string;
    Title: string;
  }[];
}

export async function fetchToutiaoItems(limit = 8) {
  const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";
  const res = await fetchJson<ToutiaoRes>(url);
  return toAbsurdityItems(
    res.data.slice(0, limit).map((item) => ({
      title: item.Title,
      link: `https://www.toutiao.com/trending/${item.ClusterIdStr}/`,
      source: "今日头条",
    })),
    "toutiao",
  );
}
