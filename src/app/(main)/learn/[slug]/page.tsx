/**
 * Lesson detail page — /learn/[slug]
 *
 * This is a Server Component. It has no 'use client' directive, which is
 * required because Next.js does not allow generateStaticParams() in a
 * Client Component.
 *
 * Pattern:
 *   - generateStaticParams() enumerates all lesson slugs at build time
 *   - The page component resolves the lesson from the slug via params prop
 *   - notFound() is called for unknown slugs (renders the app's 404 page)
 *   - LessonReader receives the pre-resolved lesson object as a plain prop
 *   - LessonReader itself is a Client Component and handles all interactive
 *     logic (Zustand, Framer Motion, useRouter) as before
 */

import { notFound } from 'next/navigation'
import { getLessonBySlug, getAllLessons } from '@/lib/content/lessons'
import { LessonReader } from '@/components/learn/LessonReader'

/**
 * Enumerate all lesson slugs so Next.js pre-renders every
 * /learn/[slug] page as a static HTML file at build time.
 * Required for output: 'export' to work with dynamic segments.
 */
export function generateStaticParams(): { slug: string }[] {
  return getAllLessons().map((lesson) => ({ slug: lesson.slug }))
}

interface LessonPageProps {
  params: { slug: string }
}

export default function LessonPage({ params }: LessonPageProps) {
  const lesson = getLessonBySlug(params.slug)

  // Unknown slug — renders the app's not-found.tsx (404) page
  if (!lesson) {
    notFound()
  }

  // Pass the resolved lesson to the interactive client component
  return <LessonReader lesson={lesson} />
}
