import { Card } from '@/components/ui/Card';

export default function DashboardLoading() {
  return (
    <div className="bg-bg-alt min-h-screen">
      <div className="h-16 bg-white border-b border-border" />
      <div className="container-page py-10 md:py-12">
        <div className="h-10 w-[280px] bg-bg-2 rounded-md animate-pulse mb-3" />
        <div className="h-5 w-[200px] bg-bg-2 rounded-md animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-6 h-[110px] animate-pulse" />
          ))}
        </div>
        <div className="h-7 w-[220px] bg-bg-2 rounded-md animate-pulse mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-6 h-[220px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
