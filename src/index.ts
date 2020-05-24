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
  const baseURL = new URL(`https://${options.domain}`);
  let config;
  try {
    config = await getJSON(
      `${baseURL.origin}/.well-known/openid-configuration`,
      DEFAULT_FETCH_TIMEOUT_MS,
      {},
      null
    );
  } catch (error) {
    throw `Cannot get the well-known configuration from ${baseURL.origin}/.well-known/openid-configuration}`;
  }

  if (!config.token_endpoint) {
    throw 'Cannot get token_endpoint from the well-known configuration';
  }

  if (!config.end_session_endpoint) {
    throw 'Cannot get end_session_endpoint from the well-known configuration';
  }

  if (!config.authorization_endpoint) {
    throw 'Cannot get authorization_endpoint from the well-known configuration';
  }

  if (!config.issuer) {
    throw 'Cannot get issuer from the well-known configuration';
  }

  options = {
    ...options,
    oidcConfig: {
      tokenEndpoint: new URL(config.token_endpoint).pathname,
      issuer: config.issuer,
      endSessionEndpoint: new URL(config.end_session_endpoint).pathname,
      authorizeEndpoint: new URL(config.authorization_endpoint).pathname
    }
  };

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
