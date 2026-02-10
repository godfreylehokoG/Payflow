import Input from "@/components/ui/Input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
};

export default function AmountInput({
  value,
  onChange,
  label,
  placeholder,
  error,
}: Props) {
  return (
    <Input
      label={label}
      placeholder={placeholder || "R 0.00"}
      value={value}
      inputMode="decimal"
      error={error}
      onChange={(event) => {
        const cleaned = event.target.value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        onChange(cleaned);
      }}
    />
  );
}
