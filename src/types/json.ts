export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | { [key: string]: JSONValue } | JSONValue[];
