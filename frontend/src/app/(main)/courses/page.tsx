"use client";

import { useEffect, useState } from "react";
import { courseApi } from "@/lib/api/courses";
import { useAuthStore } from "@/store/auth";
import type { Course } from "@/types/api";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { toast } from "sonner";
import { formatAssetUrl } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const { user } = useAuthStore();

  useEffect(() => {
    const storedCourseId = window.localStorage.getItem("activeCourseId");
    setActiveCourseId(storedCourseId ? Number(storedCourseId) : null);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseApi.getCourses();
        setCourses(data);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg font-semibold text-neutral-600">Loading courses...</div>
      </div>
    );
  }

  const selectedCourse =
    courses.find((course) => course.id === activeCourseId) ||
    courses[0] ||
    {
    id: 1,
    title: "Select a course",
    image_src: "/flags/bw.svg",
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={{
            title: selectedCourse.title,
            imageSrc: selectedCourse.image_src || "/flags/bw.svg",
          }}
          hearts={user.hearts}
          points={user.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <div className="flex w-full flex-col items-center rounded-[2rem] border border-[#e4d7c5] bg-[#fffdf7] p-8 shadow-sm">
          <Image
            src="/learn.svg"
            alt="Learn"
            height={90}
            width={90}
            className="mb-6"
          />
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#9a4f2b]">Courses</p>
          <h1 className="mb-7 text-center text-2xl font-black text-[#17181f]">
            Choose a course to start learning
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {courses.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">
                  No courses available yet. Check back soon!
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="group"
                >
                  <div className="flex min-h-[217px] min-w-[200px] cursor-pointer flex-col items-center gap-3 rounded-[1.5rem] border border-[#e4d7c5] bg-white p-6 pb-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="relative aspect-[4/3] w-[120px] overflow-hidden rounded-2xl border border-[#dfc3a9]">
                      {(course.image_src && !brokenImages[course.id]) ? (
                        <Image
                          src={formatAssetUrl(course.image_src) || ""}
                          alt={course.title}
                          fill
                          className="object-cover"
                          onError={() =>
                            setBrokenImages((current) => ({ ...current, [course.id]: true }))
                          }
                        />
                      ) : (
                        <Image
                          src="/flags/bw.svg"
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="text-center text-lg font-black text-[#17181f]">
                      {course.title}
                    </p>
                    {course.description && (
                      <p className="text-center text-sm font-semibold text-[#6f675d]">
                        {course.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}
