import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint =
  process.env.R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";

if (!accessKeyId || !secretAccessKey || !endpoint || !R2_BUCKET) {
  // Surface misconfiguration early rather than failing deep inside an upload.
  console.warn(
    "[r2] Missing R2 configuration. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT (or R2_ACCOUNT_ID) and R2_BUCKET_NAME."
  );
}

// R2 is S3-compatible. Region is effectively ignored ("auto") but the SDK
// requires a value.
export const r2 = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
  // The AWS SDK adds CRC32 "flexible checksum" headers by default, which
  // Cloudflare R2 rejects on some operations. Only send checksums when the
  // operation strictly requires one.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const UPLOAD_URL_TTL = 60 * 10; // 10 minutes to start/finish a PUT
const DOWNLOAD_URL_TTL = 60 * 5; // 5 minutes to fetch a GET

/** Presigned PUT URL the browser uses to upload an object directly to R2. */
export function presignUpload(key: string, contentType: string) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: UPLOAD_URL_TTL }
  );
}

/**
 * Presigned GET URL for viewing or downloading an object. Pass `filename` to
 * force a download with a friendly name; omit it to let the browser display
 * the object inline (preview).
 */
export function presignDownload(
  key: string,
  opts?: { filename?: string; download?: boolean }
) {
  const disposition = opts?.filename
    ? `${opts.download ? "attachment" : "inline"}; filename="${encodeURIComponent(
        opts.filename
      )}"`
    : undefined;

  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ResponseContentDisposition: disposition,
    }),
    { expiresIn: DOWNLOAD_URL_TTL }
  );
}

/** Delete a single object. Safe to call even if the object is already gone. */
export async function deleteObject(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

/**
 * Delete many objects, one request per key with bounded concurrency. We avoid
 * R2's batch DeleteObjects endpoint because the SDK's checksum headers make it
 * unreliable there. Never throws — returns which keys succeeded and which
 * failed so the caller can log/report orphans.
 */
export async function deleteObjects(
  keys: string[]
): Promise<{ deleted: string[]; failed: string[] }> {
  const deleted: string[] = [];
  const failed: string[] = [];
  const CONCURRENCY = 20;

  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    const batch = keys.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((key) =>
        r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
      )
    );
    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        deleted.push(batch[idx]);
      } else {
        failed.push(batch[idx]);
        console.error(`[r2] Failed to delete ${batch[idx]}:`, res.reason);
      }
    });
  }

  return { deleted, failed };
}
