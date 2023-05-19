export interface SelectFieldProps {
  id?: string;
  label?: string;
  items: any[];
  selectedItem: string;
  onItemSelect: (id: string) => void;
}
