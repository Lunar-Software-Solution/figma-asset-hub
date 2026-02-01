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

    const { teamId, fileKey } = await req.json();
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

    const figmaToken = connection.access_token;

    // If a specific file key is provided, fetch that file
    if (fileKey) {
      const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
        headers: { 'X-Figma-Token': figmaToken },
      });

      if (!fileResponse.ok) {
        const errorText = await fileResponse.text();
        console.error('Figma file API error:', fileResponse.status, errorText);
        if (fileResponse.status === 401 || fileResponse.status === 403) {
          throw new Error('Figma token expired or lacks permission - please reconnect');
        }
        if (fileResponse.status === 404) {
          throw new Error('Figma file not found - check the file key');
        }
        throw new Error('Failed to fetch Figma file');
      }

      const fileData = await fileResponse.json();
      return new Response(
        JSON.stringify({ 
          files: [{
            key: fileKey,
            name: fileData.name,
            last_modified: fileData.lastModified,
            thumbnail_url: fileData.thumbnailUrl,
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to get user's recent files using the /v1/me endpoint
    const meResponse = await fetch('https://api.figma.com/v1/me', {
      headers: { 'X-Figma-Token': figmaToken },
    });

    if (!meResponse.ok) {
      const errorText = await meResponse.text();
      console.error('Figma /me API error:', meResponse.status, errorText);
      if (meResponse.status === 401 || meResponse.status === 403) {
        throw new Error('Figma token expired or invalid - please reconnect');
      }
      throw new Error('Failed to verify Figma connection');
    }

    const meData = await meResponse.json();
    
    // The Figma API with PAT doesn't have a "list all files" endpoint
    // Users need to provide file keys directly or we need team/project IDs
    // Return empty files with info that user should add files manually
    return new Response(
      JSON.stringify({ 
        files: [],
        user: {
          id: meData.id,
          email: meData.email,
          handle: meData.handle,
        },
        message: 'Connection verified! To import files, paste a Figma file URL.'
      }),
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
