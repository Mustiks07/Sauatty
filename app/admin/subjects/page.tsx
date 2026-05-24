import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata = { title: 'Пәндер' };
export const dynamic = 'force-dynamic';

export default async function AdminSubjects() {
  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { tests: true } } },
    orderBy: { order: 'asc' },
  });
  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em]">
            Пәндер
          </h1>
          <div className="text-sm text-fg-muted mt-1">
            Міндетті (CORE) және бейіндік (PROFILE) пәндерді басқару
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/subjects/new">
            <Plus size={16} /> Жаңа пән
          </Link>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-fg-muted">
            <tr>
              <th className="text-left p-3.5">Атауы</th>
              <th className="text-left p-3.5">Slug</th>
              <th className="text-left p-3.5">Түр</th>
              <th className="text-left p-3.5">Тесттер</th>
              <th className="text-right p-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3.5 font-medium">{s.nameKz}</td>
                <td className="p-3.5 font-mono text-[12px] text-fg-muted">{s.slug}</td>
                <td className="p-3.5">
                  {s.kind === 'PROFILE' ? (
                    <Badge tone="amber">Бейіндік</Badge>
                  ) : (
                    <Badge tone="blue">Міндетті</Badge>
                  )}
                </td>
                <td className="p-3.5">{s._count.tests}</td>
                <td className="p-3.5 text-right">
                  <Link
                    href={`/admin/subjects/${s.id}`}
                    className="text-brand text-[13px] font-medium hover:underline"
                  >
                    Өңдеу
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
