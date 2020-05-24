import 'core-js/es/string/starts-with';
import 'core-js/es/array/from';
import 'core-js/es/typed-array/slice';
import 'core-js/es/array/includes';
import 'core-js/es/string/includes';
import 'core-js/es/set';
import 'promise-polyfill/src/polyfill';
import 'fast-text-encoding';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import Auth0Client from './Auth0Client';
import * as ClientStorage from './storage';
import { Auth0ClientOptions } from './global';
import { CACHE_LOCATION_MEMORY, DEFAULT_FETCH_TIMEOUT_MS } from './constants';
import { getJSON } from './utils';

import './global';

export * from './global';

export default async function createAuth0Client(options: Auth0ClientOptions) {
  try {
    const baseURL = new URL(`https://${options.issuer ?? options.domain}`);
    const wellKnownConfig = await getJSON(
      `${baseURL.origin}/.well-known/openid-configuration`,
      DEFAULT_FETCH_TIMEOUT_MS,
      {},
      null
    );
    const config = {
      tokenEndpoint: new URL(wellKnownConfig.token_endpoint).pathname,
      endSessionEndpoint: new URL(wellKnownConfig.end_session_endpoint)
        .pathname,
      authorizeEndpoint: new URL(wellKnownConfig.authorization_endpoint)
        .pathname
    };

    options.issuer = wellKnownConfig.issuer;
    options.oidcConfig = {
      ...options.oidcConfig,
      ...config
    };
  } catch {
    // Swallow .well-known fetch errors, and use hardcoded fallbacks in Auth0Client instead
  }

  const auth0 = new Auth0Client(options);

  if (
    auth0.cacheLocation === CACHE_LOCATION_MEMORY &&
    !ClientStorage.get('auth0.is.authenticated')
  ) {
    return auth0;
  }

  try {
    await auth0.getTokenSilently();
  } catch (error) {
    if (error.error !== 'login_required') {
      throw error;
    }
  }

  return auth0;
}

export { Auth0Client };
