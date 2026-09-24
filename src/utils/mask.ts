/**
 * Oculta un identificador dejando visibles solo los últimos `visible` caracteres.
 * Los guiones se conservan para que mantenga su forma:
 *   8d7b975a-c5fb-4ade-a33d-64b9b51269fd → ********-****-****-****-******1269fd
 */
export const maskId = (value: string | null | undefined, visible = 6): string => {
  if (!value) return '';
  const chars = value.split('');
  let kept = 0;
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    if (chars[i] === '-') continue;
    if (kept < visible) kept += 1;
    else chars[i] = '*';
  }
  return chars.join('');
};
