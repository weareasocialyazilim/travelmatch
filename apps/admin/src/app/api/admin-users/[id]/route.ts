import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  requires_2fa: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'admin_users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Admin user GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'admin_users', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Get current admin user
    const { data: currentAdminData, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentAdminData) {
      return NextResponse.json({ error: 'Admin kullanıcı bulunamadı' }, { status: 404 });
    }

    const currentAdmin = currentAdminData as AdminUser;

    // Prevent self-demotion for super_admin
    if (
      id === session.admin.id &&
      currentAdmin.role === 'super_admin' &&
      body.role &&
      body.role !== 'super_admin'
    ) {
      return NextResponse.json(
        { error: 'Kendi rolünüzü düşüremezsiniz' },
        { status: 400 }
      );
    }

    // Allowed update fields
    const allowedFields = ['name', 'role', 'is_active', 'requires_2fa', 'avatar_url'];
    const updateData: Partial<AdminUser> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = body[field];
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: admin, error } = await (supabase as any)
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Admin user update error:', error);
      return NextResponse.json({ error: 'Admin kullanıcı güncellenemedi' }, { status: 500 });
    }

    // Create audit log
    await createAuditLog(
      session.admin.id,
      'update_admin_user',
      'admin_user',
      id,
      currentAdmin,
      admin,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Admin user PATCH error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'admin_users', 'delete')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === session.admin.id) {
      return NextResponse.json(
        { error: 'Kendinizi silemezsiniz' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get current admin for audit log
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    // Soft delete by setting is_active to false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Admin user delete error:', error);
      return NextResponse.json({ error: 'Admin kullanıcı silinemedi' }, { status: 500 });
    }

    // Create audit log
    if (currentAdmin) {
      await createAuditLog(
        session.admin.id,
        'delete_admin_user',
        'admin_user',
        id,
        currentAdmin,
        null,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
