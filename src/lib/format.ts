/** 1234567 → "1 234 567" (узкий неразрывный пробел, одинаково на сервере и клиенте) */
export function money(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
