export enum VariableType {
  PLAIN = 'plain',
  MULTICHOICE = 'multichoice',
  CONSTANT = 'constant',
}

export interface ValidationRule {
  name: string;
  regex: string;
  error_message?: string;
  is_valid: boolean;
}

export interface BaseVariable {
  variable: string;
  name: string;
  allow_skip: boolean;
  allow_save: boolean;
  type: VariableType;
}

export interface PlainVariable extends BaseVariable {
  type: VariableType.PLAIN;
  validation_rules: ValidationRule[];
  example?: string;
}

export interface MultichoiceVariable extends BaseVariable {
  type: VariableType.MULTICHOICE;
  choices: string[];
}

export interface ConstantVariable extends BaseVariable {
  type: VariableType.CONSTANT;
  value: string;
}

export type DocumentVariable = PlainVariable | MultichoiceVariable | ConstantVariable;

export interface DocumentVariables {
  variables: DocumentVariable[];
  unknown_variables: string[];
  is_valid: boolean;
}

export interface AllVariablesResponse {
  variables: DocumentVariable[];
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
  variables: DocumentVariable[];
  unknown_variables: string[];
  is_valid: boolean;
}

export interface ValidationErrors {
  errors: Record<string, string>;
  is_valid: boolean;
}

export interface GenerateDocumentRequest {
  variables: Record<string, string>;
}

export interface SavedVariable {
  variable: string;
  value: string;
  created_at: string;
  updated_at: string;
}
