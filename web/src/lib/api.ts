import { supabase } from './supabaseClient';

const API_URL = 'http://localhost:8000';

export async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(options.headers);
  if (session?.user) {
    headers.set('X-User-ID', session.user.id);
    headers.set('X-User-Email', session.user.email || '');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'API request failed');
  }

  return response.json();
}
