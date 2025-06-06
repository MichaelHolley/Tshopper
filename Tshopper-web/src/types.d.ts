export interface ShoppingItem {
  id: number
  item: string
  quantity: string
  checked?: Date
}

export interface ItemFormState {
  item: string
  amount: string
}
