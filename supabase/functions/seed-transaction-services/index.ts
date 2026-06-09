// ============================================================
// OSS — EDGE FUNCTION: seed-transaction-services
//
// Triggered via a direct HTTP POST from the frontend immediately
// after a new transaction is created.
//
// What it does:
// 1. Receives the new transaction_id and package_id
// 2. Fetches all services linked to that package from package_services
// 3. Inserts one transaction_services row per service (task_status = Pending)
//
// This ensures every transaction starts with a full, trackable
// task list without any manual step from the user.
//
// Deploy with:
//   supabase functions deploy seed-transaction-services
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Parse request body ──────────────────────────────────
    const { transaction_id, package_id } = await req.json()

    if (!transaction_id || !package_id) {
      return new Response(
        JSON.stringify({ error: 'transaction_id and package_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Create Supabase client with service role ────────────
    // Service role bypasses RLS — needed to write transaction_services
    // from a server context where there is no user session.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // ── Fetch all services for this package ─────────────────
    const { data: packageServices, error: fetchError } = await supabase
      .from('package_services')
      .select('service_id')
      .eq('package_id', package_id)

    if (fetchError) {
      console.error('Error fetching package services:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!packageServices || packageServices.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No services found for this package', inserted: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Build transaction_services rows ─────────────────────
    const rows = packageServices.map((ps: { service_id: string }) => ({
      transaction_id,
      service_id: ps.service_id,
      task_status: 'Pending',
    }))

    // ── Insert all task rows ─────────────────────────────────
    const { error: insertError } = await supabase
      .from('transaction_services')
      .insert(rows)

    if (insertError) {
      console.error('Error inserting transaction services:', insertError)
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Success ──────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        message: 'Transaction services seeded successfully',
        transaction_id,
        inserted: rows.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
