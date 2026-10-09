import { renderPlate } from "@/lib/plate-image";

// /api/plate-image?text=AB12%20CDE&type=legal&style=3d-gel&badge=uk&border=none&side=rear
export async function GET(req: Request) {
  return renderPlate(new URL(req.url).searchParams);
}
