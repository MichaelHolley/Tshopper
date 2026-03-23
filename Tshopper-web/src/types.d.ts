export interface Store {
  id: number
  name: string
  color: string
}

export interface ShoppingItem {
  id: number
  item: string
  quantity: string
  checked?: Date
  sortOrder: number
  storeId?: number | null
}

export interface ItemFormState {
  item: string
  quantity: string
}

export interface Category {
  id: number
  name: string
}
