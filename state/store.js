import {configureStore} from '@reduxjs/toolkit';
import userSlice from './userSlice';
import matchSlice from './matchSlice';

export default configureStore({
  reducer: {
    user: userSlice,
    match: matchSlice,
  },
});
