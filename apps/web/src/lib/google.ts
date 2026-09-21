/**
 * Thin wrapper around Google Identity Services (loaded from
 * https://accounts.google.com/gsi/client in index.html).
 *
 * On sign-in, GIS calls the callback with a `credential` — that string is the
 * Google-signed ID token. Send it verbatim to /api/auth/google; the backend
 * verifies it against Google's JWKS.
 */

interface CredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    ux_mode?: 'popup' | 'redirect';
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'small' | 'medium' | 'large';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
      logo_alignment?: 'left' | 'center';
    }
  ): void;
  prompt(): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

/** Resolve once GIS is ready in the page. Rejects if the script fails to load in 10s. */
export function ensureGoogleReady(): Promise<GoogleAccountsId> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id);
        return;
      }
      if (Date.now() - start > 10_000) {
        reject(new Error('Google Identity Services failed to load. Check network / ad-blockers.'));
        return;
      }
      setTimeout(tick, 50);
    };
    tick();
  });
}

export interface GoogleButtonOptions {
  container: HTMLElement;
  onCredential: (idToken: string) => void;
  width?: number;
  text?: 'signin_with' | 'continue_with';
}

/**
 * Initialize GIS with our client id and render the button into the container.
 * Throws if VITE_GOOGLE_CLIENT_ID is not set — never silently no-ops.
 */
export async function renderGoogleSignInButton(opts: GoogleButtonOptions): Promise<void> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID is not set. Add it to apps/web/.env with your Google OAuth Web client id.'
    );
  }
  const gis = await ensureGoogleReady();
  gis.initialize({
    client_id: clientId,
    callback: (response) => opts.onCredential(response.credential),
    ux_mode: 'popup',
  });
  gis.renderButton(opts.container, {
    theme: 'outline',
    size: 'large',
    text: opts.text ?? 'continue_with',
    shape: 'rectangular',
    width: opts.width ?? 320,
    logo_alignment: 'left',
  });
}
