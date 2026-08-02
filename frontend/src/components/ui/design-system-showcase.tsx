import { motion } from 'framer-motion'
import { Alert } from './alert'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { Button } from './button'
import { Card } from './card'
import { Input } from './input'
import { SearchInput } from './search-input'
import { SectionHeader } from './section-header'
import { Select } from './select'
import { Skeleton } from './skeleton'
import { Spinner } from './spinner'
import { StatCard } from './stat-card'
import { StatusBadge } from './status-badge'
import { Tabs } from './tabs'
import { Textarea } from './textarea'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './table'
import { TimelineItem } from './timeline-item'
import { AppIcon } from './icons'

export function DesignSystemShowcase() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <SectionHeader title="Design System" description="Reusable UI foundations for MedChain" actions={<Button variant="secondary">Preview</Button>} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Healthcare Coverage" value="97.2%" hint="Protected" />
        <StatCard label="Secure Transfers" value="1.2k" hint="Daily" />
        <StatCard label="Response Time" value="< 210ms" hint="Average" />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Badge>New</Badge>
          <StatusBadge status="Active" />
          <Avatar fallback="MS" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Email address" />
          <SearchInput placeholder="Search components" />
          <Textarea placeholder="Describe your component" />
          <Select defaultValue="option1">
            <option value="option1">Option One</option>
            <option value="option2">Option Two</option>
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <Tabs items={['Overview', 'Health', 'Security']} />
          <Alert variant="success">This system supports accessible, responsive, dark-mode-ready primitives.</Alert>
          <div className="flex items-center gap-4">
            <Spinner />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <AppIcon name="sparkles" className="h-5 w-5 text-[color:var(--color-primary)]" />
            <p className="font-medium text-[color:var(--color-text)]">Component library</p>
          </div>
          <TimelineItem title="Design tokens" description="Colors, spacing, radius, shadows" active />
          <TimelineItem title="Motion primitives" description="Fade, slide, scale, hover" />
          <TimelineItem title="Reusable UI" description="Forms, tables, dialogs, cards" />
        </Card>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Component</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Button</TableCell>
              <TableCell><StatusBadge status="Active" /></TableCell>
              <TableCell>Accessible and reusable.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Card</TableCell>
              <TableCell><StatusBadge status="Review" /></TableCell>
              <TableCell>Flexible container.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  )
}
