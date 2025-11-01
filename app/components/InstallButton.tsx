"use client";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
  style?: React.CSSProperties;     // ← 추가: inline 스타일 지원
  children?: React.ReactNode;      // 버튼 라벨 커스텀
};

export default function InstallButton({
  className = "",
  style,
  children = "앱 설치",
}: Props) {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!show) return null;

  return (
    <button
      className={className}
      style={style}
      onClick={async () => {
        deferred.prompt();
        await deferred.userChoice; // { outcome: 'accepted' | 'dismissed' }
        setDeferred(null);
        setShow(false);
      }}
    >
      {children}
    </button>
  );
}