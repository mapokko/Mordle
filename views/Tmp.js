import {ToastAndroid, View, ScrollView, AppState} from 'react-native';
import React, {useState, useContext, createContext, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Button, fonts} from '@rneui/base';

// import {TabView, SceneMap} from 'react-native-tab-view';

import {useFocusEffect} from '@react-navigation/native';

import {randomWords, valid} from '../helper/comms';
import {
  setId,
  setWords,
  setHost,
  setHostUid,
  next,
  clear,
} from '../state/matchSlice';

const RoomContext = createContext();

const Tmp = ({navigation}) => {
  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clear());
      firestore()
        .collection('matches')
        .doc('24zA1H5bj8LvzVHgt6G2')
        .get()
        .then(doc => {
          dispatch(setId(doc.id));
          dispatch(setWords(doc.data().words));
          dispatch(setHost(doc.data().hostName));
          dispatch(setHostUid(doc.data().hostUid));
        });
    }, []),
  );
  return (
    <View>
      <Button
        title="ss"
        onPress={() => {
          console.log(matchData);
        }}
      />
      <Button
        title="nav"
        onPress={() => {
          navigation.navigate('Ending');
        }}
      />
      <Text>Tmp</Text>
    </View>
  );
};

export default Tmp;
