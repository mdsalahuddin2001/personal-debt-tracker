import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { FileItem } from "@/models/file";
import { requireUserId } from "@/lib/auth-helpers";
import { presignDownload } from "@/lib/r2";

/**
 * Redirects to a short-lived presigned URL for a file the user owns.
 * `?dl=1` forces a download (Content-Disposition: attachment); otherwise the
 * file is served inline so the browser can preview it (used for images).
 *
 * Going through our own origin keeps the link a plain navigation triggered by
 * the user's click — no popup blocking, and the presigned URL never appears in
 * markup.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = await requireUserId();

  if (!Types.ObjectId.isValid(id)) {
    return new Response("Not found", { status: 404 });
  }

  await connectDB();
  const file = await FileItem.findOne({ _id: id, owner }).lean<{
    name: string;
    key: string;
  } | null>();
  if (!file) return new Response("Not found", { status: 404 });

  const download = new URL(req.url).searchParams.get("dl") === "1";
  const url = await presignDownload(file.key, { filename: file.name, download });

  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}
