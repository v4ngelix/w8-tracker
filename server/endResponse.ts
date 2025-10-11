import type { ServerResponse } from "node:http";
import type { ValidContentType } from "./types";

/** An utility method for ending response. */
function endResponse(
  response: ServerResponse,
  statusCode: number,
  contentType: ValidContentType,
  /** Status message or returnable data. */
  message: string | NonSharedBuffer,
): void {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(message);
}

export default endResponse;
