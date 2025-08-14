import { create } from 'zustand'
import { PlaceOption } from './google'

interface WheelState {
  // Selected restaurant options
  selectedOptions: PlaceOption[]
  
  // Current winner from spin
  winner: PlaceOption | null
  
  // Search filters
  filters: {
    locationText: string
    lat?: number
    lng?: number
    radiusMiles: number
    cuisine: string
    price: number
    priceRanges: number[]
  }
  
  // Actions
  setSelectedOptions: (options: PlaceOption[]) => void
  addOption: (option: PlaceOption) => void
  removeOption: (placeId: string) => void
  clearOptions: () => void
  setWinner: (winner: PlaceOption | null) => void
  setFilters: (filters: Partial<WheelState['filters']>) => void
  resetFilters: () => void
}

export const useWheelStore = create<WheelState>((set, get) => ({
  // Initial state
  selectedOptions: [],
  winner: null,
  filters: {
    locationText: '',
    lat: undefined,
    lng: undefined,
    radiusMiles: 10,
    cuisine: 'any',
    price: 0,
    priceRanges: [],
  },

  // Actions
  setSelectedOptions: (options) => set({ selectedOptions: options }),
  
  addOption: (option) => {
    const { selectedOptions } = get()
    const exists = selectedOptions.some(existing => existing.place_id === option.place_id)
    if (!exists) {
      set({ selectedOptions: [...selectedOptions, option] })
    }
  },
  
  removeOption: (placeId) => {
    const { selectedOptions } = get()
    set({ 
      selectedOptions: selectedOptions.filter(option => option.place_id !== placeId),
      // Clear winner if the removed option was the winner
      winner: get().winner?.place_id === placeId ? null : get().winner
    })
  },
  
  clearOptions: () => set({ selectedOptions: [], winner: null }),
  
  setWinner: (winner) => set({ winner }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  resetFilters: () => set({
    filters: {
      locationText: '',
      lat: undefined,
      lng: undefined,
      radiusMiles: 10,
      cuisine: 'any',
      price: 0,
      priceRanges: [],
    }
  }),
}))
