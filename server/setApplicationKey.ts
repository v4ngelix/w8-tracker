import { parse as parseUrl } from 'node:url';
import { parse } from 'node:querystring';
import type { ServerResponse } from 'node:http';

import endResponse from './endResponse.ts';

/**
 * Sets a "w8-key" cookie in the user's browser.
 * Usage: GET /setKey?key=myValue
 */
function setApplicationKey(url: string, response: ServerResponse): void {
  const parsedUrl = parseUrl(url);
  const queryParams = parse(parsedUrl.query);
  const newKey = queryParams.key;

  if (!newKey || typeof newKey !== "string") {
    endResponse(response, 400, 'text/plain', 'Missing "key" query parameter.');
    return;
  } else {
    response.setHeader(
      'Set-Cookie',
      `w8-key=${encodeURIComponent(newKey)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=31536000`
    );
    endResponse(response, 200, 'text/plain', 'Key set successfully.');
  }
}

export default setApplicationKey;