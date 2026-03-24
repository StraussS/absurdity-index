import { fetchJson, toAbsurdityItems } from "@/lib/source-utils";

interface TencentRes {
  data: {
    tabs: {
      articleList: {
        id: string | number;
        title: string;
        desc?: string;
        link_info?: { url?: string };
      }[];
    }[];
  };
}

export async function fetchTencentItems(limit = 8) {
  const url = "https://i.news.qq.com/web_backend/v2/getTagInfo?tagId=aEWqxLtdgmQ%3D";
  const res = await fetchJson<TencentRes>(url, {
    headers: {
      Referer: "https://news.qq.com/",
    },
  });
  const list = res.data.tabs?.[0]?.articleList ?? [];
  return toAbsurdityItems(
    list
      .filter((item) => item.title && item.link_info?.url)
      .slice(0, limit)
      .map((item) => ({
        title: item.title,
        link: item.link_info?.url as string,
        source: "腾讯新闻",
      })),
    "tencent",
  );
}
