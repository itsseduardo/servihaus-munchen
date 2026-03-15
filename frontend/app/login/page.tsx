"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/admin/calendar",
    })

    if (result?.error) {
      setError("Invalid credentials")
    } else if (result?.url) {
      router.push(result.url)
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
      
      {/* Header */}
      <header className="w-full px-6 lg:px-12 py-6 flex items-center justify-between bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-primary">
          <div className="size-8 flex items-center justify-center">
            <span className="material-symbols-outlined">home_repair_service</span>
          </div>
          <h1 className="text-slate-900 dark:text-slate-100 text-xl font-bold uppercase tracking-widest">
            ServiHaus
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-xl p-8 lg:p-10">

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your professional credentials to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@servihausmunchen.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                  Password
                </label>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 group"
            >
              Sign In
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>
        </div>
      </main>

      {/* Decorative gradient */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent blur-3xl opacity-50"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl opacity-50"></div>
    </div>
  )
}