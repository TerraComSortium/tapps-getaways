//XSS prevent validation
export const sanitizeInput = (input: string) => {
  if (!input) return '';
  return input.replace(/[<>]/g, '').trim();
};