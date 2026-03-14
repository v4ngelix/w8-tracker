// Node imports:
import { createServer } from 'http';
import { parse as parseUrl } from 'node:url';
import { parse } from 'node:querystring';
import { DatabaseSync, type StatementResultingChanges } from 'node:sqlite';
import type { SQLOutputValue } from 'node:sqlite';

import endResponse from './endResponse.ts';

// Types:
import type { Server } from 'http';
import type { IncomingMessage, ServerResponse } from 'node:http';

import serveAssets from './serveAssets.ts';
import serveIndex from './serveIndex.ts';
import updateWeight from './updateWeight.ts';
import addWeight from "./addWeight.ts";
import setApplicationKey from "./setApplicationKey.ts";

/** Value to match */
const applicationKey = "KordElasÜksKauboi";

const databaseName: string | undefined = process.env?.DATABASE;
const hostname: string | undefined = process.env?.HOSTNAME;
const port: number = Number(process.env?.PORT);

const database = new DatabaseSync(databaseName);

const server: Server = createServer(
  async (
    request: IncomingMessage,
    response: ServerResponse
  ): Promise<void> => {
    response.setHeaders(
      new Map([
        ['Access-Control-Allow-Origin', `https://${hostname}`],
        ['Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'],
        ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept']
      ])
    );

    const { url, method, } = request;
    const requestPath: string[] = url.split(/[\/?]/).slice(1);
    console.log('Incoming url: ', url, requestPath, method);

    if (request.url === '/' && method === 'GET') {
      serveIndex(response);
    } else if (requestPath[0] === 'setKey' && method === 'GET') {
      setApplicationKey(url, response);
    } else if (requestPath[0] === 'validateKey' && method === 'GET') {
      const cookies = parse((request.headers.cookie ?? '').replace(/;\s*/g, '&'));
      const w8Key = decodeURIComponent(Array.isArray(cookies['w8-key']) ? cookies['w8-key'][0] : cookies['w8-key'] ?? '');
      const isValid = w8Key === applicationKey;
      endResponse(response, 200, 'application/json', JSON.stringify({ valid: isValid }));
    } else if (
      ['assets', 'styles', 'scripts', 'favicon.ico'].includes(requestPath[0])
      && method === 'GET'
    ) {
      serveAssets(requestPath, response);
    } else if (
      request.url === '/api/ping'
      && method === 'GET'
    ) {
      endResponse(response,200, 'text/plain', 'Ping successful');
    } else if (requestPath[0] === 'api') {
      const endPoint: string = requestPath?.[1] ?? '';
      console.log('It is an API request', endPoint);

      const cookies = parse((request.headers.cookie ?? '').replace(/;\s*/g, '&'));
      const w8Key = decodeURIComponent(Array.isArray(cookies['w8-key']) ? cookies['w8-key'][0] : cookies['w8-key'] ?? '');
      const isAuthorized = w8Key === applicationKey;

      if (endPoint.includes('addWeight') && request.method === 'GET') {
        // Validate inputs!

        // Update deprecated method usage
        const parsedUrl = parseUrl(url);
        const queryParams = parse(parsedUrl.query);
        const weight: string | string[] = queryParams?.weight;
        const weightB: string | string[] = Array.isArray(weight) ? weight[0] : weight;
        const date: string | string[] = queryParams?.date;
        const dateB: string | string[] = Array.isArray(date) ? date[0] : date;

        if (!weight || !date) {
          endResponse(response, 500, 'text/plain', 'Invalid input(s)');
        } else if (!isAuthorized) {
          endResponse(response, 200, 'text/plain', 'Weight added');
        } else {

          console.log({
            weight,
            weightType: typeof weight,
            date,
            dateType: typeof date
          });

          try {
            const existingWeight: Record<string, SQLOutputValue> | undefined = (
              database
                .prepare('SELECT * FROM weight_data WHERE date = ?')
                .get(dateB)
            );

            if (existingWeight) {
              updateWeight(response, database, dateB, weightB);
            } else {
              addWeight(response, database, dateB, weightB);
            }
          } catch (error) {
            endResponse(response, 500, 'text/plain', `Error: ${error}`);
          }
        }
      } else if (endPoint.includes('getWeights') && request.method === 'GET') {
        try {
          const weights: Record<string, SQLOutputValue>[] = database.prepare('SELECT * FROM weight_data').all();
          if (weights && weights.length > 0) {
            endResponse(response,200, 'application/json', JSON.stringify(weights))
          } else {
            endResponse(response,500, 'text/plain', 'No data found.');
          }
        } catch (error) {
          console.log('Error while getting values', error);
        }
      }
      // use DELETE?
      else if (endPoint.includes('deleteWeight') && request.method === 'GET') {
        if (!isAuthorized) {
          endResponse(response, 200, 'text/plain', 'Weight deleted');
        } else {
          const parsedUrl = parseUrl(url);
          const queryParams = parse(parsedUrl.query);
          const date = queryParams?.date;
          const dateB: string | string[] = Array.isArray(date) ? date[0] : date;

          try {
            const statement: StatementResultingChanges = (
              database
                .prepare('DELETE FROM weight_data WHERE date = ?')
                .run(dateB)
          );

            if (statement?.changes > 0) {
              endResponse(response,200, 'text/plain', 'Weight deleted');
            } else {
              endResponse(response,500, 'text/plain', `Weight not deleted`);
            }
          } catch (error) {
            console.log('Error while deleting value', error);
          }
        }
      } else {
        endResponse(response,404, 'text/plain', 'Not found');
      }
    }
  }
);

server.listen(
  port,
  hostname,
  (): void => { console.log(`Server running at http://${ hostname }:${ port }/`); }
);
