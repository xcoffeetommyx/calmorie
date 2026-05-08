import type { Lesson, LessonCategory, LessonProgress } from '@/types/lesson'

export const XP_PER_LESSON = 50
export const XP_PER_LEVEL = 150

export type LearningBadgeTone = 'gold' | 'green' | 'blue' | 'rose' | 'violet'

export interface LearningBadge {
  id: string
  label: string
  description: string
  tone: LearningBadgeTone
  unlocked: boolean
  progress: number
  target: number
}

export interface LearningRewards {
  completedCount: number
  totalLessons: number
  totalXp: number
  level: number
  xpIntoLevel: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  levelProgress: number
  unlockedBadges: LearningBadge[]
  badges: LearningBadge[]
  nextBadge: LearningBadge | null
}

function clampProgress(value: number, target: number): number {
  if (target <= 0) return 1
  return Math.min(1, Math.max(0, value / target))
}

function countCompletedByCategory(
  lessons: Lesson[],
  progressMap: Record<string, LessonProgress>
): Record<LessonCategory, { completed: number; total: number }> {
  return lessons.reduce((acc, lesson) => {
    const bucket = acc[lesson.category] ?? { completed: 0, total: 0 }
    bucket.total += 1
    if (progressMap[lesson.slug]?.completed) bucket.completed += 1
    acc[lesson.category] = bucket
    return acc
  }, {} as Record<LessonCategory, { completed: number; total: number }>)
}

export function getLearningRewards(
  lessons: Lesson[],
  progressMap: Record<string, LessonProgress>
): LearningRewards {
  const completedCount = lessons.filter(
    (lesson) => progressMap[lesson.slug]?.completed
  ).length
  const totalLessons = lessons.length
  const totalXp = completedCount * XP_PER_LESSON
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const xpIntoLevel = totalXp % XP_PER_LEVEL
  const levelProgress = clampProgress(xpIntoLevel, XP_PER_LEVEL)

  const categoryCounts = countCompletedByCategory(lessons, progressMap)
  const masteredCategory = Object.values(categoryCounts).some(
    (bucket) => bucket.total > 0 && bucket.completed === bucket.total
  )
  const closestCategory = Object.values(categoryCounts).reduce(
    (best, bucket) => {
      if (bucket.total <= 0) return best
      if (!best || bucket.completed / bucket.total > best.completed / best.total) {
        return bucket
      }
      return best
    },
    null as { completed: number; total: number } | null
  )

  const badgeSeed: Array<Omit<LearningBadge, 'unlocked' | 'progress'> & { current: number }> = [
    {
      id: 'first-spark',
      label: 'First Spark',
      description: 'Finish your first lesson.',
      tone: 'gold',
      current: completedCount,
      target: 1,
    },
    {
      id: 'three-reads',
      label: 'Momentum',
      description: 'Complete 3 lessons.',
      tone: 'green',
      current: completedCount,
      target: 3,
    },
    {
      id: 'seven-reads',
      label: 'Knowledge Streak',
      description: 'Complete 7 lessons.',
      tone: 'blue',
      current: completedCount,
      target: 7,
    },
    {
      id: 'category-master',
      label: 'Category Pro',
      description: 'Complete every lesson in one category.',
      tone: 'violet',
      current: masteredCategory ? 1 : closestCategory?.completed ?? 0,
      target: masteredCategory ? 1 : closestCategory?.total ?? 1,
    },
    {
      id: 'library-complete',
      label: 'Calmorie Scholar',
      description: 'Complete the full Learn library.',
      tone: 'rose',
      current: completedCount,
      target: totalLessons,
    },
  ]

  const badges = badgeSeed.map(({ current, ...badge }) => ({
    ...badge,
    unlocked: current >= badge.target,
    progress: clampProgress(current, badge.target),
  }))

  const nextBadge = badges.find((badge) => !badge.unlocked) ?? null

  return {
    completedCount,
    totalLessons,
    totalXp,
    level,
    xpIntoLevel,
    xpForCurrentLevel: XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL - xpIntoLevel,
    levelProgress,
    unlockedBadges: badges.filter((badge) => badge.unlocked),
    badges,
    nextBadge,
  }
}
