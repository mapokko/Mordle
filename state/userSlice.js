import {createSlice} from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: '',
    mail: '',
    uid: '',
    token: '',
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setMailState: (state, action) => {
      state.mail = action.payload;
    },
    setUid: (state, action) => {
      state.uid = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    clear: state => {
      state.username = '';
      state.mail = '';
      state.uid = '';
      state.token = '';
    },
  },
});

// Action creators are generated for each case reducer function
export const {setUsername, setMailState, setUid, clear, setToken} =
  userSlice.actions;

export default userSlice.reducer;
