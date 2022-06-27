import {createSlice} from '@reduxjs/toolkit';

export const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matchId: '',
    words: [],
    position: 0,
    host: '',
  },
  reducers: {
    setId: (state, action) => {
      state.matchId = action.payload;
    },
    setWords: (state, action) => {
      state.words = action.payload;
    },
    setHost: (state, action) => {
      state.host = action.payload;
    },
    next: state => {
      state.position = state.position + 1;
    },
    clear: state => {
      state.matchId = '';
      state.words = [];
      state.position = 0;
      state.host = '';
    },
  },
});

export const {setId, setWords, setHost, next, clear} = matchSlice.actions;

export default matchSlice.reducer;
