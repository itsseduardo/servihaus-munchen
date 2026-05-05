"use client"

import { useState } from "react"

interface ClientData {
  firstName: string
  lastName: string
  phone: string
  street: string
  postalCode: string
  city: string
}

interface Props {
  initialData: ClientData
  onComplete: (verifiedData: ClientData) => void
}

export default function ClientOnboardingModal({ initialData, onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ClientData>(initialData)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step === 1) setStep(2)
  }

  const handleComplete = async () => {
    if (!agreedToTerms) return
    setLoading(true)
    onComplete(formData)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Willkommen bei ServiHaus</h2>
            <p className="text-slate-400 text-sm mt-1">Bitte überprüfen und bestätigen Sie Ihre Kontoinformationen.</p>
          </div>
          <span className="material-symbols-outlined text-4xl text-blue-500">verified_user</span>
        </div>

        <div className="p-8">
          <div className="flex items-center mb-8">
            <div className={`h-2 flex-1 rounded-l-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
            <div className={`h-2 flex-1 rounded-r-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">1. Kontaktdaten überprüfen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Vorname</label>
                  <input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Nachname</label>
                  <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Telefonnummer</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Straße und Hausnummer</label>
                  <input 
                    type="text" 
                    value={formData.street} 
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">PLZ</label>
                  <input 
                    type="text" 
                    value={formData.postalCode} 
                    onChange={e => setFormData({...formData, postalCode: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Stadt</label>
                  <input 
                    type="text" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                  Weiter
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">2. Datenschutz & Richtlinien</h3>
              
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm text-slate-600 space-y-4 max-h-[250px] overflow-y-auto">
                <section>
                  <strong className="text-slate-800 block mb-1">Datenverarbeitung (DSGVO)</strong>
                  <p>Durch die Nutzung dieses Portals stimmen Sie der Verarbeitung Ihrer personenbezogenen Daten im ServiHaus-System zu. Ihre Daten werden ausschließlich für die Verwaltung Ihrer Dienstleistungen, die Rechnungsstellung und die interne Logistik verwendet.</p>
                </section>
                
                <section>
                  <strong className="text-slate-800 block mb-1">Exklusive Nutzung durch ServiHaus</strong>
                  <p>Ihre Informationen sind für die exklusive Nutzung durch ServiHaus München bestimmt. Wir geben Ihre Daten nicht an unbefugte Dritte weiter. Die Kommunikation mit unserem Personal erfolgt ausschließlich über das Management, um den Schutz Ihrer Daten zu gewährleisten.</p>
                </section>

                <section>
                  <strong className="text-slate-800 block mb-1">Service-Kommunikation</strong>
                  <p>Terminänderungen oder zusätzliche Leistungen müssen direkt über die Verwaltung genehmigt werden. Direkte Absprachen mit dem Reinigungspersonal außerhalb dieses Protokolls sind nicht zulässig.</p>
                </section>
              </div>

              <label className="flex items-start gap-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Ich akzeptiere die Datenschutzbestimmungen und Service-Richtlinien.</p>
                  <p className="text-xs text-slate-500 mt-1">Dies ist erforderlich, um auf Ihr Kundenportal zuzugreifen.</p>
                </div>
              </label>

              <div className="pt-4 flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                >
                  Zurück
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={!agreedToTerms || loading}
                  className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? 'Speichern...' : 'Bestätigen & Dashboard öffnen'}
                  {!loading && <span className="material-symbols-outlined text-sm">check_circle</span>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}