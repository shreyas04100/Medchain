import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Search,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react'

const iconMap = {
  activity: Activity,
  arrowRight: ArrowRight,
  check: CheckCircle2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  alert: CircleAlert,
  search: Search,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  shield: ShieldCheck,
  close: X,
} satisfies Record<string, LucideIcon>

type IconName = keyof typeof iconMap

type IconProps = {
  name: IconName
  className?: string
}

export function AppIcon({ name, className }: IconProps) {
  const IconComponent = iconMap[name]
  return <IconComponent className={className} />
}

export { iconMap }
