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
  if (options.advancedOptions?.useWellKnown) {
    const baseURL = new URL(`https://${options.domain}`);
    const config = await getJSON(
      `${baseURL.origin}/.well-known/openid-configuration`,
      DEFAULT_FETCH_TIMEOUT_MS,
      {},
      null
    );

    options.advancedOptions = {
      ...options.advancedOptions,
      oidcConfig: {
        tokenEndpoint: config.token_endpoint,
        issuer: config.issuer,
        tokenEndpointContentType: 'application/x-www-form-urlencoded',
        ...options.advancedOptions.oidcConfig
      }
    };
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
