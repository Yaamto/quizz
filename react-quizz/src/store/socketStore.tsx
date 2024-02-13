
import { create } from 'zustand'

const useStore = create((set) => ({
    socket: null,
    updateSocket: (socket: any) => set({ socket: socket }),
  }))

export default useStore