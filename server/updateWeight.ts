import type { ServerResponse } from "node:http";
import type { DatabaseSync, StatementResultingChanges } from 'node:sqlite';
import endResponse from "./endResponse";

/** Updates the weight value of an existing date row. */
function updateWeight(
  response: ServerResponse,
  database: DatabaseSync,
  date: string,
  weight: string
): void {
  console.log('Trying to update', date);

  try {
    const statement: StatementResultingChanges = (
      database
        .prepare('UPDATE weight_data SET weight = ? WHERE date = ?')
        .run(date, weight)
    );

    if (statement?.changes > 0) {
      endResponse(response,200, 'text/plain', 'Weight updated');
    } else {
      endResponse(response,500, 'text/plain', `Weight not updated`);
    }
  } catch (error) {
    console.log('Error while updating existing value', error);
  }
}

export default updateWeight;
