import {View, ScrollView, ToastAndroid, AppState} from 'react-native';
import React, {useState, useContext, createContext, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Button, fonts} from '@rneui/base';

import {
  setId,
  setWords,
  setHost,
  setHostUid,
  next,
  clear,
} from '../state/matchSlice';

import {TopInfo} from './HostRoom';
import PlayersTab from '../components/PlayersTab';
export const RoomContext = createContext();

const PlayerRoom = ({route, navigation}) => {
  const appState = useRef(AppState.currentState);
  const {id} = route.params;

  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();

  const [chat, setChat] = useState([]);
  const [waitPlayers, setWaitPlayers] = useState([]);
  const [waitPlayersUid, setWaitPlayersUid] = useState([]);

  const [toggleExit, setToggleExit] = useState(false);
  const [toggleCanc, setToggleCanc] = useState(false);

  const [loading, setLoading] = useState(true);

  const contextData = {route, chat, waitPlayers, waitPlayersUid, setLoading};

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clear());
      firestore()
        .collection('matches')
        .doc(id)
        .get()
        .then(doc => {
          dispatch(setId(doc.id));
          dispatch(setWords(doc._data.words));
          dispatch(setHost(doc._data.hostName));
          dispatch(setHostUid(doc._data.hostUid));

          firestore()
            .collection('matches')
            .doc(doc.id)
            .update({
              playersName: [
                ...doc._data.playersName,
                auth().currentUser.displayName,
              ],
              playersUid: [...doc._data.playersUid, auth().currentUser.uid],
            });

          firestore()
            .collection('matches')
            .doc(doc.id)
            .update({
              chat: [
                ...doc._data.chat,
                {
                  author: 'Mordle',
                  message: `${
                    auth().currentUser.displayName
                  } si e' unito alla partita!`,
                },
              ],
            });
          setLoading(false);
        })
        .catch(err => {
          console.log('ERR IN FETCH INIT DATA PLAYERROOM');
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
              if (data.canc) {
                setToggleCanc(true);
              } else {
                setChat(data.chat);
                setWaitPlayers(data.playersName);
                setWaitPlayersUid(data.playersUid);
                if (data.play == true && data.finish == false) {
                  firestore()
                    .collection('matches')
                    .doc(matchData.matchId)
                    .update({
                      scores: {
                        ...data.scores,
                        [auth().currentUser.uid]: {
                          scored: 0,
                          status: 'playing',
                          time: 0,
                        },
                      },
                    })
                    .then(() => {
                      navigation.navigate('Playboard');
                    });
                }
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

          firestore()
            .collection('matches')
            .doc(matchData.matchId)
            .get()
            .then(doc => {
              let tmpIndex;
              doc.data().playersUid.forEach((el, index) => {
                console.log(el);
                if (el == auth().currentUser.uid) {
                  tmpIndex = index;
                }
              });

              firestore()
                .collection('matches')
                .doc(matchData.matchId)
                .update({
                  playersUid: doc._data.playersUid.filter((val, index) => {
                    if (index != tmpIndex) {
                      return true;
                    } else {
                      return false;
                    }
                  }),
                  playersName: doc._data.playersName.filter(
                    (val, index) => index != tmpIndex,
                  ),
                })
                .then(() => {
                  navigation.dispatch(e.data.action);
                });
            });
        } else if (
          e.data.action.payload?.name == 'Search' &&
          e.data.action.type == 'REPLACE'
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
          <Text style={{color: 'black', fontSize: 16}}>
            Vuoi uscire dalla stanza?
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

        <Dialog isVisible={toggleCanc} animationType="fade">
          <Text style={{color: 'black', fontSize: 16}}>
            L'Host ha cancellato la partita.
          </Text>
          <Dialog.Actions>
            <Button
              type="clear"
              title="OK"
              onPress={() => {
                setToggleCanc(false);
                navigation.replace('Search');
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
          <PlayersTab RoomContext={RoomContext} />
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
        <Text
          h4
          h4Style={{fontSize: 25, color: 'gray'}}
          style={{textAlign: 'center', paddingBottom: 25}}>
          L'host fara' cominciare la partita...
        </Text>
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

export default PlayerRoom;
