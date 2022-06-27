import {ToastAndroid, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Text} from '@rneui/themed';

import {useFocusEffect} from '@react-navigation/native';

import {randomWords, valid} from '../helper/comms';

const HostRoom = ({route, navigation}) => {
  const {pNum, wNum, wLen} = route.params;
  const userData = useSelector(state => state.user);

  useFocusEffect(
    React.useCallback(() => {
      const words = randomWords(wLen, wNum);
      const initPLayers = [];
      initPLayers.push(auth().currentUser.uid);
      const toSend = {
        wait: true,
        play: false,
        finish: false,
        host: auth().currentUser.uid,
        playerNum: pNum,
        words: words,
        players: initPLayers,
        scores: {},
      };
      console.log(toSend);

      firestore()
        .collection('matches')
        .add(toSend)
        .then(() => {
          ToastAndroid.show('Match created!', ToastAndroid.LONG);
        });
    }),
  );

  return (
    <View>
      <Text style={{fontSize: 20}}>{pNum}</Text>
      <Text style={{fontSize: 20}}>{wNum}</Text>
      <Text style={{fontSize: 20}}>{wLen}</Text>
    </View>
  );
};

export default HostRoom;
