'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateUserProfile(data: { fullName?: string }) {
  const supabase = await createClient()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return { error: "You must be logged in to update your profile" }
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
      }
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function changeUserPassword(data: {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}) {
  const supabase = await createClient()

  try {
    // First verify the current user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return { error: "You must be logged in to change your password" }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email!,
      password: data.currentPassword,
    })

    if (signInError) {
      return { error: "Current password is incorrect" }
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error changing password:", error)
    return { error: "Failed to change password" }
  }
}
