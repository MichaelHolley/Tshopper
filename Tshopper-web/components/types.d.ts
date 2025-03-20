export interface ShoppingItem {
  id: number;
  item: string;
  quantity: number;
  checked?: Date;
}

export interface ItemFormState {
  item: string;
  amount: number;
}
