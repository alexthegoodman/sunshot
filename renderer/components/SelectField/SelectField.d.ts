export interface SelectFieldProps {
  items: any[];
  selectedItem: string;
  onItemSelect: (id: string) => void;
}
