import 'core-js/es/string/starts-with';
import 'core-js/es/symbol';
import 'core-js/es/array/from';
import 'core-js/es/typed-array/slice';
import 'core-js/es/array/includes';
import 'core-js/es/string/includes';
import 'core-js/es/set';
import 'promise-polyfill/src/polyfill';
import 'fast-text-encoding';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import Auth0Client from './Auth0Client';
import { Auth0ClientOptions } from './global';
import { DEFAULT_FETCH_TIMEOUT_MS } from './constants';

import { getJSON } from './http';

import './global';

export * from './global';

export default async function createAuth0Client(options: Auth0ClientOptions) {
  try {
    const baseURL = new URL(`https://${options.domain}`);
    const wellKnownConfig = await getJSON(
      `${baseURL.origin}/.well-known/openid-configuration`,
      DEFAULT_FETCH_TIMEOUT_MS,
	  "",
	  "",
      {},
      null
    ) as any;

    options.oidcConfig = {
      issuer: wellKnownConfig.issuer,
      tokenEndpoint: new URL(wellKnownConfig.token_endpoint).pathname,
      endSessionEndpoint: new URL(wellKnownConfig.end_session_endpoint)
        .pathname,
      authorizeEndpoint: new URL(wellKnownConfig.authorization_endpoint)
        .pathname,
      ...options.oidcConfig
    };
  } catch {
    // Swallow .well-known fetch errors, and use hardcoded fallbacks in Auth0Client instead
  }

  const auth0 = new Auth0Client(options);
  await auth0.checkSession();
  return auth0;
}

export { Auth0Client };

export {
  GenericError,
  AuthenticationError,
  TimeoutError,
  PopupTimeoutError,
  PopupCancelledError
} from './errors';

export { ICache, LocalStorageCache, InMemoryCache, Cacheable } from './cache';
