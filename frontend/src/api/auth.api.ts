import { supabase } from '../lib/supabase'

export const authApi = {
  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return { message: 'If that email is registered, a reset link has been sent.' }
  },

  resetPassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return { message: 'Password updated successfully. You can now log in.' }
  },
}
