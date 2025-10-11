import { join } from "node:path";
import { readFile } from "node:fs";
import type { ServerResponse } from "node:http";
import ErrnoException = NodeJS.ErrnoException;

import endResponse from "./endResponse";
import type { ValidContentType } from "./types";

// TODO: maybe statically served index and assets works better.
function serveAssets(
  requestPath: string[],
  response: ServerResponse
): void {
  const filePath: string = join(__dirname, ...requestPath);

  readFile(
    filePath,
    (
      err: ErrnoException,
      data: NonSharedBuffer
    ): void => {
      if (err) {
        endResponse(response,500, 'text/plain', 'Internal Server Error');
      } else {
        let type: ValidContentType = 'text/html';
        const dir: string = requestPath[0];

        if (dir === 'favicon.ico') type = 'image/png';
        if (dir === 'assets') type = 'image/svg+xml';
        if (dir === 'styles') type = 'text/css';
        if (['scripts', 'node_modules'].includes(dir)) type = 'text/javascript';

        endResponse(response,200, type, data);
      }
    }
  );
}

export default serveAssets;