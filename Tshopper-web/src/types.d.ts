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

export interface ChatImagePreview {
  // Full data URI used for the local thumbnail.
  url: string
  mediaType: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  // Local-only preview of images sent with a user turn. Never round-tripped to the API.
  imagePreviews?: ChatImagePreview[]
}

// Image staged for upload with the next chat turn.
export interface ChatImageAttachment {
  // Stable client id used as a list key.
  id: string
  mediaType: string
  // Raw base64 (no data-URI prefix) sent to the API.
  data: string
  // Full data URI used for the local thumbnail preview.
  previewUrl: string
}
