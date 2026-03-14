import { parse as parseUrl } from 'node:url';
import { parse } from 'node:querystring';
import type { ServerResponse } from 'node:http';

import endResponse from './endResponse.ts';

/**
 * Sets a localStorage key in the user's browser.
 * Usage: GET /setKey?value=myValue
 */
function setLocalStorageKey(url: string, response: ServerResponse): void {
  const parsedUrl = parseUrl(url);
  const queryParams = parse(parsedUrl.query);
  const newKey = queryParams.key;

  if (!newKey && typeof newKey !== "string") {
    endResponse(response, 400, 'text/plain', 'Missing "key" query parameters.');
    return;
  }

  const html: string = (
    "<!DOCTYPE html>\n"
    + "<html>\n"
    + "<head><meta charset=\"utf-8\"><title>Set Key</title></head>\n"
    + "<body>\n"
    + "<script>\n"
    + `localStorage.setItem("w8-key", ${JSON.stringify(newKey)});\n`
    + "document.body.textContent = 'Key set successfully.';\n"
    + "</script>\n"
    + "</body>\n"
    + "</html>"
  );

  endResponse(response, 200, 'text/html', html);
}

export default setLocalStorageKey;
