/** Converts a non-negative integer to Persian words, e.g. 1250 → «یک هزار و دویست و پنجاه». */
const ones = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const teens = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const tens = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const scales = ["", "هزار", "میلیون", "میلیارد", "هزار میلیارد", "میلیون میلیارد"];

function belowThousand(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(hundreds[h]);
  if (rest >= 10 && rest < 20) parts.push(teens[rest - 10]);
  else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t) parts.push(tens[t]);
    if (o) parts.push(ones[o]);
  }
  return parts.join(" و ");
}

export function numberToPersianWords(value: bigint | number | string): string {
  let n = BigInt(value);
  if (n === BigInt(0)) return "صفر";
  if (n < BigInt(0)) return "منفی " + numberToPersianWords(-n);

  const groups: string[] = [];
  let scale = 0;
  const thousand = BigInt(1000);
  while (n > BigInt(0)) {
    const chunk = Number(n % thousand);
    if (chunk) groups.unshift([belowThousand(chunk), scales[scale]].filter(Boolean).join(" "));
    n /= thousand;
    scale++;
  }
  return groups.join(" و ");
}
