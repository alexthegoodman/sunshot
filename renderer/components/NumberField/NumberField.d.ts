export interface NumberFieldProps {
  label?: string;
  id?: string;
  value?: number;
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
}
