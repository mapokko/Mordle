import {createSlice} from '@reduxjs/toolkit';

export const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matchId: '',
    words: [],
    position: 0,
  },
  reducers: {
    setId: (state, action) => {
      state.matchId = action.payload;
    },
    setWords: (state, action) => {
      action.payload.forEach(el => {
        state.words.push(el);
      });
    },
    next: state => {
      state.position = state.position + 1;
    },
    clear: state => {
      state.matchId = '';
      state.words = [];
      state.position = 0;
    },
  },
});

export const {setId, setWords, next, clear} = matchSlice.actions;

export default matchSlice.reducer;
