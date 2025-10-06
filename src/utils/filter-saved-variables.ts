import { DocumentVariable } from '@/types/variables';

export function filterSavedVariables(
  vars: Record<string, string>,
  allVars: Record<string, DocumentVariable>,
) {
  const existingSavedVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    const variable = allVars[key];
    if (variable && variable.allow_save) {
      existingSavedVars[key] = value;
    }
  }

  return existingSavedVars;
}
