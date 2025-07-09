// sessionSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: null
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action) {
      state.token = action.payload.token
    },
    clearSession(state) {
      state.token = null
    }
  }
})

export const { setSession, clearSession } = sessionSlice.actions
