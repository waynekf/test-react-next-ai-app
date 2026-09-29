import completedParkruns from '@/data/completed-parkruns.json';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(completedParkruns);
}