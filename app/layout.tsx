// app/layout.tsx
import SWRegister from './sw-register';

export const metadata = {
  title: "EGOSE QR",
  applicationName: "EGOSE QR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* manifest 캐시 버스트로 최신 값 강제 로드 */}
        <link rel="manifest" href="/manifest.webmanifest?v=3" />

        {/* PWA 색상/상태바 */}
        <meta name="theme-color" content="#0b1220" />

        {/* iOS 홈화면 앱 이름은 이 메타(또는 <title>)를 사용 */}
        <meta name="apple-mobile-web-app-title" content="EGOSE QR" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* iOS 아이콘: 180x180이 있으면 교체, 없으면 192 사용해도 동작함 */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body style={{ fontFamily: "ui-sans-serif, system-ui", padding: 20, background: "#0b1220", color: "#fff" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>{children}</div>
        <SWRegister />
      </body>
    </html>
  );
}
