import { requireTeam } from "@/lib/auth";
import { getW9File } from "@/lib/repo";

type Params = Promise<{ personId: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  await requireTeam();
  const { personId } = await params;
  const file = await getW9File(personId);
  if (!file) return new Response("No W-9 on file", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.filename.replace(/"/g, "")}"`,
    },
  });
}
