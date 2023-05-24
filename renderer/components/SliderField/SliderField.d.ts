export interface SliderFieldProps {
  label?: string;
  id?: string;
  value?: number;
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
}
