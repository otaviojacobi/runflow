import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const allParams = Array.from(requestUrl.searchParams.entries());

  console.log('[Auth Callback] Full URL:', requestUrl.href);
  console.log('[Auth Callback] All params:', allParams);
  console.log('[Auth Callback] Code:', code);
  console.log('[Auth Callback] Type:', type);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.log('[Auth Callback] Error exchanging code:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }

    // If this is a password recovery, redirect to reset-password page
    if (type === 'recovery') {
      console.log('[Auth Callback] ✓ Type is recovery - redirecting to reset-password page');
      return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
    }

    console.log('[Auth Callback] ✗ Type is NOT recovery - checking/creating user profile');

    if (data.user) {
      // Check if user profile exists, create if not
      try {
        const existingProfile = await prisma.userProfile.findUnique({
          where: { id: data.user.id },
        });

        if (!existingProfile) {
          await prisma.userProfile.create({
            data: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            },
          });
        }
      } catch (err) {
        console.error('Error creating user profile:', err);
      }

      // Redirect to profile page
      return NextResponse.redirect(new URL('/profile', requestUrl.origin));
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
}
