"use client";
import { useEffect } from "react";

export default function SaveName({ name }: { name: string }) {
  useEffect(() => {
    if (!name) return;
    try {
      localStorage.setItem("session_user", encodeURIComponent(name));
    } catch {}
  }, [name]);
  return null;
}
