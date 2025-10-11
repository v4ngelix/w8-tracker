import type { ServerResponse } from "node:http";
import type { DatabaseSync, StatementResultingChanges } from "node:sqlite";
import endResponse from "./endResponse.ts";

/** Adds a new date and weight row. */
function addWeight(
  response: ServerResponse,
  database: DatabaseSync,
  date: string,
  weight: string
): void {
  console.log('Trying to insert');

  try {
    const statement: StatementResultingChanges = (
      database
        .prepare('INSERT INTO weight_data (date, weight) VALUES (?, ?)')
        .run(date, weight)
    );

    if (statement?.changes > 0) {
      endResponse(response,200, 'text/plain', 'Weight added');
    } else {
      endResponse(response,500, 'text/plain', `Weight not added`);
    }
  } catch (error) {
    console.log('Error while addinh value', error);
  }
}

export default addWeight;
