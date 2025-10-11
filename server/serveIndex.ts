import { readFile } from "node:fs";
import type { ServerResponse } from "node:http";

import endResponse from "./endResponse.ts";
import { join, dirname } from "node:path";

function serveIndex(
  response: ServerResponse
): void {
  try {
  readFile(
    './index.html',
    (
      err,
      data: NonSharedBuffer
    ): void => {
      if (err) {
        endResponse(response,500, 'text/plain', 'Internal Server Error')
      } else {
        endResponse(response,200, 'text/html', data);
      }
    }
  );
  } catch (e) {
    console.error(e.toString());
  }

}

export default serveIndex;
