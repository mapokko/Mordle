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
    clear: state => {
      state.matchId = '';
      state.words = [];
      state.position = 0;
      state.host = '';
      hostUid = '';
      playerName = [];
    },
  },
});

export const {setId, setWords, setHostUid, setHost, addPlayer, next, clear} =
  matchSlice.actions;

export default matchSlice.reducer;
