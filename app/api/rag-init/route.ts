import { IMPORTANT_RFCS } from '@/scripts/init-db';
import { exec } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check for API key to protect this endpoint
  // This is a simple protection method - in production you'd want something more secure
  const apiKey = request.headers.get('x-api-key');
  const configuredKey = process.env.ADMIN_API_KEY;
  
  if (!configuredKey || apiKey !== configuredKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Start initialization in the background
    // We don't wait for it to complete since it could take a while
    exec('pnpm init-rfc-db', (error, stdout, stderr) => {
      if (error) {
        console.error(`RFC database initialization error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`RFC database stderr: ${stderr}`);
        return;
      }
      console.log(`RFC database initialization output: ${stdout}`);
    });
    
    return NextResponse.json({
      message: `RFC database initialization started with ${IMPORTANT_RFCS.length} RFCs`,
      rfcs: IMPORTANT_RFCS
    });
  } catch (error) {
    console.error('Error starting RFC database initialization:', error);
    return NextResponse.json(
      { error: 'Failed to start RFC database initialization' },
      { status: 500 }
    );
  }
}