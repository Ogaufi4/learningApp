import { ImageResponse } from "next/og";
import { defaultDescription, defaultSiteName, defaultTitle } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f7fee7 0%, #ffffff 42%, #ecfccb 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -80,
            width: 320,
            height: 320,
            borderRadius: 9999,
            background: "rgba(88, 204, 2, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -120,
            bottom: -140,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: "rgba(234, 179, 8, 0.12)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 64px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 760 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#3f6212",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: "#58cc02",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  fontWeight: 900,
                }}
              >
                P
              </div>
              {defaultSiteName}
            </div>
            <div style={{ fontSize: 74, lineHeight: 1.06, fontWeight: 900, color: "#0f172a" }}>{defaultTitle}</div>
            <div style={{ fontSize: 30, lineHeight: 1.35, color: "#475569", maxWidth: 860 }}>{defaultDescription}</div>
          </div>

          <div style={{ display: "flex", gap: 18 }}>
            {["Interactive lessons", "Speaking practice", "Botswana-inspired games"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 9999,
                  background: "white",
                  border: "2px solid #d1d5db",
                  padding: "16px 24px",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
