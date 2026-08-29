/** YouTubeの各種URL形式から埋め込み用URLを作る（不正なURLはnull） */
export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0] || null;
    } else if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v");
      } else if (
        u.pathname.startsWith("/embed/") ||
        u.pathname.startsWith("/live/") ||
        u.pathname.startsWith("/shorts/")
      ) {
        id = u.pathname.split("/")[2] || null;
      }
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
