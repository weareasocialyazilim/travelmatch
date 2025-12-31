import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'promos', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('is_active');
    const campaignId = searchParams.get('campaign_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    let query = supabase
      .from('promo_codes')
      .select('*, campaign:marketing_campaigns(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (isActive === 'true') {
      query = query.eq('is_active', true);
    } else if (isActive === 'false') {
      query = query.eq('is_active', false);
    }

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data: promoCodes, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      promo_codes: promoCodes,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Promo codes API error:', error);
    return NextResponse.json(
      { error: 'Promosyon kodları yüklenemedi' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'promos', 'create')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    // Validate required fields
    if (
      !body.code ||
      !body.discount_type ||
      body.discount_value === undefined
    ) {
      return NextResponse.json(
        { error: 'Kod, indirim türü ve indirim değeri zorunludur' },
        { status: 400 },
      );
    }

    // Validate discount type
    const validDiscountTypes = ['percentage', 'fixed', 'free_shipping'];
    if (!validDiscountTypes.includes(body.discount_type)) {
      return NextResponse.json(
        { error: 'Geçersiz indirim türü' },
        { status: 400 },
      );
    }

    // Validate percentage discount
    if (
      body.discount_type === 'percentage' &&
      (body.discount_value < 0 || body.discount_value > 100)
    ) {
      return NextResponse.json(
        { error: 'Yüzde indirim 0-100 arasında olmalıdır' },
        { status: 400 },
      );
    }

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', body.code.toUpperCase())
      .single();

    if (existingCode) {
      return NextResponse.json(
        { error: 'Bu promosyon kodu zaten mevcut' },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: body.code.toUpperCase(),
        campaign_id: body.campaign_id,
        description: body.description,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_order_amount: body.min_order_amount || 0,
        max_discount_amount: body.max_discount_amount,
        usage_limit: body.usage_limit,
        per_user_limit: body.per_user_limit || 1,
        valid_from: body.valid_from || new Date().toISOString(),
        valid_until: body.valid_until,
        is_active: body.is_active !== false,
        applicable_to: body.applicable_to || {},
        created_by: session.admin_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Create promo code error:', error);
    return NextResponse.json(
      { error: 'Promosyon kodu oluşturulamadı' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'promos', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Promosyon kodu ID gereklidir' },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {};

    // Only include fields that are present in the request
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.discount_type !== undefined)
      updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined)
      updateData.discount_value = body.discount_value;
    if (body.min_order_amount !== undefined)
      updateData.min_order_amount = body.min_order_amount;
    if (body.max_discount_amount !== undefined)
      updateData.max_discount_amount = body.max_discount_amount;
    if (body.usage_limit !== undefined)
      updateData.usage_limit = body.usage_limit;
    if (body.per_user_limit !== undefined)
      updateData.per_user_limit = body.per_user_limit;
    if (body.valid_from !== undefined) updateData.valid_from = body.valid_from;
    if (body.valid_until !== undefined)
      updateData.valid_until = body.valid_until;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.applicable_to !== undefined)
      updateData.applicable_to = body.applicable_to;

    const { data, error } = await supabase
      .from('promo_codes')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Update promo code error:', error);
    return NextResponse.json(
      { error: 'Promosyon kodu güncellenemedi' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'promos', 'delete')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Promosyon kodu ID gereklidir' },
        { status: 400 },
      );
    }

    // Soft delete - just deactivate the code
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Delete promo code error:', error);
    return NextResponse.json(
      { error: 'Promosyon kodu silinemedi' },
      { status: 500 },
    );
  }
}
