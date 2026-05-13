"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ChangePasswordPage() {
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    try {
      setError("")
      setLoading(true)

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Passwort konnte nicht geändert werden.")
        return
      }

      router.push("/client/dashboard")
      router.refresh()
    } catch {
      setError("Passwort konnte nicht geändert werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <span className="material-symbols-outlined text-4xl">
              lock_reset
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-950">
            Passwort ändern
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Aus Sicherheitsgründen müssen Sie Ihr Passwort beim ersten Login
            ändern.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Neues Passwort
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Passwort bestätigen
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-black text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Speichern..." : "Passwort speichern"}
          </button>
        </form>
      </section>
    </main>
  )
}