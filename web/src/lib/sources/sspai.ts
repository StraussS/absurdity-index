import { fetchJson, toAbsurdityItems } from "@/lib/source-utils";

interface SspaiRes {
  data: {
    id: number;
    title: string;
  }[];
}

export async function fetchSspaiItems(limit = 8) {
  const timestamp = Date.now();
  const url = `https://sspai.com/api/v1/article/tag/page/get?limit=${limit}&offset=0&created_at=${timestamp}&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0&released=false`;
  const res = await fetchJson<SspaiRes>(url);
  return toAbsurdityItems(
    res.data.map((item) => ({
      title: item.title,
      link: `https://sspai.com/post/${item.id}`,
      source: "少数派",
    })),
    "sspai",
  );
}
