import parkruns from '@/data/parkruns-uk.json';

export const dynamic = 'force-static';

export async function GET() {
  return Response.json(parkruns);
}