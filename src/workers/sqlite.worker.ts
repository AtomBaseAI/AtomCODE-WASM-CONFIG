/**
 * SQLite worker — official SQLite compiled to WebAssembly (design doc §11).
 *
 * - The engine initializes once; a fresh in-memory database is created for
 *   every execution (doc: "Reset the database between independent attempts").
 * - The whole request body is a SQL script: schema/data statements followed
 *   by the student query. Rows of the first result-returning statement are
 *   returned as a structured grid (columns + rows) plus a deterministic text
 *   rendering on stdout for test-case comparison.
 * - SQLite is SQLite — not MySQL. The UI labels it as the SQLite dialect.
 */

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import type {
  RunRequest,
  RunResult,
  SqlQueryPayload,
  WorkerResponse,
} from "../lib/execution-types";

type SqlValue = string | number | bigint | null | Uint8Array;

type Db = {
  exec: (options: {
    sql: string;
    rowMode?: string;
    resultRows?: SqlValue[];
    columnNames?: string[];
  }) => void;
  changes: () => number;
  close: () => void;
};

let enginePromise: Promise<{ oo1: { DB: new (path: string, flags?: string) => Db } }> | null =
  null;

function getEngine() {
  enginePromise ??= sqlite3InitModule({
    // Serve the pinned wasm binary from this app's own origin (doc §15).
    locateFile: (file: string) =>
      new URL("/runtimes/sqlite-wasm/" + file, self.location.origin).href,
  }) as Promise<{ oo1: { DB: new (path: string, flags?: string) => Db } }>;
  return enginePromise;
}

function stringifyCell(cell: SqlValue): string | null {
  if (cell === null || cell === undefined) return null;
  if (cell instanceof Uint8Array) return "<blob>";
  return String(cell);
}

function renderGrid(payload: SqlQueryPayload): string {
  if (payload.columns.length === 0) return "";
  const lines: string[] = [];
  lines.push(payload.columns.join(" | "));
  lines.push(payload.columns.map(() => "---").join(" | "));
  for (const row of payload.rows) {
    lines.push(row.map((cell) => (cell === null ? "NULL" : String(cell))).join(" | "));
  }
  return lines.join("\n");
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const request = event.data;
  if (request.type !== "run") return;

  const started = performance.now();
  let db: Db | null = null;

  try {
    const sqlite3 = await getEngine();
    db = new sqlite3.oo1.DB(":memory:", "c");

    const columnNames: string[] = [];
    const resultRows: SqlValue[] = [];

    db.exec({
      sql: request.code,
      rowMode: "array",
      columnNames,
      resultRows,
    });

    const hasResultSet = columnNames.length > 0;
    const payload: SqlQueryPayload = {
      columns: hasResultSet ? [...columnNames] : [],
      rows: hasResultSet
        ? resultRows.map(
            (row) =>
              (Array.isArray(row) ? row : [row]).map(stringifyCell) as (
                | string
                | null
              )[]
          )
        : [],
      changes: db.changes(),
    };

    const response: RunResult = {
      type: "result",
      executionId: request.executionId,
      stdout: renderGrid(payload),
      stderr: "",
      executionTimeMs: performance.now() - started,
      exitCode: 0,
      sql: payload,
    };

    self.postMessage(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error) || "SQL error.";

    const response: WorkerResponse = {
      type: "error",
      executionId: request.executionId,
      message,
      stage: "execute",
    };
    self.postMessage(response);
  } finally {
    // Doc: reset the database between independent attempts.
    try {
      db?.close();
    } catch {
      // ignore close races
    }
  }
};
