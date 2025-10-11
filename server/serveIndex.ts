import { readFile } from "node:fs";
import { join } from "node:path";
import type { ServerResponse } from "node:http";
import ErrnoException = NodeJS.ErrnoException;

import endResponse from "./endResponse";

function serveIndex(
  response: ServerResponse
): void {
  const indexPath: string = join(__dirname, 'index.html');

  readFile(
    indexPath,
    (
      err: ErrnoException,
      data: NonSharedBuffer
    ): void => {
      if (err) {
        endResponse(response,500, 'text/plain', 'Internal Server Error')
      } else {
        endResponse(response,200, 'text/html', data);
      }
    }
  );
}

export default serveIndex;
