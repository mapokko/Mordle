import {
  ToastAndroid,
  View,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import React, {useState, useContext, createContext, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Input, Text, Tab, TabView, Icon} from '@rneui/themed';
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

const HostRoom = ({route, navigation}) => {
  const {pNum, wNum, wLen} = route.params;
  const userData = useSelector(state => state.user);
  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();

  const [chat, setChat] = useState([]);
  const [waitPlayers, setWaitPlayers] = useState([]);

  const con = useContext(RoomContext);
  const contextData = {route, chat, waitPlayers};

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
        chat: [
          {
            author: 'Mordle',
            message: 'Benvenuto nella chat!',
          },
          {
            author: 'fabio',
            message: 'Ciao',
          },
          {
            author: 'dio',
            message: 'Ciao anche a te',
          },
        ],
        host: auth().currentUser.uid,
        playerNum: pNum,
        words: words,
        playersUid: initPLayers,
        playersName: [auth().currentUser.displayName],
        scores: {},
      };

      dispatch(setWords(toSend.words));
      dispatch(setHost(auth().currentUser.displayName));
      dispatch(setHostUid(auth().currentUser.uid));
      // dispatch(setId('ABCD1234'));
      setChat(toSend.chat);

      try {
        firestore()
          .collection('matches')
          .add(toSend)
          .then(doc => {
            dispatch(setId(doc.id));
            ToastAndroid.show('Match created!', ToastAndroid.LONG);
          });
      } catch (error) {
        console.log(error);
      }
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = firestore()
        .collection('matches')
        .doc(matchData.matchId)
        .onSnapshot(docSnapshot => {
          const data = docSnapshot.data();
          if (data) {
            setChat(data.chat);
            setWaitPlayers(data.playersName);
          }
        });
      return subscribe;
    }, [matchData.matchId]),
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
      <RoomContext.Provider value={contextData}>
        <TabComponent />
      </RoomContext.Provider>
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
        <TabView.Item style={{width: '100%'}}>
          <MatchTab />
        </TabView.Item>
        <TabView.Item style={{width: '100%'}}>
          <ChatTab />
        </TabView.Item>
        <TabView.Item style={{width: '100%'}}>
          <PlayersTab />
        </TabView.Item>
      </TabView>
    </>
  );
};

const MatchTab = () => {
  const con = useContext(RoomContext);
  return (
    <View
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
      <View style={{padding: 15}}>
        <Text h4 style={{marginBottom: 5}}>
          Informazioni sulla partita
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          Numero giocatori: {con.route.params.pNum}
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          Numero Parole: {con.route.params.wNum}
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          Lunghezza Parole: {con.route.params.wLen}
        </Text>

        <Text h4 style={{marginBottom: 5, marginTop: 15}}>
          Sala d'attesa
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          giocatori in attesa: {con.waitPlayers.length}
        </Text>
      </View>

      <View>
        <Button
          disabled={true}
          buttonStyle={{margin: 10}}
          title="Aspetto giocatori..."
          color="success"
        />
      </View>
    </View>
  );
};

const ChatTab = () => {
  const scrollViewRef = useRef();
  const con = useContext(RoomContext);
  const [msg, setMsg] = useState('');
  const matchData = useSelector(state => state.match);

  const sendMsg = () => {
    if (msg.length > 0) {
      console.log('msg: ', msg);
      const toSend = {
        author: auth().currentUser.displayName,
        message: msg,
      };

      firestore()
        .collection('matches')
        .doc(matchData.matchId)
        .update({
          chat: [...con.chat, toSend],
        })
        .catch(error => {
          console.log(error);
        });
      setMsg('');
    }
  };
  return (
    <View
      style={{
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
      }}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: 10}}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({animated: true})
        }>
        {con.chat.length > 0 ? (
          con.chat.map((item, index) => {
            return (
              <View key={index}>
                <Text style={{color: 'black', fontSize: 19}}>
                  <Text
                    style={[
                      {fontWeight: 'bold'},
                      item.author == 'Mordle' && {color: 'green'},
                    ]}>
                    {item.author}
                  </Text>
                  : {item.message}
                </Text>
              </View>
            );
          })
        ) : (
          <></>
        )}
      </ScrollView>
      <View
        style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <Input
          placeholder="Messaggio"
          value={msg}
          onChangeText={text => setMsg(text)}
          rightIcon={
            <Icon
              name="sc-telegram"
              type="evilicon"
              iconStyle={{fontSize: 45}}
              containerStyle={{borderRadius: 100}}
              onPress={() => {
                sendMsg();
              }}
            />
          }
          inputContainerStyle={{
            borderBottomColor: 'grey',
            borderWidth: 2,
            borderRadius: 30,
          }}
        />
      </View>
    </View>
  );
};

const PlayersTab = () => {
  const con = useContext(RoomContext);
  return (
    <ScrollView>
      {con.waitPlayers.length > 0 ? (
        con.waitPlayers.map((item, index) => {
          return (
            <Text
              key={index}
              style={{
                fontSize: 20,
                paddingLeft: 10,
                paddingVertical: 10,

                borderBottomColor: 'grey',
                borderBottomWidth: 1,
              }}>
              {item}
            </Text>
          );
        })
      ) : (
        <></>
      )}
    </ScrollView>
  );
};

export default HostRoom;
