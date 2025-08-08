
export const normalizeCorsican = (s: string) =>
  s.normalize('NFC')
    .replace(/[̀-ͯ]/g, '') // strip combining marks
    .toUpperCase()
