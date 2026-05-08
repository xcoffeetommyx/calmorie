'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronRight,
  Moon,
  Utensils,
  Coffee,
  Brain,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { CheckInFlow } from '@/components/checkin/CheckInFlow'
import { CheckInScore } from '@/components/checkin/CheckInScore'
import {
  useCheckinStore,
  selectIsCompletedToday,
  selectTodayRecord,
} from '@/stores/checkinStore'
import { staggerContainer, staggerItem, scaleSpring } from '@/lib/animations/variants'
import { formatDateDisplay, todayISO } from '@/lib/utils/date'

const QUESTION_PREVIEWS = [
  { icon: Moon, text: 'How well did you sleep last night?' },
  { icon: Utensils, text: 'Did you eat after 9 PM last night?' },
  { icon: Utensils, text: 'How many meals did you eat yesterday?' },
  { icon: Utensils, text: 'Did you skip any meals yesterday?' },
  { icon: Coffee, text: 'Did sugary drinks show up yesterday?' },
  { icon: Brain, text: 'How stressed are you feeling right now?' },
  { icon: Target, text: "What's your focus for today?" },
] as const

export default function CheckInPage() {
  const isCompleted = useCheckinStore(selectIsCompletedToday)
  const todayRecord = useCheckinStore(selectTodayRecord)
  const isHydrated = useCheckinStore((s) => s.isHydrated)
  const [started, setStarted] = useState(false)
  const [isFirstRun, setIsFirstRun] = useState(false)

  const dateLabel = formatDateDisplay(todayISO())

  useEffect(() => {
    setIsFirstRun(new URLSearchParams(window.location.search).get('firstRun') === '1')
  }, [])

  if (!isHydrated) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Morning Check-In" />
        <div className="page-container py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-raised rounded-xl h-20 animate-pulse-soft" />
          ))}
        </div>
      </div>
    )
  }

  if (isCompleted && todayRecord) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Morning Check-In" />
        <div className="page-container py-5">
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={scaleSpring} initial="initial" animate="enter">
              <CheckCircle2
                className="w-5 h-5 text-success shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
            </motion.div>
            <div>
              <p className="font-body text-sm font-semibold text-ink">
                Check-in complete
              </p>
              <p className="font-body text-xs text-ink-muted">{dateLabel}</p>
            </div>
          </motion.div>

          <CheckInScore record={todayRecord} />
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Morning Check-In" />
        <motion.div
          className="page-container py-5 space-y-5"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          <motion.div
            variants={staggerItem}
            className="bg-surface rounded-2xl shadow-card p-6 flex flex-col items-center gap-4 text-center"
          >
            <motion.div
              variants={scaleSpring}
              className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center"
            >
              <CheckCircle2
                className="w-8 h-8 text-primary"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </motion.div>

            <div className="space-y-1.5">
              <p className="font-body text-xs text-ink-muted">{dateLabel}</p>
              <h2 className="font-display text-xl font-semibold text-ink tracking-tight">
                {isFirstRun ? 'Your first quick check-in' : 'Good morning - ready to check in?'}
              </h2>
              <p className="font-body text-sm text-ink-secondary leading-relaxed max-w-xs mx-auto">
                {isFirstRun
                  ? "This unlocks today's focus and shows how Calmorie connects sleep, stress, meals, and habits before you start logging."
                  : "Seven quick prompts about last night and how you're feeling now. You'll get a wellness score and a personalized tip at the end."}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-raised">
              <span className="font-body text-xs font-semibold text-primary">2 min</span>
              <span className="font-body text-xs font-medium text-ink-secondary">
                Private and stored on this device
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                What we will ask about
              </p>
            </div>
            {QUESTION_PREVIEWS.map(({ icon: Icon, text }, i) => (
              <div key={text} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <p className="font-body text-sm text-ink-secondary leading-snug flex-1 min-w-0">
                  {text}
                </p>
                <span className="font-body text-[11px] font-semibold text-ink-muted shrink-0 tabular-nums">
                  {i + 1}/7
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={staggerItem}>
            <button
              onClick={() => setStarted(true)}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'h-14 rounded-full',
                'bg-primary text-ink-on-primary',
                'font-body text-base font-semibold',
                'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
                'transition-all duration-fast ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-border-focus focus-visible:ring-offset-2',
              )}
              aria-label={isFirstRun ? 'Start my first check-in' : "Start this morning's check-in"}
            >
              {isFirstRun ? 'Start my first check-in' : 'Start morning check-in'}
              <ChevronRight size={18} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="font-body text-xs text-ink-muted text-center leading-relaxed"
          >
            {isFirstRun
              ? 'This is the first small win. You can log food after you get your focus.'
              : 'Check-ins are private and stored only on your device.'}
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar title="Morning Check-In" />
      <div className="page-container py-5">
        <CheckInFlow onComplete={() => setStarted(false)} />
      </div>
    </div>
  )
}
