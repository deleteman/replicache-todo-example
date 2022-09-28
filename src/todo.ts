// This file defines our Todo domain type in TypeScript, and a related helper
// function to get all Todos. You'd typically have one of these files for each
// domain object in your application.

import { ReadTransaction } from "replicache";

export type WorkingWindow = {
  init: number;
  end: number;
}

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  sort: number;
  workingOnIt?: boolean;
  workingWindows?: WorkingWindow[];
  startedOn?: number;
  currentWorkingOn?: number;
};

export type TodoUpdate = Partial<Todo> & Pick<Todo, "id">;

export async function listTodos(tx: ReadTransaction) {
  return (await tx.scan().values().toArray()) as Todo[];
}
