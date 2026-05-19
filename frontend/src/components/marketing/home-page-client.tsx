"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

const featureHighlights = [
  {
    title: "Interactive Setswana lessons",
    description:
      "Build vocabulary and confidence with bite-sized practice designed to keep learners moving every day.",
  },
  {
    title: "Culture-led language learning",
    description:
      "Practice with Setswana phrases, proverbs, and wordplay that reflect Botswana's language and identity.",
  },
  {
    title: "Games that reinforce memory",
    description:
      "Turn revision into play with challenges that help learners remember words, meanings, and patterns faster.",
  },
];

const seoTopics = [
  "Learn Setswana online at your own pace",
  "Practice Setswana vocabulary and common phrases",
  "Explore Botswana-inspired language games and activities",
];

export function HomePageClient() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f7fee7_0%,_#ffffff_28%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-50 border-b-2 border-slate-200 bg-white/95 px-4 backdrop-blur md:px-10">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between">
          <div className="flex items-center gap-x-3">
            <Image src="/zebra_logo.png" height={40} width={40} alt="Puolingo zebra logo" className="rounded-lg" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-600">Learn Setswana</p>
              <p className="text-2xl font-extrabold tracking-tighter text-[#58cc02]">Puolingo</p>
            </div>
          </div>
          {!user ? (
            <Button variant="ghost" className="font-bold text-slate-500 hover:text-slate-600" onClick={() => router.push("/login")}>
              Login
            </Button>
          ) : (
            <Button variant="ghost" className="font-bold text-slate-500 hover:text-slate-600" onClick={() => logout()}>
              Logout
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="px-4 py-10 md:px-8 md:py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row">
            <div className="relative h-[300px] w-[300px] lg:h-[460px] lg:w-[460px]">
              <Image
                src="/zebra_hero.png"
                fill
                priority
                alt="Puolingo mascot welcoming learners to practice Setswana"
                className="animate-float object-contain drop-shadow-2xl"
              />
            </div>

            <div className="flex flex-1 flex-col items-center gap-y-7 lg:items-start">
              <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                Language learning for Botswana and beyond
              </p>
              <div className="space-y-4 text-center lg:text-left">
                <h1 className="text-4xl font-extrabold leading-tight text-neutral-900 md:text-6xl">
                  Learn Setswana online with fun lessons, speaking practice, and culture-rich games.
                </h1>
                <p className="mx-auto max-w-[620px] text-lg font-medium leading-8 text-slate-600 lg:mx-0">
                  Puolingo is a free, engaging way to learn Setswana. Practice everyday vocabulary, explore
                  Botswana-inspired language games, and build confidence one lesson at a time.
                </p>
              </div>

              <div className="flex w-full max-w-[360px] flex-col gap-y-3">
                {user ? (
                  <Button size="lg" variant="secondary" className="h-[54px] text-lg" onClick={() => router.push("/learn")}>
                    Continue Learning
                  </Button>
                ) : (
                  <>
                    <Button size="lg" variant="secondary" className="h-[54px] text-lg" onClick={() => router.push("/register")}>
                      Start Learning Free
                    </Button>
                    <Button
                      size="lg"
                      variant="default"
                      className="h-[54px] border-2 border-b-4 text-lg"
                      onClick={() => router.push("/login")}
                    >
                      I already have an account
                    </Button>
                  </>
                )}
                <Button
                  size="lg"
                  variant="default"
                  className="h-[54px] border-2 border-b-4 text-lg"
                  onClick={() => router.push("/puospeech")}
                >
                  Try PuoSpeech
                </Button>
              </div>

              <ul className="grid w-full gap-3 text-left text-sm font-semibold text-slate-600 md:grid-cols-3">
                {seoTopics.map((topic) => (
                  <li key={topic} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 md:px-8 md:pb-16">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Why learners choose Puolingo</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">A better way to learn Setswana online</h2>
              <p className="mt-3 text-base font-medium leading-7 text-slate-600">
                The experience is designed to make Setswana more approachable for beginners, more enjoyable for returning
                speakers, and more visible as a language worth learning globally.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featureHighlights.map((feature) => (
                <article key={feature.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-xl font-extrabold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 md:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,_#ecfccb_0%,_#ffffff_45%,_#f8fafc_100%)] p-6 shadow-sm md:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">What you can do on Puolingo</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Practice the language in more than one way</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5">
                <h3 className="text-lg font-extrabold text-slate-900">Learn core vocabulary</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Follow guided lessons that introduce useful Setswana words and phrases in a simple, repeatable flow.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5">
                <h3 className="text-lg font-extrabold text-slate-900">Improve pronunciation</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Use PuoSpeech to experiment with speaking practice and support listening-based language growth.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5">
                <h3 className="text-lg font-extrabold text-slate-900">Play cultural language games</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Explore proverbs, riddles, and Botswana-inspired challenges that make revision feel active and memorable.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-slate-200 p-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <span className="font-bold uppercase text-slate-500">Made for Botswana</span>
          <span className="text-sm font-bold uppercase text-slate-500">Copyright 2026 Puolingo</span>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
