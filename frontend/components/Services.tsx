"use client"

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"

type ServiceKey = "cleaning" | "moving" | "handyman"

type ServiceCard = {
  key: ServiceKey
  title: string
  description: string
  image: string
}

type CleaningFormData = {
  serviceType: string
  name: string
  phone: string
  email: string
  address: string
  frequency: string
  preferredDate: string
  notes: string
}

const CONTACT_EMAIL = "josevc@servihausmunchen.de"

const services: ServiceCard[] = [
  {
    key: "cleaning",
    title: "Unterhaltsreinigung",
    description:
      "Regelmäßige und gründliche Reinigung für private und geschäftliche Räumlichkeiten.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQQ4uE-O9f-huKFmYk3jAHA8TLOVDyEdN29fp20aMegZGKGZnIT3PN9HGq-KRiHD9D6IxEndJKlDmTUo-Vx4UIMPBdtP5pi83gheB9LZIBRXg2c6pFRQSLsK2qLanCc5x5VbwIvZWoNh9R2JQz4bhqtxULy_kn_vdOmqFDDfw56TpWs1F8H-zd677y5pXovBKAN5E6nokjHOdaJfoCtOHKxCYUjA_Tt2HYAmM-jh908jkH2zV1nNukyJUN5e-UAlEtw_DxGAeeFAg",
  },
  {
    key: "moving",
    title: "Umzugsservice",
    description:
      "Sicherer und stressfreier Transport Ihrer Möbel und Kartons in Ihr neues Zuhause.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0N_jF1xln6hey7nik9fLbYOvfSmAOha-VLefECKLQAFCNkGJdkfO-BPjRGgt4O4mPvQ4E-ySmQsieTy-24AoYUeaL38HKgj2mwickfA5AyNeQhfPg14hFU3MrCfyCYZqPgwkmOMwdW_INHkKqzw__dBwhHAlMkUPgkeVFxOoM3g8dxSu66hV8uPjUjE_oK9I7Nuh4B0ewbRnSnbUjYnNt_e6Wt-lVxVHrxocQUTIp9s6C346ClMsPLA7Ih9GcYfD0sG05Oabl6TM",
  },
  {
    key: "handyman",
    title: "Handwerkerservice",
    description:
      "Kompetente Reparaturen, Montagen und Instandhaltung durch qualifizierte Fachkräfte.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuvuTk7vlzqNtXm73AILbCltYENlbSoNqMLc-eh25qnJZSaK9_G3q2CcvxoA3YCRKM5wCBZe3l1Wwj06Pz1lbLjLZw15rUDHBr78CXHjVV80EFOdYWN8FxFNUwlPIcRbQC_m6CJ8A8rwLI9mg4R6nd_sZ79HsaWNnNFG-LlXp_ss8IZh8BREMtoaBHiNrKrfYpwc1XKIepN_YboHasiFVIvWNB9eHo54BMd5g9X-QVtKK3eZE7dmFsEPxXCkvo3MJ1IWvK6tlfNDw",
  },
]

const cleaningServiceTypes = [
  "Privathaushalt",
  "Büroreinigung",
  "Treppenhausreinigung",
  "Praxis / Studio",
  "Gewerbliche Reinigung",
  "Sonstiges",
]

const frequencyOptions = [
  "Einmalig",
  "Wöchentlich",
  "Alle 2 Wochen",
  "Monatlich",
  "Nach Vereinbarung",
]

const initialCleaningForm: CleaningFormData = {
  serviceType: "Privathaushalt",
  name: "",
  phone: "",
  email: "",
  address: "",
  frequency: "Wöchentlich",
  preferredDate: "",
  notes: "",
}

export default function Services() {
  const [activeModal, setActiveModal] = useState<ServiceKey | null>(null)

  const selectedService = useMemo(
    () => services.find((service) => service.key === activeModal),
    [activeModal]
  )

  function closeModal() {
    setActiveModal(null)
  }

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">
          Was wir tun
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Unsere Dienstleistungen
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.key}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${service.image})` }}
              />

              <div className="p-7">
                <h3 className="text-2xl font-black text-slate-950">
                  {service.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-base leading-7 text-slate-500">
                  {service.description}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveModal(service.key)}
                  className="mt-6 inline-flex items-center gap-2 text-base font-black text-blue-600 transition-all hover:gap-3 hover:text-blue-700"
                >
                  Mehr erfahren
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeModal === "cleaning" && (
        <CleaningRequestModal onClose={closeModal} />
      )}

      {activeModal !== "cleaning" && selectedService && (
        <ComingSoonModal service={selectedService} onClose={closeModal} />
      )}
    </section>
  )
}

function CleaningRequestModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] =
    useState<CleaningFormData>(initialCleaningForm)
  const [error, setError] = useState("")

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formData.name.trim()) {
      setError("Bitte geben Sie Ihren Namen ein.")
      return
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setError("Bitte geben Sie mindestens Telefon oder E-Mail an.")
      return
    }

    setError("")

    const subject = `Anfrage ${formData.serviceType} - ServiHaus München`

    const body = [
      "Hallo ServiHaus München,",
      "",
      "ich möchte ein Angebot für eine Unterhaltsreinigung anfordern.",
      "",
      `Gewünschte Leistung: ${formData.serviceType}`,
      `Häufigkeit: ${formData.frequency}`,
      `Wunschtermin: ${formData.preferredDate || "Noch offen"}`,
      "",
      "Kontaktdaten:",
      `Name: ${formData.name}`,
      `Telefon: ${formData.phone || "Nicht angegeben"}`,
      `E-Mail: ${formData.email || "Nicht angegeben"}`,
      `Adresse: ${formData.address || "Nicht angegeben"}`,
      "",
      "Weitere Informationen:",
      formData.notes || "Keine zusätzlichen Angaben.",
      "",
      "Vielen Dank.",
    ].join("\n")

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailto
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="grid max-h-[90vh] overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative hidden overflow-hidden bg-blue-600 p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.18),_transparent_40%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <span className="material-symbols-outlined text-3xl">
                  cleaning_services
                </span>
              </div>

              <h3 className="mt-8 text-4xl font-black leading-tight">
                Unterhaltsreinigung für Ihr Zuhause oder Unternehmen
              </h3>

              <p className="mt-5 text-sm font-medium leading-7 text-blue-50">
                Wir bieten regelmäßige und zuverlässige Reinigungsleistungen für
                private Haushalte, Büros, Treppenhäuser, Praxen und gewerbliche
                Räume in München und Umgebung.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">
                Anfrage per E-Mail
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                Nach dem Absenden öffnet sich Ihr E-Mail-Programm mit allen
                Angaben automatisch vorausgefüllt.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-7 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Angebot anfordern
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                Welche Reinigung benötigen Sie?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Wählen Sie die gewünschte Leistung aus und ergänzen Sie Ihre
                Kontaktdaten.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800"
              aria-label="Modal schließen"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Art der Reinigung
              </label>

              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {cleaningServiceTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ihr Name"
                required
              />

              <TextField
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+49 ..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="E-Mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@email.de"
              />

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Häufigkeit
                </label>

                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                >
                  {frequencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TextField
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Straße, PLZ, Ort"
            />

            <TextField
              label="Wunschtermin"
              name="preferredDate"
              type="text"
              value={formData.preferredDate}
              onChange={handleChange}
              placeholder="z. B. nächste Woche, Montagvormittag"
            />

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Weitere Informationen
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Größe der Fläche, besondere Wünsche, Haustiere, Schlüsselübergabe..."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-xl">mail</span>
                Anfrage per E-Mail vorbereiten
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-600 transition-all hover:bg-slate-50"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalShell>
  )
}

function ComingSoonModal({
  service,
  onClose,
}: {
  service: ServiceCard
  onClose: () => void
}) {
  const isMoving = service.key === "moving"

  return (
    <ModalShell onClose={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div
          className="h-52 bg-cover bg-center sm:h-64"
          style={{ backgroundImage: `url(${service.image})` }}
        />

        <div className="p-6 text-center sm:p-8">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${
              isMoving
                ? "bg-amber-50 text-amber-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <span className="material-symbols-outlined text-4xl">
              {isMoving ? "inventory_2" : "handyman"}
            </span>
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Bald verfügbar
          </p>

          <h3 className="mt-2 text-3xl font-black text-slate-950">
            {service.title}
          </h3>

          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500">
            Dieser Servicebereich wird gerade vorbereitet. Schon bald können Sie
            hier Informationen ansehen und eine Anfrage direkt über die Webseite
            starten.
          </p>

          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-700">
              In der Zwischenzeit können Sie uns gerne direkt per E-Mail
              kontaktieren.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                `Anfrage ${service.title} - ServiHaus München`
              )}&body=${encodeURIComponent(
                `Hallo ServiHaus München,\n\nich interessiere mich für den Service: ${service.title}.\n\nMein Name:\nTelefon:\nAdresse:\nWeitere Informationen:\n\nVielen Dank.`
              )}`}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-xl">mail</span>
              Per E-Mail anfragen
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-sm font-black text-slate-500 transition-colors hover:text-slate-900"
          >
            Schließen
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Modal schließen"
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string
  name: keyof CleaningFormData
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
        {required && <span className="text-blue-600"> *</span>}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  )
}