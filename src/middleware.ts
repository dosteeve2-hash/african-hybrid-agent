import { NextResponse } from 'next/server';
import { initializeRedis } from '@/lib/cache/redis';

// Initialize Redis on first request
let redisInitialized = false;

export function middleware() {
  if (!redisInitialized) {
    initializeRedis().then(() => {
      redisInitialized = true;
      console.log('✓ Redis initialization triggered');
    }).catch((err) => {
      console.warn('⚠️  Redis initialization failed:', err);
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
