'use client'

/**
 * Settings page — /settings
 *
 * Four sections:
 *   1. Profile — shows real name and calorie target from userStore
 *   2. About   — version, mission statement
 *   3. Support — donation link placeholder
 *   4. Disclaimer — always visible medical disclaimer
 *
 * The profile section displays live data when the user has completed
 * onboarding; shows a prompt to set up if they haven't.
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  Target,
  Heart,
  Info,
  Shield,
  ExternalLink,
  ChevronRight,
  Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { useUserStore, selectIsOnboarded, selectDisplayName } from '@/stores/userStore'
import { formatCalories } from '@/lib/utils/format'

export default function SettingsPage() {
  const profile    = useUserStore((s) => s.profile)
  const isOnboarded = useUserStore(selectIsOnboarded)
  const displayName = useUserStore(selectDisplayName)

  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar title="Settings" />

      <motion.div
        className="page-container py-5 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >

        {/* ══ Section 1: Profile ════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>Profile</SectionLabel>

          <div className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden">
            {/* Avatar + name row */}
            <div className="flex items-center gap-4 px-4 py-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-full shrink-0',
                  'bg-primary-light flex items-center justify-center',
                )}
                aria-hidden="true"
              >
                <User className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                {isOnboarded ? (
                  <>
                    <p className="font-body text-sm font-semibold text-ink">
                      {displayName === 'there' ? 'Your profile' : displayName}
                    </p>
                    <p className="font-body text-xs text-ink-muted mt-0.5">
                      {profile?.sex && profile.age
                        ? `${profile.sex === 'other' ? 'Unspecified' : profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1)}, ${profile.age} · ${profile.activityLevel?.replace('_', ' ')}`
                        : 'Profile set up'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-body text-sm font-semibold text-ink">
                      Your profile
                    </p>
                    <p className="font-body text-xs text-ink-muted mt-0.5">
                      Complete onboarding to personalise your experience
                    </p>
                  </>
                )}
              </div>
              {!isOnboarded && (
                <Link
                  href="/onboarding"
                  className={cn(
                    'shrink-0 h-8 px-3 rounded-full',
                    'bg-primary text-ink-on-primary',
                    'font-body text-xs font-semibold',
                    'hover:bg-primary-dark transition-colors duration-fast',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  )}
                  aria-label="Set up your profile"
                >
                  Set up
                </Link>
              )}
            </div>

            {/* Calorie target row */}
            <SettingsRow
              icon={<Target size={16} strokeWidth={1.75} className="text-ink-muted" />}
              label="Daily calorie target"
              value={
                isOnboarded && profile?.calorieTarget
                  ? formatCalories(profile.calorieTarget)
                  : 'Not set'
              }
              hint={
                isOnboarded
                  ? `Maintenance: ${profile?.tdee ? formatCalories(profile.tdee) : '—'}`
                  : 'Set up your profile to calculate'
              }
              disabled
            />
          </div>
        </motion.div>

        {/* ══ Section 2: About ══════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>About Calmorie</SectionLabel>

          <div className="bg-surface rounded-xl shadow-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0" aria-hidden="true">
                <Leaf className="w-5 h-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-ink tracking-tight">Calmorie</p>
                <p className="font-body text-xs text-ink-muted">v0.1 · Free, always</p>
              </div>
            </div>

            <hr className="border-border" />

            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              Calmorie is a free, science-informed app that helps you understand
              calories, metabolism, sleep, and the habits that quietly shape
              your weight — without rigid diets, guilt, or pressure.
            </p>

            <div className="flex flex-col gap-1.5 pt-0.5">
              <InfoRow icon={<Info size={14} />} label="No ads, no subscriptions, no data selling" />
              <InfoRow icon={<Shield size={14} />} label="All your data stays on your device" />
            </div>
          </div>
        </motion.div>

        {/* ══ Section 3: Support ════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2" id="support">
          <SectionLabel>Support the project</SectionLabel>

          <div className={cn('bg-surface rounded-xl shadow-card p-4 space-y-3', 'border border-border')}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                <Heart className="w-4 h-4 text-rose-500" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-ink leading-snug">
                  Calmorie is free
                </p>
                <p className="font-body text-xs text-ink-secondary leading-relaxed mt-1">
                  If it&rsquo;s helped you build better habits, a small contribution
                  keeps development going and the app ad-free.
                </p>
              </div>
            </div>

            <button
              disabled
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'h-10 rounded-full',
                'border border-border text-ink-secondary',
                'font-body text-sm font-medium',
                'opacity-50 cursor-default',
              )}
              aria-label="Support link — coming soon"
              aria-disabled="true"
            >
              <Heart size={15} strokeWidth={2} className="text-rose-400" aria-hidden="true" />
              Support Calmorie
              <ExternalLink size={13} strokeWidth={2} className="opacity-60" aria-hidden="true" />
            </button>
            <p className="font-body text-xs text-ink-muted text-center">
              Link available in a future update
            </p>
          </div>
        </motion.div>

        {/* ══ Section 4: Disclaimer ═════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>Disclaimer</SectionLabel>

          <div
            className={cn('bg-surface-raised rounded-xl p-4 space-y-2', 'border border-border')}
            role="note"
            aria-label="Medical disclaimer"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wide">
                Medical disclaimer
              </p>
            </div>
            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              This app provides educational information about nutrition and
              health habits. It is not intended to replace professional medical
              advice, diagnosis, or treatment.
            </p>
            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              Always seek the advice of a qualified healthcare provider with any
              questions about a medical condition or before starting a new diet
              or exercise programme.
            </p>
            <p className="font-body text-xs text-ink-muted leading-relaxed pt-1">
              Calorie targets are estimates based on general population
              formulas and should not be treated as clinical guidance.
            </p>
          </div>
        </motion.div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <motion.p
          variants={staggerItem}
          className="font-body text-xs text-ink-muted text-center pb-2"
        >
          Calmorie · Made with care · v0.1
        </motion.p>

      </motion.div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider px-0.5">
      {children}
    </p>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <span className="font-body text-xs leading-snug">{label}</span>
    </div>
  )
}

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  value?: string
  hint?: string
  disabled?: boolean
  onClick?: () => void
}

function SettingsRow({ icon, label, value, hint, disabled, onClick }: SettingsRowProps) {
  const inner = (
    <div className={cn('flex items-center gap-3 px-4 py-3', disabled && 'opacity-60')}>
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-ink">{label}</p>
        {hint && (
          <p className="font-body text-xs text-ink-muted mt-0.5">{hint}</p>
        )}
      </div>
      {value && (
        <span className="font-body text-sm text-ink-muted shrink-0">{value}</span>
      )}
      {!disabled && (
        <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={2} aria-hidden="true" />
      )}
    </div>
  )

  if (disabled || !onClick) return <div>{inner}</div>

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left',
        'hover:bg-surface-raised transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus',
      )}
    >
      {inner}
    </button>
  )
}
