import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const SUPER_ADMIN_EMAIL = 'thelondonshakes.silchar@gmail.com';

/** Validate that the request comes from the super admin (basic email header check).
 *  For a production app you'd validate a signed session token; here we rely on
 *  the caller passing the authenticated user email which the admin layout already guards.
 */
function isSuperAdmin(req: NextRequest): boolean {
  const callerEmail = req.headers.get('x-admin-email') || '';
  return callerEmail.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// ── GET /api/admin/staff-accounts ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isSuperAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const accounts = await prisma.staffAccount.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      active: true, createdAt: true, updatedAt: true,
      // never return passwordHash
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ accounts });
}

// ── POST /api/admin/staff-accounts  (create) ──────────────────────────────
export async function POST(req: NextRequest) {
  if (!isSuperAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'name, email, password and role are required' }, { status: 400 });
  }

  const VALID_ROLES = ['admin', 'manager', 'waiter'];
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be admin, manager, or waiter.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  // Check for duplicates
  const existing = await prisma.staffAccount.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const account = await prisma.staffAccount.create({
    data: { name, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'CREATE_STAFF_ACCOUNT',
      details: `Created ${role} account for ${email}`,
      adminEmail: SUPER_ADMIN_EMAIL,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, account }, { status: 201 });
}

// ── PATCH /api/admin/staff-accounts  (update name/role/active/password) ───
export async function PATCH(req: NextRequest) {
  if (!isSuperAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { id, name, role, active, password } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (active !== undefined) updateData.active = active;
  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  const oldAccount = await prisma.staffAccount.findUnique({ where: { id } });
  if (!oldAccount) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const account = await prisma.staffAccount.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, active: true, updatedAt: true },
  });

  // Audit log
  const changedFields: string[] = [];
  if (name !== undefined) changedFields.push(`name to "${name}"`);
  if (role !== undefined) changedFields.push(`role to "${role}"`);
  if (active !== undefined) changedFields.push(`status active to "${active}"`);
  if (password) changedFields.push(`password`);

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_STAFF_ACCOUNT',
      details: `Updated staff account for ${account.email}. Changed: ${changedFields.join(', ')}`,
      adminEmail: SUPER_ADMIN_EMAIL,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, account });
}

// ── DELETE /api/admin/staff-accounts  (delete by id) ──────────────────────
export async function DELETE(req: NextRequest) {
  if (!isSuperAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const oldAccount = await prisma.staffAccount.findUnique({ where: { id } });
  if (oldAccount) {
    await prisma.staffAccount.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_STAFF_ACCOUNT',
        details: `Deleted staff account for ${oldAccount.email} (${oldAccount.name}, role: ${oldAccount.role})`,
        adminEmail: SUPER_ADMIN_EMAIL,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
