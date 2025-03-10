import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/app'; // ✅ Redirects to /app by default

    if (!code) {
      console.error('Missing auth code in callback URL.');
      return NextResponse.redirect(`${origin}/auth/sign-in`);
    }

    // ✅ Initialize Supabase client
    const supabase = await createClient();

    // ✅ Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Supabase Auth Error:', error);
      return NextResponse.redirect(`${origin}/auth/sign-in`);
    }

    // ✅ Retrieve session to verify authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No session found after exchanging code.');
      return NextResponse.redirect(`${origin}/auth/sign-in`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect('/auth/sign-in');
  }
}
