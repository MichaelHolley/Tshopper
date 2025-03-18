export interface ShoppingItem {
  id: number;
  item: string;
  quantity: number;
  checked: boolean;
}

export interface ItemFormState {
  item: string;
  amount: number;
}
