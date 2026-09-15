/**
 * UUID Validation and Sanitization Utility
 * Ensures non-UUID placeholder strings (like 'usr-admin' or 'test-user')
 * do not cause database-level UUID format parsing errors in PostgreSQL.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUuid = (value?: string | null): boolean => {
  if (!value || typeof value !== 'string') return false;
  return UUID_REGEX.test(value);
};

export const sanitizeUuid = (value?: string | null): string | undefined => {
  if (isValidUuid(value)) {
    return value as string;
  }
  return undefined;
};
