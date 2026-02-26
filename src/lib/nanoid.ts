import { nanoid as _nanoid } from 'nanoid';

export function nanoid(size = 12): string {
  return _nanoid(size);
}
