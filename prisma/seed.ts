import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPhone = process.env.SEED_ADMIN_PHONE;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!url || !service) {
    throw new Error('SUPABASE env vars are required');
  }

  // 1) Subjects
  const subject = await prisma.subject.upsert({
    where: { slug: 'mat-sauattylyq' },
    update: {},
    create: {
      slug: 'mat-sauattylyq',
      nameKz: 'Математикалық сауаттылық',
      order: 1,
    },
  });
  await prisma.subject.upsert({
    where: { slug: 'qazaqstan-tarihy' },
    update: {},
    create: {
      slug: 'qazaqstan-tarihy',
      nameKz: 'Қазақстан тарихы',
      order: 2,
    },
  });

  // 2) First admin via Supabase Admin API — idempotent.
  if (adminPhone && adminPassword) {
    const supabaseAdmin = createClient(url, service);

    // Try create; if exists, look up by phone.
    let userId: string | undefined;
    const created = await supabaseAdmin.auth.admin.createUser({
      phone: adminPhone,
      password: adminPassword,
      phone_confirm: true,
      user_metadata: { name: 'Admin' },
    });
    if (created.data?.user?.id) {
      userId = created.data.user.id;
      console.log('Auth user created:', userId);
    } else if (created.error) {
      console.log('createUser failed, looking up by phone…', created.error.message);
      // Find existing.
      let page = 1;
      while (!userId) {
        const list = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        if (list.error) throw list.error;
        const found = list.data.users.find((u) => u.phone === adminPhone.replace(/^\+/, '') || u.phone === adminPhone);
        if (found) {
          userId = found.id;
          // Reset password just in case.
          await supabaseAdmin.auth.admin.updateUserById(found.id, {
            password: adminPassword,
            phone_confirm: true,
          });
          console.log('Auth user found, password reset:', userId);
        }
        if (!list.data.users.length || list.data.users.length < 200) break;
        page += 1;
      }
    }

    if (userId) {
      // Ensure public.users row exists with ADMIN role.
      await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, phone: adminPhone, name: 'Admin', role: 'ADMIN' },
        update: { role: 'ADMIN', phone: adminPhone },
      });
      console.log('Admin ready:', userId);
    } else {
      console.warn('Could not resolve admin user id');
    }
  } else {
    console.warn('SEED_ADMIN_PHONE / SEED_ADMIN_PASSWORD not set — admin not created');
  }

  console.log('Seed done. Subject:', subject.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
