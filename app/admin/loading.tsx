import { Card } from '@/components/ui/Card';

export default function AdminLoading() {
  return (
    <div className="p-6 md:p-10">
      <div className="h-8 w-[200px] bg-bg-2 rounded-md animate-pulse mb-2" />
      <div className="h-4 w-[280px] bg-bg-2 rounded-md animate-pulse mb-6" />
      <Card className="h-[420px] animate-pulse" />
    </div>
  );
}
