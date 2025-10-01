import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { username, password, first_name, last_name, role } = await req.json()
    if (!username || !password || !first_name || !role) {
      return new Response(JSON.stringify({ error: 'Field username, password, nama depan, dan peran harus diisi' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const email = `${username.toLowerCase()}@kasir.local`;
    const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { first_name, last_name, username },
    })

    if (createError) throw createError;
    if (!user) throw new Error("Gagal membuat pengguna.");

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', user.id)

    if (updateError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      throw updateError
    }

    return new Response(JSON.stringify({ message: 'Pengguna berhasil dibuat' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})