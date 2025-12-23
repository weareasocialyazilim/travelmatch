/**
 * CSRF Token API Endpoint
 * Returns a fresh CSRF token in the response headers
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // The middleware already sets the CSRF token
  // This endpoint just needs to return a response so the client can read the header
  return NextResponse.json({ ok: true });
}
