/**
 * src/data/dailyTips.ts
 *
 * A curated set of 21 rotating daily wellness tips.
 * Practical, science-grounded, and short enough to glance at.
 *
 * Rotation: tips rotate by day-of-year so the tip changes every day
 * and the same tip never repeats within a 21-day window.
 */

export type TipCategory =
  | 'hydration'
  | 'nutrition'
  | 'sleep'
  | 'movement'
  | 'mindset'
  | 'digestion'

export interface DailyTip {
  id: string
  category: TipCategory
  text: string
}

export const DAILY_TIPS: DailyTip[] = [
  {
    id: 'tip-01',
    category: 'hydration',
    text: 'Drinking a glass of water before each meal is a low-effort way to support digestion and help moderate appetite throughout the day.',
  },
  {
    id: 'tip-02',
    category: 'nutrition',
    text: 'Adding protein to breakfast — eggs, yoghurt, or legumes — tends to reduce mid-morning hunger and keep energy levels more stable until lunch.',
  },
  {
    id: 'tip-03',
    category: 'sleep',
    text: 'Your body regulates appetite hormones during sleep. A consistent bedtime, even on weekends, helps with hunger cues and energy the following day.',
  },
  {
    id: 'tip-04',
    category: 'movement',
    text: 'A 10-minute walk after a meal helps blood sugar level out and supports digestion. It doesn\'t need to be a workout to be useful.',
  },
  {
    id: 'tip-05',
    category: 'mindset',
    text: 'Eating at a table without your phone gives your brain better fullness cues and tends to make the meal feel more satisfying overall.',
  },
  {
    id: 'tip-06',
    category: 'nutrition',
    text: 'Whole fruit contains fibre that slows sugar absorption. Juice removes almost all of it. For the same calories, the whole fruit leaves you fuller for longer.',
  },
  {
    id: 'tip-07',
    category: 'sleep',
    text: 'Eating within two hours of bed can disrupt sleep quality. A slightly earlier dinner is one of the quieter changes that often makes a noticeable difference.',
  },
  {
    id: 'tip-08',
    category: 'hydration',
    text: 'Mild dehydration can feel similar to hunger. If you\'re between meals and craving a snack, try a glass of water first and wait a few minutes.',
  },
  {
    id: 'tip-09',
    category: 'digestion',
    text: 'Chewing slowly and thoroughly is one of the least-appreciated things you can do for digestion — and it gives satiety signals more time to register.',
  },
  {
    id: 'tip-10',
    category: 'nutrition',
    text: 'Using a slightly smaller plate is one of the most effective low-effort portion strategies. Your brain judges fullness partly by how the plate looks.',
  },
  {
    id: 'tip-11',
    category: 'mindset',
    text: 'When stress is high, the body naturally craves quick-energy foods. Recognising this pattern is the first step to responding with more intention.',
  },
  {
    id: 'tip-12',
    category: 'nutrition',
    text: 'Beans, lentils, and chickpeas are among the most filling foods per calorie. Adding them to one meal a day is a small change with outsized benefit.',
  },
  {
    id: 'tip-13',
    category: 'movement',
    text: 'Non-exercise activity — standing, taking stairs, walking during calls — often accounts for more daily calorie burn than scheduled exercise sessions.',
  },
  {
    id: 'tip-14',
    category: 'sleep',
    text: 'Cool, dark, and quiet rooms consistently produce better sleep. Even small improvements to your sleep environment carry forward into your day.',
  },
  {
    id: 'tip-15',
    category: 'mindset',
    text: 'Progress is non-linear. A day of eating more than planned or skipping a routine doesn\'t undo previous progress — it\'s just one day.',
  },
  {
    id: 'tip-16',
    category: 'nutrition',
    text: 'Starting meals with vegetables before carbs tends to reduce total calorie intake and blunt blood sugar spikes — without any counting required.',
  },
  {
    id: 'tip-17',
    category: 'hydration',
    text: 'Coffee and tea without added sugar count toward daily hydration. The mild diuretic effect of caffeine is more than offset by the liquid they contain.',
  },
  {
    id: 'tip-18',
    category: 'movement',
    text: 'Walking uphill, carrying groceries, or climbing stairs builds muscle more effectively than flat, slow walking at the same duration.',
  },
  {
    id: 'tip-19',
    category: 'nutrition',
    text: 'Ultra-processed foods are engineered to override fullness signals. Even when they taste satisfying, they tend to lead to eating more than you intended.',
  },
  {
    id: 'tip-20',
    category: 'digestion',
    text: 'Gut bacteria ferment dietary fibre and produce compounds that help regulate appetite and inflammation. A variety of plant foods supports a healthier microbiome.',
  },
  {
    id: 'tip-21',
    category: 'mindset',
    text: 'Eating at roughly consistent times each day lowers decision fatigue around food and helps regulate hunger more naturally over time.',
  },
]

/**
 * Returns the tip for a given ISO date string.
 * Rotates through all tips by day-of-year so the tip changes daily
 * and repeats on a 21-day cycle.
 */
export function getTipOfTheDay(dateISO: string): DailyTip {
  const d     = new Date(`${dateISO}T00:00:00`)
  const start = new Date(d.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000)
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
}
