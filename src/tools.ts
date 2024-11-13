export function transformKeysToCamelCase(obj: any) {
  const newObj: any = {};

  for (const key in obj) {
    // Convert snake_case to camelCase
    const camelCaseKey = key.replace(/_([a-z])/g, (match) => match[1].toUpperCase());
    newObj[camelCaseKey] = obj[key];
  }
  return newObj;
}

export function transformKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[snakeKey] = obj[key];
  }
  return newObj;
}