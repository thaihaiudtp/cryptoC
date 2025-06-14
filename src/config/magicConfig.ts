import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import type { OAuthProvider, OAuthRedirectConfiguration } from '@magic-ext/oauth';

const MAGIC_PUBLISHABLE_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY;

export const magic = new Magic(MAGIC_PUBLISHABLE_KEY, {
  extensions: [new OAuthExtension()],
  network: 'mainnet',
});

// Type-safe OAuth config
export const googleOAuthConfig: OAuthRedirectConfiguration = {
  provider: 'google' as OAuthProvider,
  redirectURI: `${window.location.origin}/auth/callback`,
  scope: ['openid', 'profile', 'email'],
};