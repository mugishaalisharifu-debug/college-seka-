import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Check if variables are loaded
console.log('🔍 Environment Variables Check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Not Loaded');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Not Loaded');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Not Loaded');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(5000);
  console.log(`🚀 Server running on http://localhost:5000`);
}
bootstrap();