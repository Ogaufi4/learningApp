import type { Metadata } from "next";
import { HomePageClient } from "@/components/marketing/home-page-client";

const homeDescription =
  "Learn Setswana online with free lessons, pronunciation practice, and Botswana-inspired language games on Puolingo.";

export const metadata: Metadata = {
  title: "Learn Setswana Online for Free",
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Learn Setswana Online for Free",
    description: homeDescription,
    url: "/",
  },
  twitter: {
    title: "Learn Setswana Online for Free",
    description: homeDescription,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
