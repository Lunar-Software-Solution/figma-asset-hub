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
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { teamId } = await req.json();
    if (!teamId) {
      throw new Error('Team ID required');
    }

    // Get Figma connection for team
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: connection, error: connectionError } = await adminClient
      .from('figma_connections')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (connectionError || !connection) {
      throw new Error('Figma not connected for this team');
    }

    // Fetch recent files from Figma
    const filesResponse = await fetch('https://api.figma.com/v1/me/files?page_size=20', {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
      },
    });

    if (!filesResponse.ok) {
      if (filesResponse.status === 401) {
        // Token expired, need to refresh
        throw new Error('Figma token expired - please reconnect');
      }
      throw new Error('Failed to fetch Figma files');
    }

    const filesData = await filesResponse.json();

    return new Response(
      JSON.stringify({ files: filesData.files || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching files:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
