/** Validates an Iranian national code (کد ملی) including its check digit. */
export function isValidNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false; // 0000000000, 1111111111, …

  const check = Number(code[9]);
  const sum = code
    .slice(0, 9)
    .split("")
    .reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0);
  const remainder = sum % 11;

  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

/**
 * Economic code (کد اقتصادی): for individuals it is the 10-digit national code,
 * for companies the 11-digit national ID; older codes are 12 digits.
 */
export function isValidEconomicCode(code: string): boolean {
  return /^\d{10,12}$/.test(code);
}
