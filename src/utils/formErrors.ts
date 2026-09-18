import type { FieldErrors } from 'react-hook-form';

/**
 * Recorre el objeto de errores de react-hook-form y devuelve las rutas de los
 * campos que fallaron ("title", "lodgingOptions.0.price", ...). Es recursivo
 * porque los field arrays anidan objetos y arrays.
 */
export const collectErrorNames = (errors: FieldErrors, prefix = ''): string[] => {
  if (!errors || typeof errors !== 'object') return [];

  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value) return [];
    const path = prefix ? `${prefix}.${key}` : key;

    // Nodo hoja: react-hook-form marca el error con `type` y/o `message`.
    if (typeof value === 'object' && ('type' in value || 'message' in value)) {
      return [path];
    }
    return collectErrorNames(value as FieldErrors, path);
  });
};

/**
 * Lleva al usuario al PRIMER campo con error tal como aparece en pantalla, no
 * en el orden del objeto de errores (que sigue el de registro, no el visual).
 * Devuelve el nombre del campo al que saltó, o null si no encontró ninguno.
 */
export const scrollToFirstError = (errors: FieldErrors): string | null => {
  const names = collectErrorNames(errors);
  if (names.length === 0) return null;

  const found = names
    .map((name) => ({
      name,
      // Los inputs de MUI reciben el `name` al hacer {...field} del Controller.
      element: document.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`),
    }))
    .filter((entry): entry is { name: string; element: HTMLElement } => !!entry.element);

  if (found.length === 0) return null;

  // Orden visual: el que aparece antes en el documento gana.
  const first = found.reduce((earliest, candidate) => {
    const position = earliest.element.compareDocumentPosition(candidate.element);
    return position & Node.DOCUMENT_POSITION_PRECEDING ? candidate : earliest;
  });

  first.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // preventScroll: el scroll suave ya está en marcha, el focus no debe saltarlo
  first.element.focus({ preventScroll: true });

  return first.name;
};
