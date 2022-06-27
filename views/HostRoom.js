import {ToastAndroid, View, useWindowDimensions} from 'react-native';
import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Text, Tab, TabView} from '@rneui/themed';
import {Button, fonts} from '@rneui/base';

// import {TabView, SceneMap} from 'react-native-tab-view';

import {useFocusEffect} from '@react-navigation/native';

import {randomWords, valid} from '../helper/comms';
import {setId, setWords, setHost, next, clear} from '../state/matchSlice';

const HostRoom = ({route, navigation}) => {
  const {pNum, wNum, wLen} = route.params;
  const userData = useSelector(state => state.user);
  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      const words = randomWords(wLen, wNum);
      const initPLayers = [];
      initPLayers.push(auth().currentUser.uid);
      const toSend = {
        wait: true,
        play: false,
        finish: false,
        canc: false,
        host: auth().currentUser.uid,
        playerNum: pNum,
        words: words,
        players: initPLayers,
        scores: {},
      };

      dispatch(setWords(toSend.words));
      dispatch(setHost(auth().currentUser.displayName));
      dispatch(setId('ABCD1234'));
      // firestore()
      //   .collection('matches')
      //   .add(toSend)
      //   .then(doc => {
      //     dispatch(setId(doc.id));
      //     ToastAndroid.show('Match created!', ToastAndroid.LONG);
      //   });
    }, []),
  );

  return (
    <>
      <View>
        <TopInfo id={matchData.matchId} hostName={matchData.host} />
        <Button
          buttonStyle={{marginBottom: 15}}
          title="show"
          onPress={() => {
            console.log(matchData);
          }}
        />
      </View>
      <TabComponent />
    </>
  );
};

const TopInfo = ({id, hostName}) => {
  return (
    <View style={{paddingVertical: 20, paddingHorizontal: 10}}>
      <Text style={{color: 'black'}}>id partita: {id}</Text>
      <Text h3 style={{color: 'black'}}>
        Host: {hostName}
      </Text>
    </View>
  );
};

const TabComponent = () => {
  const [index, setIndex] = useState(0);

  return (
    <>
      <Tab
        value={index}
        onChange={e => setIndex(e)}
        indicatorStyle={{
          backgroundColor: 'white',
          height: 3,
        }}
        variant="primary">
        <Tab.Item title="Partita" titleStyle={{fontSize: 17}} />
        <Tab.Item title="Chat" titleStyle={{fontSize: 17}} />
        <Tab.Item title="Giocatori" titleStyle={{fontSize: 17}} />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={{backgroundColor: 'red', width: '100%'}}>
          <Text h1>Recent</Text>
        </TabView.Item>
        <TabView.Item style={{backgroundColor: 'blue', width: '100%'}}>
          <Text h1>Favorite</Text>
        </TabView.Item>
        <TabView.Item style={{backgroundColor: 'green', width: '100%'}}>
          <Text h1>Cart</Text>
        </TabView.Item>
      </TabView>
    </>
  );
};

export default HostRoom;
