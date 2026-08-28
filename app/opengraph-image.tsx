import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI研修付き転職支援プログラム（6週間・費用は採用企業側負担）";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 既定フォントは日本語グリフを含まないため、OG画像内の文字は欧文で構成する。
// 日本語入りの画像に差し替える場合は public/ に静的画像を置き、metadata から参照する。
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#12303D",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#EFF4F6",
            fontSize: 28,
            letterSpacing: 4,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "#E8833A",
              borderRadius: 6,
            }}
          />
          CAREER PROGRAM
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#FFFFFF", fontSize: 88, fontWeight: 700 }}>
            AI × Career
          </div>
          <div style={{ color: "#E8833A", fontSize: 40, marginTop: 12 }}>
            6-week program
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#EFF4F6", fontSize: 26, opacity: 0.8 }}>
            Copilot Training / Microsoft AB-730
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#1C7293",
              color: "#FFFFFF",
              fontSize: 24,
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            APPLY
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
