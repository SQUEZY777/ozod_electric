"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Arrow } from "@/components/icons";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Ошибка соединения");
    }
  }

  return (
    <main className="blueprint grid min-h-svh place-items-center px-4">
      <form onSubmit={submit} className="panel w-full max-w-sm p-7 sm:p-8">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-extrabold uppercase text-bone">Админ-панель</h1>
        <p className="mt-2 text-sm text-mute">Цены калькулятора, портфолио и заявки.</p>
        {!configured && (
          <p className="mt-5 border border-gold/40 p-3 text-[13px] leading-relaxed text-gold">
            Задайте ADMIN_PASSWORD и ADMIN_SECRET в файле .env и перезапустите сервер.
          </p>
        )}
        <label className="mt-6 block">
          <span className="kicker mb-2 block">Пароль</span>
          <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus />
        </label>
        {error && <p className="mt-3 text-sm text-gold">{error}</p>}
        <button type="submit" disabled={busy || !password} className="btn btn-gold mt-6 w-full disabled:opacity-50">
          {busy ? "Проверяем…" : "Войти"}
          <Arrow />
        </button>
      </form>
    </main>
  );
}
