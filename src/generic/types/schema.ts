import type { schema } from '../schema';

export type Schema = typeof schema;

export type Tables = Schema['tables'];

export type Columns<Table extends keyof Tables = keyof Tables> =
  keyof Tables[Table]['columns'] & string;
