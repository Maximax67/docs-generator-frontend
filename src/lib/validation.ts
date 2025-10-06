import { VariableType, DocumentVariable } from '@/types/variables';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateVariableValue(
  variable: DocumentVariable,
  value: string,
): string | undefined {
  if (variable.type === VariableType.CONSTANT) {
    return undefined;
  }

  if (!value.trim() && !variable.allow_skip) {
    return "Це поле обов'язкове";
  }

  if (!value.trim() && variable.allow_skip) {
    return undefined;
  }

  if (variable.type === VariableType.MULTICHOICE) {
    if (!variable.choices.includes(value)) {
      return 'Значення повинно бути одним з дозволених варіантів';
    }
    return undefined;
  }

  if (variable.type === VariableType.PLAIN) {
    for (const rule of variable.validation_rules) {
      if (!rule.is_valid) {
        return 'Невірний шаблон регулярного виразу';
      }

      try {
        const regex = new RegExp(rule.regex);
        if (!regex.test(value)) {
          return rule.error_message || 'Не валідне значення';
        }
      } catch {
        return 'Помилка обчислення регулярного виразу';
      }
    }
  }

  return undefined;
}

export function validateFormValues(
  variables: DocumentVariable[],
  values: Record<string, string>,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const variable of variables) {
    const value = values[variable.variable] || '';
    const error = validateVariableValue(variable, value);

    if (error) {
      errors[variable.variable] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function canSubmitForm(
  variables: DocumentVariable[],
  values: Record<string, string>,
): boolean {
  const validation = validateFormValues(variables, values);
  return validation.isValid;
}

export function hasVariablesToFill(variables: DocumentVariable[]): boolean {
  return variables.some((v) => v.type !== VariableType.CONSTANT);
}

export function getInitialFormValues(
  variables: DocumentVariable[],
  savedValues: Record<string, string> = {},
): Record<string, string> {
  const initialValues: Record<string, string> = {};

  for (const variable of variables) {
    if (variable.type === VariableType.CONSTANT) {
      continue;
    }

    if (savedValues[variable.variable]) {
      initialValues[variable.variable] = savedValues[variable.variable];
    } else {
      initialValues[variable.variable] = '';
    }
  }

  return initialValues;
}
