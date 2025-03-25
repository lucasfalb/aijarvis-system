'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/app')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: userExists, error: checkError } = await supabase
    .rpc("check_user_exists", { email_input: email });

  if (checkError) {
    return { error: "Error checking user existence. Please try again." };
  }

  if (userExists) {
    return { error: "This email is already registered. Please sign in." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/signup`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/reset-password`,
    }
  )

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData, refresh_token: string | null) {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (!refresh_token) {
    return { error: "Invalid or missing session token." };
  }

  const { data, error: refreshError } = await supabase.auth.refreshSession({ refresh_token });

  if (refreshError || !data.session) {
    return { error: "Invalid or expired session token." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}


export async function signOut() {
  const supabase = await createClient() 
  await supabase.auth.signOut()
  redirect('/auth/sign-in')
}


export async function signInWithGoogle() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }
    if (data?.url) {
      return data.url
    }
    return { success: true, data };
  } catch (error) {
      console.error("Google sign-in error:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }
}
