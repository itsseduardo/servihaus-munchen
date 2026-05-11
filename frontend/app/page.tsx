import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Services from "@/components/Services"
import TrustStats from "@/components/TrustStats"
import CTA from "@/components/CTA"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />

        <section id="leistungen" className="scroll-mt-24">
          <Services />
        </section>

        <section id="ueber-uns" className="scroll-mt-24">
          <TrustStats />
        </section>

        <section id="kontakt" className="scroll-mt-24">
          <CTA />
        </section>
      </main>

      <Footer />
    </>
  )
}