import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return redirectWithError('Authorization denied');
    }

    if (!code || !state) {
      return redirectWithError('Missing authorization code or state');
    }

    // Parse state to get team_id and user_id
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return redirectWithError('Invalid state parameter');
    }

    const { team_id, user_id, redirect_url } = stateData;

    // Exchange code for access token
    const clientId = Deno.env.get('FIGMA_CLIENT_ID');
    const clientSecret = Deno.env.get('FIGMA_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret) {
      return redirectWithError('Figma credentials not configured');
    }

    const tokenResponse = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${supabaseUrl}/functions/v1/figma-callback`,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return redirectWithError('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get Figma user info
    const userResponse = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      return redirectWithError('Failed to get Figma user info');
    }

    const figmaUser = await userResponse.json();

    // Store connection in database
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { error: upsertError } = await supabase
      .from('figma_connections')
      .upsert({
        team_id,
        connected_by: user_id,
        figma_user_id: figmaUser.id,
        figma_email: figmaUser.email,
        access_token,
        refresh_token,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'team_id',
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      return redirectWithError('Failed to save connection');
    }

    // Redirect back to app with success
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${redirect_url}?figma_connected=true`,
      },
    });

  } catch (error) {
    console.error('Callback error:', error);
    return redirectWithError('An unexpected error occurred');
  }
});

function redirectWithError(message: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://lovable.dev';
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${baseUrl}/figma-hub?error=${encodeURIComponent(message)}`,
    },
  });
}
