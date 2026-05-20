import { Card } from '@/components/ui/Card';

export default function ResultLoading() {
  return (
    <div className="bg-bg-alt min-h-screen">
      <div className="h-16 bg-white border-b border-border" />
      <div className="max-w-[880px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        <Card className="mb-8 p-8 md:p-12 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-10 items-center">
            <div className="w-[180px] h-[180px] rounded-full bg-bg-2 mx-auto sm:mx-0" />
            <div className="space-y-3">
              <div className="h-5 w-24 bg-bg-2 rounded" />
              <div className="h-8 w-3/4 bg-bg-2 rounded" />
              <div className="h-4 w-1/2 bg-bg-2 rounded" />
              <div className="h-5 w-2/3 bg-bg-2 rounded mt-4" />
            </div>
          </div>
        </Card>
        <div className="h-7 w-[200px] bg-bg-2 rounded animate-pulse mb-4" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-6 h-[120px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
