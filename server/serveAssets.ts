import { join } from 'node:path';
import { readFile } from 'node:fs';
import type { ServerResponse } from 'node:http';

import endResponse from './endResponse.ts';
import type { ValidContentType } from "./types.ts";

// TODO: maybe statically served index and assets works better.
function serveAssets(
  requestPath: string[],
  response: ServerResponse
): void {
  const filePath: string = join('./', ...requestPath);

  readFile(
    filePath,
    (
      err,
      data: NonSharedBuffer
    ): void => {
      if (err) {
        endResponse(response,500, 'text/plain', 'Internal Server Error');
      } else {
        let type: ValidContentType = 'text/html';
        const dir: string = requestPath[0];

        if (dir === 'favicon.ico') type = 'image/png';
        if (dir === 'README.md') type = 'text/markdown';
        if (dir === 'assets') type = 'image/svg+xml';
        if (dir === 'styles') type = 'text/css';
        if (['scripts', 'node_modules'].includes(dir)) type = 'text/javascript';

        endResponse(response,200, type, data);
      }
    }
  );
}

export default serveAssets;