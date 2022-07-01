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

const HostRoom = ({route, navigation}) => {
  const appState = useRef(AppState.currentState);

  const {pNum, wNum, wLen} = route.params;
  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();

  const [chat, setChat] = useState([]);
  const [waitPlayers, setWaitPlayers] = useState([]);

  const [startBtn, setStartBtn] = useState(true);

  const [loading, setLoading] = useState(true);

  const con = useContext(RoomContext);
  const contextData = {
    route,
    chat,
    waitPlayers,
    startBtn,
    navigation,
    setStartBtn,
    setLoading,
  };

  const [toggleExit, setToggleExit] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clear());
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
        ],
        hostUid: auth().currentUser.uid,
        hostName: auth().currentUser.displayName,
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

      firestore()
        .collection('matches')
        .add(toSend)
        .then(doc => {
          dispatch(setId(doc.id));
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
        });
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = firestore()
        .collection('matches')
        .doc(matchData.matchId)
        .onSnapshot(
          docSnapshot => {
            const data = docSnapshot.data();
            if (data) {
              setChat(data.chat);
              setWaitPlayers(data.playersName);
              if (data.playerNum == data.playersUid.length) {
                setStartBtn(false);
              } else {
                setStartBtn(true);
              }
            }
          },
          err => {
            console.log(err);
          },
        );
      return () => {
        subscribe();
      };
    }, [matchData.matchId]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = navigation.addListener('beforeRemove', e => {
        e.preventDefault();

        if (
          e.data.action.payload?.name == 'Homepage' &&
          e.data.action.type == 'NAVIGATE'
        ) {
          console.log('RUNNING');
          console.log(matchData.matchId);
          firestore()
            .collection('matches')
            .doc(matchData.matchId)
            .update({canc: true, wait: false, play: false})
            .then(() => {
              dispatch(clear());
              navigation.dispatch(e.data.action);
            })
            .catch(err => {
              console.log(err);
            });
        } else if (
          e.data.action.payload?.name == 'Playerboard' &&
          e.data.action.type == 'NAVIGATE'
        ) {
          navigation.dispatch(e.data.action);
        } else {
          setToggleExit(true);
        }
      });
      return () => {
        subscribe();
      };
    }, [matchData.matchId]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscription = AppState.addEventListener('change', next => {
        if (
          appState.current.match(/active/) &&
          (next === 'background' || next === 'inactive') &&
          matchData.matchId !== ''
        ) {
          console.log('exited');
          console.log(matchData.matchId);
          navigation.navigate('Homepage');
        }
      });
      return () => {
        subscription.remove();
      };
    }, [matchData.matchId]),
  );

  return (
    <>
      <View>
        <Dialog
          animationType="fade"
          isVisible={loading}
          overlayStyle={{
            backgroundColor: 'none',
            shadowColor: 'rgba(255, 255, 255, 0)',
          }}>
          <Dialog.Loading />
        </Dialog>
        <Dialog
          animationType="fade"
          isVisible={toggleExit}
          onBackdropPress={() => {
            setToggleExit(false);
          }}>
          <Dialog.Title title="ATTENZIONE" />
          <Text style={{color: 'black', fontSize: 16}}>
            Se esci dalla stanza, eliminerai la partita per tutti.
          </Text>
          <Dialog.Actions>
            <Button
              type="clear"
              title="ESCI"
              onPress={() => {
                setToggleExit(false);
                navigation.navigate('Homepage');
              }}
            />
            <Button
              type="clear"
              title="ANNULLA"
              onPress={() => {
                setToggleExit(false);
              }}
            />
          </Dialog.Actions>
        </Dialog>
        <TopInfo id={matchData.matchId} hostName={matchData.host} />
      </View>
      <RoomContext.Provider value={contextData}>
        <TabComponent />
      </RoomContext.Provider>
    </>
  );
};

export const TopInfo = ({id, hostName}) => {
  return (
    <View style={{paddingVertical: 20, paddingHorizontal: 10}}>
      <Text style={{color: 'black'}}>id partita: {id}</Text>
      <Text h3 style={{color: 'black'}}>
        Host: {hostName}
      </Text>
    </View>
  );
};

export const TabComponent = () => {
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
  const matchData = useSelector(state => state.match);
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
          disabled={con.startBtn}
          buttonStyle={{margin: 10}}
          title={con.startBtn ? 'Aspetto giocatori...' : 'Comincia la partita!'}
          color="success"
          onPress={() => {
            con.setLoading(true);
            firestore()
              .collection('matches')
              .doc(matchData.matchId)
              .update({
                scores: {
                  [auth().currentUser.uid]: {scored: 0, status: 'playing'},
                },
              })
              .then(() => {
                firestore()
                  .collection('matches')
                  .doc(matchData.matchId)
                  .update({wait: false, play: true})
                  .then(() => {
                    con.setLoading(false);
                    con.navigation.navigate('Playboard');
                    con.setStartBtn(true);
                  });
              });
          }}
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
