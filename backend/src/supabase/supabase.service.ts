import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;

  private supabaseUrl!: string;
  private supabaseKey!: string;

  onModuleInit(): void {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }

    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    /*
     * IMPORTANT:
     * Remove any trailing slash.
     */
    this.supabaseUrl = supabaseUrl.replace(/\/+$/, '');
    this.supabaseKey = supabaseKey;

    /*
     * Supabase client is still useful for generating
     * public URLs and deleting files.
     */
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('[Supabase] Client initialized successfully.');

    console.log('[Supabase] URL:', this.supabaseUrl);
  }

  /**
   * Upload a file to Supabase Storage.
   *
   * We intentionally use native Node fetch() here
   * instead of supabase.storage.upload().
   *
   * This avoids the detached ArrayBuffer problem
   * occurring with Node 22 + storage-js.
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
  ): Promise<{
    publicUrl: string;
    filePath: string;
  }> {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }

    if (!file.buffer) {
      throw new BadRequestException('Uploaded file has no buffer');
    }

    if (!bucket) {
      throw new BadRequestException('Supabase bucket is required');
    }

    /*
     * Original filename.
     */
    const originalName = file.originalname || 'upload';

    /*
     * Get extension.
     */
    const extension = originalName.includes('.')
      ? originalName.split('.').pop()?.toLowerCase()
      : 'bin';

    const safeExtension = extension || 'bin';

    /*
     * Clean folder name.
     *
     * Example:
     * documents
     */
    const safeFolder = (folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');

    /*
     * Generate unique filename.
     */
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${safeExtension}`;

    /*
     * Example:
     *
     * documents/1787236634002-7t4k3ogs.docx
     */
    const filePath = `${safeFolder}/${fileName}`;

    console.log('----------------------------------------');

    console.log('[Supabase] Starting file upload');

    console.log('[Supabase] Original file:', originalName);

    console.log('[Supabase] Bucket:', bucket);

    console.log('[Supabase] Path:', filePath);

    console.log('[Supabase] MIME type:', file.mimetype);

    console.log('[Supabase] Size:', file.size, 'bytes');

    console.log('[Supabase] Buffer:', {
      isBuffer: Buffer.isBuffer(file.buffer),
      byteLength: file.buffer.byteLength,
      length: file.buffer.length,
    });

    /*
     * Make a completely independent Buffer.
     *
     * Node fetch() accepts Buffer directly.
     */
    const uploadBuffer = Buffer.from(file.buffer);

    console.log('[Supabase] Upload buffer:', {
      isBuffer: Buffer.isBuffer(uploadBuffer),
      byteLength: uploadBuffer.byteLength,
      length: uploadBuffer.length,
    });

    /*
     * IMPORTANT:
     *
     * This URL MUST contain your project reference:
     *
     * https://rjqtyfdaxhiaeggwluqv.supabase.co
     *
     * NOT:
     *
     * https://supabase.co
     */
    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;

    console.log('[Supabase] Upload URL:', uploadUrl);

    /*
     * Upload directly using native fetch.
     *
     * We explicitly set redirect to manual.
     *
     * If Supabase tries to redirect, we will detect
     * it instead of allowing the redirect to hide
     * the real problem.
     */
    let response: Response;

    try {
      response = await fetch(uploadUrl, {
        method: 'POST',

        redirect: 'manual',

        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,

          apikey: this.supabaseKey,

          'Content-Type': file.mimetype || 'application/octet-stream',

          'x-upsert': 'false',
        },

        body: uploadBuffer,
      });
    } catch (error) {
      console.error('[Supabase] Native fetch failed:', error);

      throw new BadRequestException(
        `Supabase network upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    /*
     * Read response body.
     */
    const responseText = await response.text();

    console.log('[Supabase] Storage response:', {
      statusCode: response.status,

      statusText: response.statusText,

      body: responseText,

      location: response.headers.get('location'),
    });

    /*
     * Detect redirect.
     */
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');

      console.error('[Supabase] Unexpected redirect:', location);

      throw new BadRequestException(
        `Supabase returned a redirect (${response.status}). Upload URL used: ${uploadUrl}`,
      );
    }

    /*
     * Detect failed upload.
     */
    if (!response.ok) {
      console.error('[Supabase] Upload failed:', {
        status: response.status,

        statusText: response.statusText,

        body: responseText,
      });

      throw new BadRequestException(
        `Supabase upload failed: ${response.status} ${responseText}`,
      );
    }

    console.log('[Supabase] Upload successful!');

    /*
     * Generate public URL.
     *
     * This requires the bucket to be PUBLIC.
     */
    const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;

    console.log('[Supabase] Public URL:', publicUrl);

    console.log('----------------------------------------');

    return {
      publicUrl,
      filePath,
    };
  }

  /**
   * Delete a file from Supabase Storage.
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    if (!bucket) {
      throw new BadRequestException('Supabase bucket is required');
    }

    if (!filePath) {
      throw new BadRequestException('File path is required');
    }

    console.log('[Supabase] Deleting file:', filePath);

    const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${bucket}`;

    console.log('[Supabase] Delete URL:', deleteUrl);

    let response: Response;

    try {
      response = await fetch(deleteUrl, {
        method: 'DELETE',

        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,

          apikey: this.supabaseKey,

          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          prefixes: [filePath],
        }),
      });
    } catch (error) {
      console.error('[Supabase] Delete fetch failed:', error);

      throw new BadRequestException(
        `Supabase delete failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const responseText = await response.text();

    console.log('[Supabase] Delete response:', {
      status: response.status,

      body: responseText,
    });

    if (!response.ok) {
      throw new BadRequestException(
        `Supabase file deletion failed: ${response.status} ${responseText}`,
      );
    }

    console.log('[Supabase] File deleted successfully:', filePath);
  }
}
