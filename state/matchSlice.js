import {createSlice} from '@reduxjs/toolkit';

export const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matchId: '',
    words: [],
    position: 0,
    host: '',
    hostUid: '',
    playerName: [],
    scored: 0,
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
    setHostUid: (state, action) => {
      state.hostUid = action.payload;
    },
    addPlayer: (state, action) => {
      state.playerName.push(action.payload);
    },
    next: state => {
      state.position = state.position + 1;
    },
    incScore: state => {
      state.scored = state.scored + 1;
    },
    clear: state => {
      state.matchId = '';
      state.words = [];
      state.position = 0;
      state.host = '';
      state.hostUid = '';
      state.playerName = [];
      state.scored = 0;
    },
  },
});

export const {
  setId,
  setWords,
  setHostUid,
  setHost,
  addPlayer,
  next,
  clear,
  incScore,
} = matchSlice.actions;

export default matchSlice.reducer;
