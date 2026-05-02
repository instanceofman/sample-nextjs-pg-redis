"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

export default function Home() {
  const utils = api.useUtils();
  const visitorCount = api.stats.visitorCount.useQuery();
  const bumpVisitor = api.stats.bumpVisitor.useMutation({
    onSuccess: () => utils.stats.visitorCount.invalidate(),
  });

  const guestbook = api.guestbook.list.useQuery();
  const addEntry = api.guestbook.add.useMutation({
    onSuccess: () => {
      setName("");
      setMessage("");
      utils.guestbook.list.invalidate();
    },
  });

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    bumpVisitor.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Vane sample app</h1>
      <p className="opacity-70 mb-8">
        Next.js + tRPC + Drizzle + Postgres 18 + Redis 8
      </p>

      <section className="mb-10 rounded-lg border border-black/10 dark:border-white/10 p-5">
        <h2 className="text-lg font-semibold mb-1">Visitor counter (Redis)</h2>
        <p className="opacity-70 text-sm mb-3">
          Tăng <code>vane:sample:visitors</code> bằng <code>INCR</code> mỗi lần load trang.
        </p>
        <p className="text-2xl font-mono">
          {visitorCount.isLoading ? "…" : (visitorCount.data?.count ?? 0)}
        </p>
      </section>

      <section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
        <h2 className="text-lg font-semibold mb-1">Guestbook (Postgres)</h2>
        <p className="opacity-70 text-sm mb-4">
          Mỗi entry insert vào table <code>guestbook</code>.
        </p>

        <form
          className="flex flex-col gap-2 mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !message.trim()) return;
            addEntry.mutate({ name: name.trim(), message: message.trim() });
          }}
        >
          <input
            className="border border-black/15 dark:border-white/15 bg-transparent rounded px-3 py-2"
            placeholder="Tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
          />
          <textarea
            className="border border-black/15 dark:border-white/15 bg-transparent rounded px-3 py-2"
            placeholder="Lời nhắn"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <button
            type="submit"
            disabled={addEntry.isPending}
            className="self-start rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {addEntry.isPending ? "Đang gửi…" : "Gửi"}
          </button>
        </form>

        <ul className="flex flex-col gap-3">
          {guestbook.isLoading && <li className="opacity-60">Đang tải…</li>}
          {guestbook.data?.length === 0 && (
            <li className="opacity-60">Chưa có entry nào.</li>
          )}
          {guestbook.data?.map((row) => (
            <li
              key={row.id}
              className="border border-black/10 dark:border-white/10 rounded p-3"
            >
              <div className="text-sm font-semibold">{row.name}</div>
              <div className="text-sm whitespace-pre-wrap">{row.message}</div>
              <div className="text-xs opacity-60 mt-1">
                {new Date(row.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 text-xs opacity-60">
        Health check: <a className="underline" href="/api/health">/api/health</a>
      </footer>
    </main>
  );
}
