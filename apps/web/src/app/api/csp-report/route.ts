/**
 * CSP Report Endpoint
 *
 * Receives CSP violation reports for monitoring.
 * Reports are logged but not stored with PII.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract violation details (no PII in these fields)
    const report = body['csp-report'] || {};
    const violation = {
      blockedUri: report['blocked-uri'] || 'unknown',
      violatedDirective: report['violated-directive'] || 'unknown',
      sourceFile: report['source-file'] || 'unknown',
      lineNumber: report['line-number'] || 0,
      timestamp: new Date().toISOString(),
    };

    // Log for monitoring (no user data)
    console.info('[CSP Violation]', JSON.stringify(violation));

    // Return 204 No Content (standard for report-uri)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Invalid report - ignore
    console.error('[CSP Report] Invalid report:', error);
    return new NextResponse(null, { status: 204 });
  }
}

// GET not supported for CSP reports
export async function GET() {
  return NextResponse.json(
    { error: 'Use POST to submit CSP reports' },
    { status: 405 },
  );
}
