export const MAX_FIELD_LENGTH = 6000;

export function requireFields(body, fields) {
  return fields.filter(f => !body?.[f] || !String(body[f]).trim());
}

export function findOversizedField(body, fields) {
  return fields.find(f => typeof body?.[f] === 'string' && body[f].length > MAX_FIELD_LENGTH);
}
