import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'multer';

@Injectable()
export class SupabaseService implements OnModuleInit {
  // Marked as definitely assigned to comply with strict TypeScript rules
  private supabase!: SupabaseClient;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: globalThis.fetch, // Crucial for routing stability on remote cloud endpoints
      },
    });

    console.log('[Supabase] Client initialized successfully for cloud connection.');
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
  ): Promise<{ publicUrl: string; filePath: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file buffer provided for upload');
    }

    const originalName = file.originalname || 'upload';
    const fileExt = originalName.split('.').pop() || 'bin';
    const safeFolder = (folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');
    
    const filePath = `${safeFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt !== 'bin' ? '.' + fileExt : ''}`;

    console.log(`[Supabase] Uploading to bucket="${bucket}" path="${filePath}" mime="${file.mimetype}" size=${file.size}`);

    // Bypasses internal buffer streaming bugs on remote cloud APIs
    const fileData = new Uint8Array(file.buffer);

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error(`[Supabase] Upload failed: bucket="${bucket}" path="${filePath}" error="${error.message}"`);
      throw new BadRequestException(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`[Supabase] Upload success: bucket="${bucket}" path="${filePath}" url="${publicUrlData.publicUrl}"`);

    return {
      publicUrl: publicUrlData.publicUrl,
      filePath,
    };
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    // Verified single property target syntax structure
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new BadRequestException(`Supabase file deletion failed: ${error.message}`);
    }
  }
}
