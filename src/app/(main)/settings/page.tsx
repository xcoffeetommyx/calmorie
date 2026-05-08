'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User, Target, Heart, Info, Shield, ExternalLink, ChevronRight, Ruler,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AppLogo } from '@/components/layout/AppLogo'
import { TopBar } from '@/components/layout/TopBar'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { useUserStore, selectIsOnboarded, selectDisplayName } from '@/stores/userStore'
import { formatCalories } from '@/lib/utils/format'
import { formatHeight, formatWeight } from '@/lib/utils/units'
import type { UnitPreference } from '@/types/user'

export default function SettingsPage() {
  const profile        = useUserStore((s) => s.profile)
  const isOnboarded    = useUserStore(selectIsOnboarded)
  const displayName    = useUserStore(selectDisplayName)
  const updateProfile  = useUserStore((s) => s.updateProfile)

  const unit: UnitPreference = profile?.unitPreference ?? 'metric'

  function handleUnitChange(next: UnitPreference) {
    if (!profile || next === unit) return
    updateProfile({ unitPreference: next })
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar title="Settings" />

      <motion.div
        className="page-container py-5 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >
        {/* ══ Profile ══════════════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>Profile</SectionLabel>

          <div className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-4">
              <div
                className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0"
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
                    <p className="font-body text-sm font-semibold text-ink">Your profile</p>
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

        {/* ══ Units ════════════════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>Units</SectionLabel>

          <div className="bg-surface rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="shrink-0" aria-hidden="true">
                <Ruler size={16} strokeWidth={1.75} className="text-ink-muted" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-ink">Display units</p>
                {isOnboarded && profile?.heightCm && profile?.weightKg && (
                  <p className="font-body text-xs text-ink-muted mt-0.5">
                    {formatHeight(profile.heightCm, unit)} · {formatWeight(profile.weightKg, unit)}
                  </p>
                )}
              </div>
              {/* Inline toggle */}
              <div
                className="flex rounded-lg border border-border bg-background p-0.5 gap-0.5 shrink-0"
                role="group"
                aria-label="Unit system"
              >
                {(['metric', 'imperial'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitChange(u)}
                    disabled={!isOnboarded}
                    className={cn(
                      'px-3 py-1 rounded-md font-body text-xs font-medium',
                      'transition-all duration-fast ease-smooth',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                      unit === u
                        ? 'bg-primary text-ink-on-primary shadow-sm'
                        : 'text-ink-muted hover:text-ink',
                    )}
                    aria-pressed={unit === u}
                  >
                    {u === 'metric' ? 'Metric' : 'Imperial'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══ About ════════════════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>About Calmorie</SectionLabel>

          <div className="bg-surface rounded-xl shadow-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <AppLogo size={40} className="rounded-xl shrink-0" />
              <div>
                <p className="font-display text-base font-semibold text-ink tracking-tight">Calmorie</p>
                <p className="font-body text-xs text-ink-muted">Free, always</p>
              </div>
            </div>

            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              Calmorie is a free educational app that helps you understand how calories,
              metabolism, sleep, and daily habits connect to your weight — using
              science-backed explanations rather than rules or restriction.
            </p>

            <div className="flex flex-col gap-2 pt-0.5 border-t border-border">
              <InfoRow icon={<Info size={14} />}   label="No ads, no subscriptions, no data selling" />
              <InfoRow icon={<Shield size={14} />} label="Everything you log stays on this device — nothing is sent to a server" />
            </div>
          </div>
        </motion.div>

        {/* ══ Support ══════════════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2" id="support">
          <SectionLabel>Support the project</SectionLabel>

          <div className="bg-surface rounded-xl shadow-card overflow-hidden">
            {/* Warm header band */}
            <div className="bg-rose-50 border-b border-rose-100 px-4 py-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm" aria-hidden="true">
                <Heart className="w-4 h-4 text-rose-500" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-rose-900 leading-snug">
                  Calmorie is free
                </p>
                <p className="font-body text-xs text-rose-700/80 leading-relaxed mt-1">
                  If it&rsquo;s helped you build better habits, a small contribution
                  keeps development going and the app ad-free.
                </p>
              </div>
            </div>

            {/* Donate button */}
            <div className="px-4 py-4">
              <a
                href="https://ko-fi.com/xcoffeetommyx"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'w-full flex items-center justify-center gap-2',
                  'h-11 rounded-full',
                  'bg-primary text-ink-on-primary',
                  'font-body text-sm font-semibold',
                  'shadow-sm hover:bg-primary-dark hover:shadow-md',
                  'active:scale-[0.97]',
                  'transition-all duration-fast ease-smooth',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                )}
                aria-label="Support Calmorie on Ko-fi (opens in new tab)"
              >
                <Heart size={15} strokeWidth={2} aria-hidden="true" />
                Support Calmorie
                <ExternalLink size={13} strokeWidth={2} className="opacity-70" aria-hidden="true" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* ══ Disclaimer ═══════════════════════════════════════ */}
        <motion.div variants={staggerItem} className="space-y-2">
          <SectionLabel>Health note</SectionLabel>

          <div
            className="bg-surface-raised rounded-xl p-4 space-y-3 border border-border"
            role="note"
            aria-label="Health and science note"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wide">
                Health note
              </p>
            </div>
            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              Calmorie provides general information for educational purposes. It is not
              medical advice, and nothing here should replace a conversation with your
              doctor or a registered dietitian — especially if you have a health condition
              that affects your nutrition or weight.
            </p>
            <p className="font-body text-xs text-ink-muted leading-relaxed border-t border-border pt-2">
              Calorie estimates use standard population formulas (Mifflin-St Jeor).
              Individual needs vary, so treat your target as a starting point, not a
              precise prescription.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={staggerItem}
          className="font-body text-xs text-ink-muted text-center pb-2"
        >
          Calmorie · Made with care
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
    <div className="flex items-center gap-2 text-ink-muted pt-2">
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <span className="font-body text-xs leading-snug">{label}</span>
    </div>
  )
}

interface SettingsRowProps {
  icon:      React.ReactNode
  label:     string
  value?:    string
  hint?:     string
  disabled?: boolean
  onClick?:  () => void
}

function SettingsRow({ icon, label, value, hint, disabled, onClick }: SettingsRowProps) {
  const inner = (
    <div className={cn('flex items-center gap-3 px-4 py-3', disabled && 'opacity-60')}>
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-ink">{label}</p>
        {hint && <p className="font-body text-xs text-ink-muted mt-0.5">{hint}</p>}
      </div>
      {value && <span className="font-body text-sm text-ink-muted shrink-0">{value}</span>}
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
        'w-full text-left hover:bg-surface-raised transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus',
      )}
    >
      {inner}
    </button>
  )
}
