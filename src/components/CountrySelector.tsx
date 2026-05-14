import { CountryMeta } from "../types/greenfair";

interface CountrySelectorProps {
  countries: CountryMeta[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export function CountrySelector({ countries, value, onChange, multiple = false }: CountrySelectorProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {multiple ? "Sélection des pays" : "Sélection du pays"}
      </span>
      <select
        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none ring-0"
        multiple={multiple}
        size={multiple ? 5 : 1}
        value={value}
        onChange={(event) => {
          if (multiple) {
            onChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value));
            return;
          }
          onChange(event.currentTarget.value);
        }}
      >
        {countries.map((country) => (
          <option key={country.code} value={country.name}>
            {country.name}
          </option>
        ))}
      </select>
    </label>
  );
}
