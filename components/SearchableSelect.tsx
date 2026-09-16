"use client";

import Select, { type StylesConfig } from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#d6d3d1" : "#e7e5e4",
    boxShadow: state.isFocused ? "0 0 0 4px #f5f5f4" : "none",
    backgroundColor: "#fff",
    "&:hover": { borderColor: "#d6d3d1" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
    maxHeight: 220,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    backgroundColor: state.isSelected
      ? "#292524"
      : state.isFocused
        ? "#f5f5f4"
        : "#fff",
    color: state.isSelected ? "#fff" : "#44403c",
    cursor: "pointer",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#a8a29e",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#44403c",
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    color: "#44403c",
    fontSize: "0.875rem",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

export default function SearchableSelect({
  label,
  value,
  options,
  disabled,
  placeholder = "اختر...",
  onChange,
}: SearchableSelectProps) {
  const selected =
    options.find((o) => o.value === value) ??
    options.find((o) => o.value === "") ??
    null;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-stone-400">{label}</span>
      <Select
        instanceId={`select-${label}`}
        isRtl
        isSearchable
        isDisabled={disabled}
        options={options}
        value={selected}
        placeholder={placeholder}
        noOptionsMessage={() => "لا توجد نتائج"}
        onChange={(opt) => onChange(opt?.value ?? "")}
        styles={selectStyles}
        classNames={{
          container: () => "text-sm",
        }}
      />
    </label>
  );
}
