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

export interface Category {
  id: number
  name: string
}

export interface ItemCategory {
  id: number
  itemName: string
  includeItemName: boolean
  categoryId: number
  category: Category
}
