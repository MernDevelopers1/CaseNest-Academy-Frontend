import { getNames, registerLocale } from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import type { SelectOption } from "/src/components/ui/Select";

registerLocale(enLocale);

// Alpha-2 code (matches CountryValue elsewhere in this app, e.g. the
// admin dashboard's country map) + full name, sorted for a Select.
export const COUNTRY_OPTIONS: SelectOption[] = Object.entries(getNames("en"))
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function countryNameFor(value: string | null | undefined): string | null {
  if (!value) return null;
  return COUNTRY_OPTIONS.find((option) => option.value === value)?.label ?? null;
}
