// sessionSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  access_token: null,
  refesh_token: null
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action) {
      state.access_token = action.payload.access_token
      state.refesh_token = action.payload.refresh_token
    },
    clearSession(state) {
      state.access_token = null,
      state.refesh_token = null
    }
  }
})

export const { setSession, clearSession } = sessionSlice.actions
