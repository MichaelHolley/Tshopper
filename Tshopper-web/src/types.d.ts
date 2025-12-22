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

export interface LogEntry {
  timestamp: Date
  action: string
  details: string
  status: 'success' | 'error' | 'info'
  metadata?: Record<string, string | number | boolean>
}
