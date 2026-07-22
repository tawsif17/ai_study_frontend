import { ImageResponse } from "next/og"

export const alt = "Shikkha Buddy SSC practice"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eef6ff 0%, #ffffff 52%, #e9fbf2 100%)",
          color: "#17223b",
          fontFamily: "Arial, sans-serif",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "760px" }}>
            <div style={{ color: "#1375c9", fontSize: 34, fontWeight: 700 }}>Shikkha Buddy</div>
            <div style={{ marginTop: 28, fontSize: 66, lineHeight: 1.08, fontWeight: 800 }}>Practice smarter for SSC exams</div>
            <div style={{ marginTop: 26, fontSize: 29, color: "#516078" }}>General Math · Physics · Chemistry</div>
          </div>
          <div style={{ display: "flex", height: 240, width: 240, alignItems: "center", justifyContent: "center", borderRadius: 52, background: "#1375c9", color: "white", fontSize: 112, fontWeight: 800 }}>SB</div>
        </div>
      </div>
    ),
    size,
  )
}
