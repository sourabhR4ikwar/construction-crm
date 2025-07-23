import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT_URL) {
  throw new Error("Missing Cloudflare R2 environment variables");
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface FileUploadOptions {
  key: string;
  file: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface FileUrlOptions {
  key: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

export class R2Storage {
  /**
   * Upload a file to R2
   */
  static async uploadFile({ key, file, contentType, metadata }: FileUploadOptions): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    });

    await r2Client.send(command);
    return key;
  }

  /**
   * Get a presigned URL for downloading a file
   */
  static async getFileUrl({ key, expiresIn = 3600 }: FileUrlOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  }

  /**
   * Delete a file from R2
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  }

  /**
   * Check if a file exists
   */
  static async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      await r2Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files with a prefix
   */
  static async listFiles(prefix?: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
  }

  /**
   * Generate a unique file key for a project document
   */
  static generateDocumentKey(projectId: string, fileName: string, version: number = 1): string {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    return `projects/${projectId}/documents/${baseName}_v${version}_${timestamp}.${extension}`;
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(key: string): Promise<Record<string, string> | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const response = await r2Client.send(command);
      return response.Metadata || null;
    } catch {
      return null;
    }
  }
}