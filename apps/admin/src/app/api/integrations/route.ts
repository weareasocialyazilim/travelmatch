import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import {
  getAllIntegrationsHealth,
  getIntegrationHealth,
} from '@/lib/integrations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/integrations
 * Get all integrations health status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check permission
    const canView = hasPermission(session, 'integrations', 'view');
    if (!canView) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    // Get specific integration if id provided
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('id');

    if (integrationId) {
      const integration = await getIntegrationHealth(integrationId);
      if (!integration) {
        return NextResponse.json(
          { error: 'Entegrasyon bulunamadı' },
          { status: 404 },
        );
      }
      return NextResponse.json({ integration });
    }

    // Get all integrations health
    const integrations = await getAllIntegrationsHealth();

    // Calculate summary
    const summary = {
      total: integrations.length,
      healthy: integrations.filter((i) => i.status === 'healthy').length,
      warning: integrations.filter((i) => i.status === 'warning').length,
      error: integrations.filter((i) => i.status === 'error').length,
      unknown: integrations.filter((i) => i.status === 'unknown').length,
    };

    return NextResponse.json({
      integrations,
      summary,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Integrations GET error:', error);
    return NextResponse.json(
      { error: 'Entegrasyon durumu kontrol edilirken bir hata oluştu' },
      { status: 500 },
    );
  }
}
