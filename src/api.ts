import { TokenEndpointOptions } from './global';
import { DEFAULT_AUTH0_CLIENT } from './constants';
import { getJSON } from './http';
import { createQueryParams } from './utils';

export type TokenEndpointResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

export async function oauthToken(
  {
    baseUrl,
    timeout,
    audience,
    scope,
    auth0Client,
    tokenEndpoint,
    ...options
  }: TokenEndpointOptions,
  worker?: Worker
) {
  return await getJSON<TokenEndpointResponse>(
    `${baseUrl}${tokenEndpoint}`,
    timeout,
    audience || 'default',
    scope,
    {
      method: 'POST',
      body: createQueryParams(options),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Auth0-Client': btoa(
          JSON.stringify(auth0Client || DEFAULT_AUTH0_CLIENT)
        )
      }
    },
    worker
  );
}
