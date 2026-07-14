"use client";

import { ArrowLeft, ArrowRight, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth";

const photoSheet = "/landing-classroom-grid.png";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Games", href: "/games" },
  { label: "About Us", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

const courseLinks = ["Setswana", "Pronunciation", "Culture", "Games", "Test Prep"];
const companyLinks = ["About Us", "Contact Us", "Careers", "Privacy Policy", "Terms of Use"];
const resourceLinks = ["Courses", "Games", "PuoSpeech", "All Lessons"];
const audiencePaths = [
  {
    title: "Tourists",
    copy: "Quick greetings, places, culture notes, and practical phrases for moving through Botswana with respect.",
  },
  {
    title: "School students",
    copy: "Structured lessons, revision, games, and progress cues for learners building confidence for class.",
  },
  {
    title: "Native and heritage learners",
    copy: "A dignified way to reconnect with a mother language or learn another local language with cultural depth.",
  },
];

function PhotoBlock({
  area,
  className,
}: {
  area: "hero" | "teacher" | "classroom" | "study";
  className: string;
}) {
  const positions = {
    hero: "0% 0%",
    teacher: "100% 0%",
    classroom: "0% 100%",
    study: "100% 100%",
  };

  return (
    <div
      className={`bg-cover bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${photoSheet})`,
        backgroundPosition: positions[area],
        backgroundSize: "200% 200%",
      }}
      aria-hidden="true"
    />
  );
}

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex flex-col items-start">
      <p className="text-sm font-black text-[#17181f]">{children}</p>
      <span className="mt-2 h-px w-28 bg-[#9a4f2b]" />
    </div>
  );
}

export function HomePageClient() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const goPrimary = () => router.push(user ? "/learn" : "/register");

  return (
    <div className="min-h-screen bg-[#f7f1e4] font-sans text-[#17181f]">
      <header className="sticky top-0 z-50 border-b border-[#e4d7c5] bg-[#fffdf7]/95 px-5 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <button className="flex items-center gap-3 text-left" onClick={() => router.push("/")} aria-label="Diteme home">
            <Image src="/zebra_logo.png" alt="" width={48} height={48} priority className="h-12 w-12 rounded-xl border border-[#eadbc7] bg-white p-1 object-contain" />
            <span>
              <span className="block text-3xl font-black lowercase leading-none tracking-tight text-[#17181f]">diteme</span>
              <span className="block text-xs font-semibold leading-none text-[#6b5b4e]">Learn. Speak. Belong.</span>
            </span>
          </button>

          <nav className="hidden items-center gap-10 text-xs font-black uppercase tracking-wide md:flex">
            {navItems.map((item, index) => (
              <a key={item.label} href={item.href} className={index === 0 ? "text-[#9a4f2b]" : "text-[#17181f] hover:text-[#9a4f2b]"}>
                {item.label}
              </a>
            ))}
          </nav>

          {user ? (
            <button
              className="min-w-24 rounded-full bg-[#5fb84f] px-7 py-3 text-xs font-black uppercase text-white shadow-sm"
              onClick={() => logout()}
            >
              Logout
            </button>
          ) : (
            <button
              className="min-w-24 rounded-full bg-[#5fb84f] px-7 py-3 text-xs font-black uppercase text-white shadow-sm"
              onClick={() => router.push("/register")}
            >
              Join
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl items-center gap-12 px-5 py-10 md:grid-cols-[0.82fr_1.18fr] md:px-10 lg:py-4">
          <div className="max-w-md">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-[#9a4f2b]">Botswana&apos;s languages</p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Learn local language for travel, school, and belonging
            </h1>
            <div className="mt-4 h-px w-32 bg-[#9a4f2b]" />
            <p className="mt-7 max-w-sm text-sm font-semibold leading-6 text-[#6f675d]">
              Diteme helps tourists, school students, and heritage learners build practical confidence in Botswana&apos;s
              languages through lessons, speaking practice, culture, and games.
            </p>
            <button className="mt-7 bg-[#5fb84f] px-9 py-5 text-base font-black text-white shadow-sm" onClick={goPrimary}>
              {user ? "Continue Learning" : "Get Started"}
            </button>
          </div>

          <div className="relative mx-auto h-[440px] w-full max-w-[620px] md:h-[560px]">
            <PhotoBlock area="study" className="absolute right-0 top-4 h-[420px] w-[58%] opacity-80" />
            <div className="absolute left-[9%] top-[44px] h-10 w-10 bg-[#9a4f2b]" />
            <PhotoBlock area="hero" className="absolute bottom-8 left-0 h-[420px] w-[76%] border-0" />
            <div className="absolute bottom-20 right-[8%] z-20 flex h-[150px] w-[150px] items-center justify-center bg-[#fffdf7] p-4 shadow-[0_0_0_3px_#9a4f2b] md:h-[190px] md:w-[190px]">
              <Image
                src="/zebra_hero.png"
                fill
                priority
                alt="Diteme zebra mascot welcoming learners"
                className="object-contain p-3"
              />
            </div>
            <div className="absolute bottom-0 right-[4%] flex gap-7 text-[#9a4f2b]">
              <button aria-label="Previous slide">
                <ArrowLeft size={36} strokeWidth={1.6} />
              </button>
              <button aria-label="Next slide">
                <ArrowRight size={36} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-10">
          <SectionKicker>Who Diteme is for</SectionKicker>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {audiencePaths.map((path) => (
              <article key={path.title} className="rounded-[1.5rem] border border-[#e4d7c5] bg-[#fffdf7] p-6 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-[#17181f]">{path.title}</h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#6f675d]">{path.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-10">
          <div className="relative h-[470px]">
            <div className="absolute left-0 top-0 h-[82%] w-[82%] border-[3px] border-[#9a4f2b]" />
            <PhotoBlock area="teacher" className="absolute bottom-0 right-0 h-[82%] w-[86%]" />
          </div>

          <div className="max-w-md md:pl-8">
            <SectionKicker>About us</SectionKicker>
            <h2 className="mt-7 text-4xl font-black tracking-tight">Diteme</h2>
            <p className="mt-8 text-sm font-bold leading-8 text-[#6f675d]">
              Diteme is a free education portal for Botswana languages. We believe language learning should feel clear,
              local, and accessible whether you are visiting, studying, or reconnecting with home.
            </p>
            <p className="mt-7 text-sm font-bold leading-8 text-[#6f675d]">
              The platform combines guided lessons, pronunciation practice, and playful revision tools so learners can
              study at their own pace and build confidence one session at a time.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-[0.7fr_1.3fr] md:px-10">
          <div className="max-w-sm">
            <SectionKicker>What we do best</SectionKicker>
            <h2 className="mt-7 text-4xl font-black tracking-tight">Our Courses</h2>
            <p className="mt-24 text-sm font-semibold leading-8 text-[#6f675d] md:mt-28">
              Browse well structured lessons and practice paths that help you improve vocabulary, listening, speaking,
              and cultural understanding.
            </p>
            <button className="mt-8 bg-[#5fb84f] px-8 py-4 text-base font-black text-white shadow-sm" onClick={() => router.push("/courses")}>
              View all Courses
            </button>
          </div>

          <div className="relative h-[460px]">
            <PhotoBlock area="study" className="absolute left-[42%] top-0 h-[260px] w-[34%]" />
            <div className="absolute left-[34%] top-[96px] h-[210px] w-[36%] border-[3px] border-[#9a4f2b]" />
            <PhotoBlock area="classroom" className="absolute bottom-16 left-0 h-[290px] w-[66%]" />
            <PhotoBlock area="teacher" className="absolute bottom-0 right-0 h-[260px] w-[34%]" />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-[0.9fr_1.1fr] md:px-10">
          <div className="max-w-md md:pl-32">
            <SectionKicker>What they say</SectionKicker>
            <h2 className="mt-7 text-4xl font-black tracking-tight">People Gossip</h2>
            <div className="mt-16 flex gap-5">
              <span className="text-7xl font-black leading-none text-[#e4d7c5]">&quot;</span>
              <div>
                <p className="text-sm font-bold leading-7 text-[#4f463f]">
                  Diteme helped me keep practicing Setswana between classes. The short lessons and games made revision
                  easier to come back to every day.
                </p>
                <p className="mt-7 text-right text-lg font-black">~ Kabo M.</p>
              </div>
            </div>
          </div>
          <div className="relative h-[470px]">
            <PhotoBlock area="study" className="absolute inset-y-0 left-0 my-auto h-[430px] w-[78%]" />
            <button className="absolute -left-12 top-1/2 hidden -translate-y-1/2 md:block" aria-label="Previous testimonial">
              <ArrowLeft size={38} strokeWidth={1.8} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2" aria-label="Next testimonial">
              <ArrowRight size={38} strokeWidth={1.8} />
            </button>
            <div className="absolute bottom-0 left-0 flex gap-3">
              {[0, 1, 2, 3, 4].map((dot) => (
                <span key={dot} className={`h-5 w-5 rounded-full border-2 border-[#9a4f2b] ${dot === 0 ? "bg-[#9a4f2b]" : "bg-[#fffdf7]"}`} />
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto grid max-w-6xl items-center px-5 py-24 md:grid-cols-[1fr_1fr] md:px-10">
          <PhotoBlock area="classroom" className="relative z-10 h-[420px] w-full md:w-[108%]" />
          <div className="relative -ml-0 border-[3px] border-[#9a4f2b] bg-[#fffdf7] px-9 py-12 md:-ml-8 md:pl-28">
            <SectionKicker>Contact us</SectionKicker>
            <h2 className="mt-7 text-4xl font-black tracking-tight">Get In Touch</h2>
            <form className="mt-9 max-w-sm space-y-7">
              <label className="block text-sm font-black">
                Full Name
                <input className="mt-4 block w-full border-0 border-b-2 border-[#9a4f2b] bg-transparent px-0 py-2 outline-none" />
              </label>
              <label className="block text-sm font-black">
                Email
                <input className="mt-4 block w-full border-0 border-b-2 border-[#9a4f2b] bg-transparent px-0 py-2 outline-none" />
              </label>
              <label className="block text-sm font-black">
                Message
                <textarea className="mt-4 block min-h-20 w-full resize-none border-0 border-b-2 border-[#9a4f2b] bg-transparent px-0 py-2 outline-none" />
              </label>
              <button type="button" className="bg-[#5fb84f] px-9 py-4 text-base font-black text-white">
                Send
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#fffdf7] px-5 pb-8 pt-14 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 border-b border-[#e4d7c5] pb-12 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="flex items-center gap-3">
            <Image src="/zebra_logo.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <div>
              <p className="text-3xl font-black lowercase leading-none tracking-tight text-[#17181f]">diteme</p>
              <p className="text-xs font-semibold text-[#6b5b4e]">Learn. Speak. Belong.</p>
            </div>
          </div>
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Courses" links={courseLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
          <div>
            <h3 className="text-lg font-black uppercase text-[#a9cf35]">Socials</h3>
            <div className="mt-4 flex gap-4 text-2xl font-black text-black">
              <span>f</span>
              <span>ig</span>
              <span>x</span>
              <span>g+</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-7 flex max-w-6xl items-center justify-center text-sm font-bold text-[#9a4f2b]">
          <p>Copyright 2026 Diteme</p>
          <button className="fixed bottom-8 right-8 rounded-full bg-[#5fb84f] p-3 text-white" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
            <ChevronUp size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-black uppercase text-[#9a4f2b]">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm font-bold text-[#17181f]">
        {links.map((link) => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  );
}
