import { JSONValue } from './json';

export interface VariableOverride {
  id: string;
  scope: string | null;
}

export interface VariableInfo {
  id: string;
  variable: string;
  value: JSONValue;
  validation_schema: Record<string, JSONValue> | null;
  required: boolean;
  allow_save: boolean;
  scope: string | null;
  saved_value: JSONValue;
  override: VariableOverride[];
}

export interface SavedVariable {
  user: string;
  variable: VariableInfo;
  value: JSONValue;
  created_at: string;
  updated_at: string;
}

export interface ValidateVariableRequest {
  value: JSONValue;
}

export interface ValidateVariableResponse {
  detail: string;
  errors?: string[];
}

export interface VariableSchemaResponse {
  validation_schema: Record<string, JSONValue>;
  variables: VariableInfo[];
}

export interface VariableCreate {
  variable: string;
  scope: string | null;
  value?: JSONValue;
  validation_schema?: Record<string, JSONValue> | null;
  required: boolean;
  allow_save: boolean;
}

export interface VariableUpdate {
  variable?: string;
  scope?: string | null;
  value?: JSONValue;
  validation_schema?: Record<string, JSONValue> | null;
  required?: boolean;
  allow_save?: boolean;
}

export interface SaveVariableEntry {
  id: string;
  value: JSONValue;
}
