import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function uploadFile(file: File, folder: string = 'general'): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || '.bin';
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_DIR, folder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

export async function uploadFiles(files: File[], folder: string = 'general'): Promise<string[]> {
  return Promise.all(files.map((file) => uploadFile(file, folder)));
}
