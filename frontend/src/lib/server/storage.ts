import { put } from "@vercel/blob";
import { createHash, createHmac, randomUUID } from "crypto";

type StorageFolder = "admin" | "avatars" | "contributions";
type StoredObject = {
  filename: string;
  path: string;
  url: string;
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  publicBaseUrl: string | null;
  prefix: string;
};

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getExtension(file: File) {
  const name = file.name || "upload.bin";
  const parts = name.split(".");
  return parts.length > 1 ? `.${sanitizeName(parts.pop() || "bin")}` : "";
}

function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint: (process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`).replace(/\/$/, ""),
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || null,
    prefix: (process.env.R2_PREFIX || "diteme").replace(/^\/+|\/+$/g, ""),
  };
}

function encodeKey(key: string) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function hashHex(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function isoAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function buildPublicUrl(config: R2Config, key: string) {
  if (!config.publicBaseUrl) {
    return key;
  }

  return `${config.publicBaseUrl}/${encodeKey(key)}`;
}

async function putR2Object(
  key: string,
  body: Buffer | string,
  contentType: string
): Promise<StoredObject> {
  const config = getR2Config();

  if (!config) {
    throw new Error("Missing R2 configuration");
  }

  const now = new Date();
  const amzDate = isoAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const encodedKey = encodeKey(key);
  const url = new URL(`${config.endpoint}/${config.bucket}/${encodedKey}`);
  const payloadHash = hashHex(body);
  const canonicalHeaders = [
    `host:${url.host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    "",
  ].join("\n");
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    url.pathname,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, dateStamp), "auto"), "s3"),
    "aws4_request"
  );
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  const requestBody: BodyInit = typeof body === "string" ? body : new Uint8Array(body);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: requestBody,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`R2 upload failed (${response.status}): ${message || response.statusText}`);
  }

  return {
    filename: key.split("/").pop() || key,
    path: key,
    url: buildPublicUrl(config, key),
  };
}

function buildObjectPath(folder: StorageFolder, filename: string, contributionId?: string) {
  const config = getR2Config();
  const prefix = config?.prefix || "diteme";

  if (folder === "contributions") {
    return `${prefix}/contributions/${contributionId || randomUUID()}/${filename}`;
  }

  return `${prefix}/${folder}/${new Date().toISOString().slice(0, 10)}/${filename}`;
}

export async function uploadPublicFile(
  file: File,
  folder: StorageFolder,
  options: { contributionId?: string } = {}
) {
  const extension = getExtension(file);
  const safeBaseName = sanitizeName(file.name.replace(/\.[^.]+$/, "")) || "file";

  if (getR2Config()) {
    const filename = `${safeBaseName}-${randomUUID()}${extension}`;
    const path = buildObjectPath(folder, filename, options.contributionId);

    return putR2Object(
      path,
      Buffer.from(await file.arrayBuffer()),
      file.type || "application/octet-stream"
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Missing R2 configuration. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET."
    );
  }

  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${safeBaseName}${extension}`;

  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    filename: blob.pathname.split("/").pop() || blob.pathname,
    path: blob.pathname,
    url: blob.url,
  };
}

export async function uploadJsonObject(
  value: unknown,
  folder: StorageFolder,
  filename = "metadata.json",
  options: { contributionId?: string } = {}
) {
  const safeFilename = sanitizeName(filename || "metadata.json");
  const path = buildObjectPath(folder, safeFilename, options.contributionId);

  if (!getR2Config()) {
    throw new Error("JSON sidecar uploads require R2 configuration");
  }

  return putR2Object(path, JSON.stringify(value, null, 2), "application/json; charset=utf-8");
}

export async function uploadTextObject(
  text: string,
  folder: StorageFolder,
  filename = "text.txt",
  options: { contributionId?: string } = {}
) {
  const safeFilename = sanitizeName(filename || "text.txt");
  const path = buildObjectPath(folder, safeFilename, options.contributionId);

  if (!getR2Config()) {
    throw new Error("Text sidecar uploads require R2 configuration");
  }

  return putR2Object(path, text, "text/plain; charset=utf-8");
}
