import { JSONValue } from "./json";

export interface DocumentVariableInfo {
  variable: string;
  in_database: boolean;
  value: JSONValue;
  validation_schema: Record<string, JSONValue> | null;
  required: boolean;
  allow_save: boolean;
  scope: string | null;
  saved_value: JSONValue;
}

export interface DocumentVariablesResponse {
  template_variables: string[];
  variables: DocumentVariableInfo[];
}

export interface DocumentDetails {
  file: {
    id: string;
    name: string;
    mime_type: string;
    modified_time: string;
    created_time: string;
    size?: number;
    web_view_link?: string;
  };
  variables: DocumentVariablesResponse;
}

export interface VariableSchemaUpdateRequest {
  schema: Record<string, JSONValue>;
}

export interface AllVariablesResponse {
  variables: DocumentVariableInfo[];
}

export interface SavedVariable {
  variable: string;
  value: JSONValue;
  created_at: string;
  updated_at: string;
}
