import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { teamId, token } = await req.json();

    if (!teamId || !token) {
      throw new Error('Missing teamId or token');
    }

    // Validate the token by fetching user info from Figma
    const figmaResponse = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!figmaResponse.ok) {
      const errorText = await figmaResponse.text();
      console.error('Figma API error:', errorText);
      throw new Error('Invalid Figma token');
    }

    const figmaUser = await figmaResponse.json();

    // Use service role to write to database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upsert the connection
    const { error: upsertError } = await supabaseAdmin
      .from('figma_connections')
      .upsert({
        team_id: teamId,
        connected_by: user.id,
        figma_user_id: figmaUser.id,
        figma_email: figmaUser.email,
        access_token: token,
        refresh_token: null,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'team_id',
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save connection');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        figmaUser: { 
          id: figmaUser.id, 
          email: figmaUser.email,
          handle: figmaUser.handle,
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error connecting Figma:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
