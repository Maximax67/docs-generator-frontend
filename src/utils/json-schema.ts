import { JSONValue } from '@/types/json';

export const applyTitleFallbacks = (node: Record<string, JSONValue>): Record<string, JSONValue> => {
  const result: Record<string, JSONValue> = { ...node };

  if (!result.title && typeof result.description === 'string') {
    if (result.description) {
      result.title = result.description;
    }
    delete result.description;
  }

  if (node.properties && typeof node.properties === 'object') {
    const nestedProps: Record<string, JSONValue> = {};
    for (const [key, value] of Object.entries(node.properties as Record<string, JSONValue>)) {
      nestedProps[key] = applyTitleFallbacks(value as Record<string, JSONValue>);
    }
    result.properties = nestedProps;
  }

  if (node.items && typeof node.items === 'object' && !Array.isArray(node.items)) {
    result.items = applyTitleFallbacks(node.items as Record<string, JSONValue>);
  }

  return result;
};
