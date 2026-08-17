// src/utils/levantineDate.js
/**
 * Formats a date with Levantine/Syriac Arabic month names (as used in
 * Lebanon and Bilad al-Sham), e.g. "17 آب 2026" instead of the standard
 * Arabic "17 أغسطس 2026". Intl/ICU has no Levantine locale, so
 * toLocaleDateString('ar'/'ar-SA', { month: 'long' }) always produces the
 * standard-Arabic month name — this helper substitutes it manually while
 * keeping day/year formatting exactly as it already was.
 */

const LEVANTINE_MONTHS = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول",
];

export const formatLevantineDate = (dateInput) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("ar-SA", { day: "numeric" });
  const year = d.toLocaleDateString("ar-SA", { year: "numeric" });
  return `${day} ${LEVANTINE_MONTHS[d.getMonth()]} ${year}`;
};
