// ── Enums / union types ────────────────────────────────────────────────────

export type LessonCategory =
  | 'calories'
  | 'metabolism'
  | 'genetics'
  | 'sleep'
  | 'stress'
  | 'digestion'
  | 'ultra-processed'
  | 'habits'

// ── Core models ───────────────────────────────────────────────────────────

export interface LessonSource {
  title: string
  organization: string
  url: string
  year?: number
  note?: string
}

export interface LessonStep {
  heading: string
  body: string
  illustration?: string
}

export interface Lesson {
  slug: string
  title: string
  category: LessonCategory
  summary: string
  readTimeMinutes: number
  steps: LessonStep[]
  takeaway: string
  sources: LessonSource[]
}

/**
 * Per-user lesson reading progress record.
 *
 * "Started" semantics:
 *   A lesson is considered started when a LessonProgress record exists
 *   for its slug (i.e. progressMap[slug] !== undefined).
 *   There is no separate `started: boolean` field - the presence of the
 *   record is the canonical signal. This keeps the type simple and the
 *   lessonStore logic straightforward.
 *
 *   started  = progressMap[slug] !== undefined
 *   in-progress = started && !completed
 *   completed   = completed === true
 */
export interface LessonProgress {
  /** Matches Lesson.slug - primary key in IndexedDB lessonProgress table */
  slug: string
  /**
   * True when the user has reached the takeaway screen.
   * A record existing with completed: false means the lesson is in-progress.
   */
  completed: boolean
  /**
   * 0-based index of the last step the user reached.
   * Used to resume the lesson from where the user left off.
   * 0 = just started (first step).
   */
  lastStepIndex: number
  /** ISO datetime set when completed transitions to true */
  completedAt?: string
}

export interface LessonWithProgress extends Lesson {
  progress: LessonProgress | null
}

// ── Display helpers ────────────────────────────────────────────────────────

export const LESSON_CATEGORY_LABELS: Record<LessonCategory, string> = {
  calories:          'Calories',
  metabolism:        'Metabolism',
  genetics:          'Genetics',
  sleep:             'Sleep',
  stress:            'Stress',
  digestion:         'Digestion',
  'ultra-processed': 'Food Quality',
  habits:            'Habits',
}

export const LESSON_CATEGORY_COLORS: Record<LessonCategory, { bg: string; text: string }> = {
  calories:          { bg: 'bg-amber-100',  text: 'text-amber-800' },
  metabolism:        { bg: 'bg-blue-100',   text: 'text-blue-800' },
  genetics:          { bg: 'bg-violet-100', text: 'text-violet-800' },
  sleep:             { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  stress:            { bg: 'bg-rose-100',   text: 'text-rose-800' },
  digestion:         { bg: 'bg-green-100',  text: 'text-green-800' },
  'ultra-processed': { bg: 'bg-orange-100', text: 'text-orange-800' },
  habits:            { bg: 'bg-teal-100',   text: 'text-teal-800' },
}
