import { VariableInfo } from "@/types/variables";

export function filterOverriddenVariables(
  variables: VariableInfo[]
): VariableInfo[] {
  const overriddenIds = new Set<string>();

  for (const variable of variables) {
    for (const override of variable.overrides) {
      overriddenIds.add(override.id);
    }
  }

  return variables.filter(variable => !overriddenIds.has(variable.id));
}
