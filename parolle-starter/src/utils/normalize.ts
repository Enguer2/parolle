export const toBase = (s: string) =>
  s.normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '') // retire les diacritiques
   .toUpperCase()
