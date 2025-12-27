export interface ShoppingItem {
  id: number
  item: string
  quantity: string
  checked?: Date
  sortOrder: number
}

export interface ItemFormState {
  item: string
  quantity: string
}

export interface Category {
  id: number
  name: string
}
