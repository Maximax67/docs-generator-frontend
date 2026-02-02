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

export interface SavedVariable {
  variable: string;
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

export interface VariableCompactResponse {
  id: string;
  scope: string | null;
  variable: string;
  value: JSONValue;
}

export interface VariableCompactResponse {
  id: string;
  scope: string | null;
  variable: string;
  value: JSONValue;
}

export interface VariableSchemaResponse {
  validation_schema: Record<string, JSONValue>;
  variables: VariableCompactResponse[];
}

export interface VariableCreate {
  variable: string;
  scope: string | null;
  value?: JSONValue;
  validation_schema?: Record<string, JSONValue> | null;
  required: boolean;
  allow_save: boolean;
}
