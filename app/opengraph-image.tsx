import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "現場の経験を、次のキャリアの武器に。";

const TITLE = "現場の経験を、次のキャリアの武器に。";
const SUBTITLE = "AI研修付き転職支援プログラム";
const NOTE = "6週間・費用は採用企業側負担";

// satoriはwoff2非対応のため、旧ブラウザUAでGoogle FontsからTTFサブセットを取得する
async function loadNotoSansJP(): Promise<ArrayBuffer | null> {
  try {
    const text = encodeURIComponent(TITLE + SUBTITLE + NOTE);
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${text}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } }
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/url\((https:\/\/[^)]+)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const font = await loadNotoSansJP();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#12303D",
          color: "#ffffff",
          fontFamily: font ? "Noto Sans JP" : undefined,
        }}
      >
        <div
          style={{
            width: 120,
            height: 12,
            backgroundColor: "#E8833A",
            borderRadius: 6,
            marginBottom: 48,
          }}
        />
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.4 }}>
          {font ? TITLE : "AI x CAREER PROGRAM"}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: "#EFF4F6",
            opacity: 0.85,
          }}
        >
          {font ? `${SUBTITLE}（${NOTE}）` : "6-week program"}
        </div>
        <div
          style={{
            marginTop: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#1C7293",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: "#1C7293",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [
            {
              name: "Noto Sans JP",
              data: font,
              weight: 700,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
