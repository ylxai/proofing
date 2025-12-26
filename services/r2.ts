import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CONFIG } from "../config";

// Lazy initialization of the S3 Client
let r2ClientInstance: S3Client | null = null;

const getR2Client = () => {
  if (!r2ClientInstance) {
    r2ClientInstance = new S3Client({
      region: "auto",
      endpoint: CONFIG.R2.ENDPOINT,
      credentials: {
        accessKeyId: CONFIG.R2.ACCESS_KEY_ID,
        secretAccessKey: CONFIG.R2.SECRET_ACCESS_KEY,
      },
      // CRITICAL: Cloudflare R2 requires path-style access
      forcePathStyle: true,
      // Disable checksum calculations which often fail in pure browser environments
      // causing "Failed to fetch" before the network request is even made.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED"
    });
  }
  return r2ClientInstance;
};

export const uploadFileToR2 = async (file: File, folder: string = 'uploads'): Promise<string> => {
  // Sanitize filename
  const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
  const fileName = `${folder}/${Date.now()}-${cleanFileName}`;
  
  const command = new PutObjectCommand({
    Bucket: CONFIG.R2.BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: file.type || 'application/octet-stream',
  });

  try {
    const client = getR2Client();
    await client.send(command);
    
    // Construct the public URL
    return `${CONFIG.R2.PUBLIC_URL_BASE}/${fileName}`;
  } catch (error: any) {
    console.error("Error uploading to R2:", error);

    // Provide specific guidance for common R2 browser errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const msg = `Gagal terhubung ke R2. Kemungkinan besar masalah CORS pada Bucket Anda.\n\n` +
                  `Solusi: Buka Cloudflare Dashboard > R2 > Bucket '${CONFIG.R2.BUCKET_NAME}' > Settings > CORS Policy.\n` +
                  `Tambahkan: AllowedOrigins: ["*"], AllowedMethods: ["PUT", "GET", "DELETE"]`;
      throw new Error(msg);
    }
    
    throw new Error(`R2 Upload Error: ${error.message}`);
  }
};

export const deleteFileFromR2 = async (fileUrl: string) => {
  try {
    // Extract key from URL
    const key = fileUrl.replace(`${CONFIG.R2.PUBLIC_URL_BASE}/`, '');
    
    const command = new DeleteObjectCommand({
      Bucket: CONFIG.R2.BUCKET_NAME,
      Key: key,
    });

    const client = getR2Client();
    await client.send(command);
  } catch (error: any) {
    console.error("Error deleting from R2:", error.message || error);
    // Don't throw, just log. We don't want to break the UI flow if cleanup fails.
  }
};