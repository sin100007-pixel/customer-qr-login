export const metadata = { title: "Customer QR Login" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "ui-sans-serif, system-ui", padding: 20, background: "#0b1220", color: "#fff" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
