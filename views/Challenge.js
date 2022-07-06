import {View, ScrollView, Keyboard, ToastAndroid} from 'react-native';
import React, {useState, useContext, createContext, useReducer} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Card} from '@rneui/themed';
import {fonts} from '@rneui/base';
import {
  Button,
  Input,
  Box,
  WarningOutlineIcon,
  FormControl,
  Slider,
} from 'native-base';

import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import Loading from '../components/Loading';
import {randomWords} from '../helper/comms';
import {template} from '@babel/core';

const LocalContext = createContext();

const initState = {
  from: '',
  to: '',
  result: 'none',
  time: 3,
  word: '',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setPlayers':
      return {...state, to: action.payload.to, from: action.payload.from};
      break;
    case 'setTime':
      return {...state, time: action.payload};
      break;
    case 'setWord':
      return {...state, word: action.payload};
      break;

    case 'clear':
      return {...initState};
      break;
  }
};

const Challenge = ({route, navigation}) => {
  const [index, setIndex] = useState(route.params.tab);
  const [loading, setLoading] = useState(false);
  const [receivedChall, setReceivedChall] = useState([]);
  const [sentChall, setSentChall] = useState([]);
  const [realUid, setRealUid] = useState('');
  const [friends, setFriends] = useState([]);
  const [addState, dispatchLocal] = useReducer(reducer, initState);
  const [showAdd, setShowAdd] = useState(false);
  const [invalidAdd, setInvalidAdd] = useState(false);
  const [randomWord, setRandomWord] = useState('');

  const con = {
    receivedChall,
    sentChall,
    realUid,
    friends,
    dispatchLocal,
    setShowAdd,
    navigation,
  };

  const [tmp, setTmp] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setFriends([]);
      firestore()
        .collection('users')
        .where('uid', '==', auth().currentUser.uid)
        .get()
        .then(qs => {
          setRealUid(qs.docs[0].id);
          setFriends(qs.docs[0].data().friends);
          console.log('realUid set!!');
        })
        .catch(err => {
          console.log('failed to retrive realUid');
          console.log(err);
        });
      return () => {
        setFriends([]);
      };
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (realUid == '') {
        return;
      }
      setReceivedChall([]);
      setSentChall([]);
      setLoading(true);

      const unsub1 = firestore()
        .collection('challenges')
        .where('to', '==', realUid)
        .onSnapshot(
          qs => {
            let promises = [];
            let tmp = [];
            setReceivedChall([]);
            for (let i = qs.docs.length - 1; i >= 0; i--) {
              const prom = firestore()
                .collection('users')
                .doc(qs.docs[i].data().from)
                .get()
                .then(query => {
                  tmp.push({challenge: qs.docs[i], player: query});
                  // setReceivedChall(curr => {
                  //   return [...curr, {challenge: qs.docs[i], player: query}];
                  // });
                });
              promises.push(prom);
            }
            Promise.all(promises).then(values => {
              setReceivedChall(tmp);
              setLoading(false);
            });
          },
          err => {
            ToastAndroid.show('Sfide mandate non trovate..', ToastAndroid.LONG);
            console.log(err);
            setLoading(false);
          },
        );

      const unsub2 = firestore()
        .collection('challenges')
        .where('from', '==', realUid)
        .onSnapshot(
          qs => {
            setSentChall([]);
            const promises = [];
            const tmp = [];
            for (let i = qs.docs.length - 1; i >= 0; i--) {
              const prom = firestore()
                .collection('users')
                .doc(qs.docs[i].data().to)
                .get()
                .then(query => {
                  tmp.push({challenge: qs.docs[i], player: query});
                  // setSentChall(curr => {
                  //   return [...curr, {challenge: qs.docs[i], player: query}];
                  // });
                });
              promises.push(prom);
            }
            Promise.all(promises).then(() => {
              setSentChall(tmp);
            });
          },
          err => {
            ToastAndroid.show('Sfide mandate non trovate..', ToastAndroid.LONG);
            console.log(err);
            setLoading(false);
          },
        );

      return () => {
        console.log('removing stuff');
        setReceivedChall([]);
        setSentChall([]);
        unsub1();
        unsub2();
      };
    }, [realUid]),
  );

  //function that checks that string contains only letters
  const checkWord = str => {
    return (
      /^[a-zA-Z]+$/.test(str) &&
      (str.length == 4 || str.length == 5 || str.length == 6)
    );
  };

  return (
    <>
      <Dialog
        isVisible={showAdd}
        animationType="fade"
        onBackdropPress={() => {
          setShowAdd(false);
        }}
        onShow={() => {
          setRandomWord(randomWords(5, 1)[0]);
        }}
        onDismiss={() => {
          dispatchLocal({type: 'clear'});
        }}>
        <FormControl isInvalid={invalidAdd}>
          <FormControl.Label>Parola</FormControl.Label>
          <Input
            placeholder={randomWord}
            size="lg"
            value={addState.word}
            onChangeText={txt => {
              dispatchLocal({type: 'setWord', payload: txt});
            }}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            La parola deve essere da 4, 5 o 6 lettere e con solo lettere!
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl mt="3">
          <FormControl.Label>Minuti: {addState.time}</FormControl.Label>
          <Slider
            defaultValue={addState?.time}
            minValue={3}
            maxValue={15}
            step={1}
            onChangeEnd={v => {
              dispatchLocal({type: 'setTime', payload: v});
            }}>
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
          <Button
            mt="2"
            _text={{fontSize: 17}}
            onPress={() => {
              Keyboard.dismiss();
              if (!checkWord(addState.word)) {
                setInvalidAdd(true);
                setTimeout(() => {
                  setInvalidAdd(false);
                }, 5000);
                console.log('qui1');
                return;
              }
              setLoading(true);
              const seconds = addState.time * 60;
              const word = addState.word.toLowerCase();
              firestore()
                .collection('challenges')
                .add({...addState, time: seconds, word: word})
                .then(() => {
                  setLoading(false);
                  setShowAdd(false);
                  ToastAndroid.show('Sfida lanciata!', ToastAndroid.LONG);
                })
                .catch(err => {
                  setLoading(false);
                  console.log(err);
                });
            }}>
            LANCIA SFIDA
          </Button>
        </FormControl>
      </Dialog>
      <Loading loading={loading} />
      <Tab
        value={index}
        onChange={e => setIndex(e)}
        indicatorStyle={{
          backgroundColor: 'white',
          height: 5,
        }}
        variant="primary">
        <Tab.Item
          containerStyle={{backgroundColor: '#ff7042'}}
          title="Lancia sfida"
          titleStyle={{fontSize: 17}}
          icon={{
            name: 'sword',
            type: 'material-community',
            color: 'white',
            size: 27,
          }}
        />
        <Tab.Item
          containerStyle={{backgroundColor: '#ff7042'}}
          title="Sfide ricevute"
          titleStyle={{fontSize: 17}}
          icon={{
            name: 'sword-cross',
            type: 'material-community',
            color: 'white',
            size: 27,
          }}
        />
        <Tab.Item
          containerStyle={{backgroundColor: '#ff7042'}}
          title="Sfide lanciate"
          titleStyle={{fontSize: 17}}
          icon={{
            name: 'spellcheck',
            type: 'material-community',
            color: 'white',
            size: 27,
          }}
        />
      </Tab>
      <LocalContext.Provider value={con}>
        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={{width: '100%'}}>
            <CreateChallengeTab />
          </TabView.Item>
          <TabView.Item style={{width: '100%'}}>
            <ReceivedChallengesTab />
          </TabView.Item>
          <TabView.Item style={{width: '100%'}}>
            <SentChallengesTab />
          </TabView.Item>
        </TabView>
      </LocalContext.Provider>
    </>
  );
};

const toMinute = totalSeconds => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  const result = `${padTo2Digits(minutes)} minuti ${padTo2Digits(
    seconds,
  )} secondi`;
  return result;
};

const ReceivedChallengesTab = () => {
  const con = useContext(LocalContext);
  const [search, setSearch] = useState('');
  const [filterChallenge, setFilterChallenge] = useState([]);

  return (
    <>
      <Input
        value={search}
        onChangeText={txt => {
          setSearch(txt);
        }}
        variant="rounded"
        size="xl"
        placeholder="Nome sfidante"
        m="3"
        InputRightElement={
          <Button
            bgColor="#2289dc"
            h="full"
            w="1/4"
            rounded="none"
            size="lg"
            onPress={() => {
              Keyboard.dismiss();
              if (search.length == 0) {
                setFilterChallenge([]);
                return;
              }
              const tmp = con.receivedChall.filter(val => {
                return val.player.usernameLower.startsWith(
                  search.toLowerCase(),
                );
              });
              setFilterChallenge(tmp);
              setSearch('');
              if (tmp.length == 0) {
                ToastAndroid.show('Nessuna sfida trovata..', ToastAndroid.LONG);
              }
            }}>
            Cerca
          </Button>
        }
      />
      <ScrollView>
        {(filterChallenge.length > 0 ? filterChallenge : con.receivedChall).map(
          (value, index) => {
            return (
              <Card
                key={index}
                containerStyle={{
                  borderRadius: 10,
                  backgroundColor:
                    value.challenge.data().result == 'none'
                      ? 'white'
                      : value.challenge.data().result == 'win'
                      ? 'rgba(122, 199, 125, 1)'
                      : 'rgba(255, 154, 154, 1)',
                }}>
                <Text h4>
                  <Text>Sfidante: </Text>
                  {value.player.data().username}
                </Text>
                <Card.Divider style={{marginBottom: 0}} />
                <Text>
                  Lunghezza parola: {value.challenge.data().word.length}
                </Text>
                <Text>tempo: {toMinute(value.challenge.data().time)}</Text>
                {value.challenge.data().result == 'none' ? (
                  <Button
                    bgColor="#1a69a9"
                    mt="3"
                    _text={{fontSize: 'lg'}}
                    onPress={() => {
                      console.log();
                      con.navigation.replace('Playboardalt', {
                        mode: 'challenge',
                        challengeId: value.challenge.id,
                        challengeDoc: value.challenge.data(),
                      });
                    }}>
                    COMINCIA
                  </Button>
                ) : (
                  <>
                    <Text>Parola: {value.challenge.data().word}</Text>
                    <Text style={{fontSize: 19, marginTop: '1%'}}>
                      Risultato:{' '}
                      <Text style={{fontWeight: 'bold'}}>
                        {value.challenge.data().result == 'none'
                          ? 'Non giocato'
                          : value.challenge.data().result == 'win'
                          ? 'Vinto'
                          : 'Perso'}
                      </Text>
                    </Text>
                  </>
                )}
              </Card>
            );
          },
        )}
      </ScrollView>
    </>
  );
};

const CreateChallengeTab = () => {
  const con = useContext(LocalContext);
  const [search, setSearch] = useState('');
  const [friendsData, setFriendsData] = useState([]);
  const [filterFriends, setFilterFriends] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      setFriendsData([]);
      const promises = [];
      const tmp = [];
      for (let i = 0; i < con.friends.length; i++) {
        const prom = firestore()
          .collection('users')
          .where('uid', '==', con.friends[i])
          .get()
          .then(qs => {
            tmp.push(qs.docs[0]);
            // setFriendsData(prev => {
            //   return [...prev, qs.docs[0]];
            // });
          });
        promises.push(prom);
      }
      Promise.all(promises).then(() => {
        setFriendsData(tmp);
      });
    }, [con.friends]),
  );
  return (
    <>
      <Input
        value={search}
        onChangeText={txt => {
          setSearch(txt);
        }}
        variant="rounded"
        size="xl"
        placeholder="Nome amico"
        m="3"
        InputRightElement={
          <Button
            bgColor="#2289dc"
            h="full"
            w="1/4"
            rounded="none"
            size="lg"
            onPress={() => {
              Keyboard.dismiss();
              if (search.length == 0) {
                setFilterFriends([]);
                return;
              }
              const tmp = friendsData.filter(val => {
                return val
                  .data()
                  .usernameLower.startsWith(search.toLowerCase());
              });
              setFilterFriends(tmp);
              setSearch('');
              if (tmp.length == 0) {
                ToastAndroid.show('Nessuna amico trovato..', ToastAndroid.LONG);
              }
            }}>
            Cerca
          </Button>
        }
      />
      <ScrollView>
        {(filterFriends.length > 0 ? filterFriends : friendsData).map(
          (value, index) => {
            // {friendsData.map((value, index) => {
            return (
              <Card key={index} containerStyle={{borderRadius: 10}}>
                <View style={{marginBottom: '3%'}}>
                  <Text h4>{value.data().username}</Text>
                  <Text>id: {value.data().uid}</Text>
                </View>
                <Card.Divider />
                {con.sentChall.some(
                  val =>
                    val.player.id == value.id &&
                    val.challenge.data().result == 'none',
                ) ? (
                  <Button
                    isDisabled={true}
                    _text={{fontSize: 15}}
                    bgColor="#000000">
                    SFIDA GIA' LANCIATA
                  </Button>
                ) : (
                  <Button
                    _text={{fontSize: 15}}
                    bgColor="#ff733b"
                    onPress={() => {
                      con.dispatchLocal({
                        type: 'setPlayers',
                        payload: {from: con.realUid, to: value.id},
                      });
                      con.setShowAdd(true);
                    }}>
                    SFIDA
                  </Button>
                )}
              </Card>
            );
          },
        )}
      </ScrollView>
    </>
  );
};

const SentChallengesTab = () => {
  const con = useContext(LocalContext);
  const [search, setSearch] = useState('');
  const [filterChallenge, setFilterChallenge] = useState([]);

  return (
    <>
      <Input
        value={search}
        onChangeText={txt => {
          setSearch(txt);
        }}
        variant="rounded"
        size="xl"
        placeholder="Nome giocatore"
        m="3"
        InputRightElement={
          <Button
            bgColor="#2289dc"
            h="full"
            w="1/4"
            rounded="none"
            size="lg"
            onPress={() => {
              Keyboard.dismiss();
              if (search.length == 0) {
                setFilterChallenge([]);
                return;
              }
              const tmp = con.sentChall.filter(val => {
                return val.player
                  .data()
                  .usernameLower.startsWith(search.toLowerCase());
              });
              console.log(tmp);
              setFilterChallenge(tmp);
              setSearch('');
              if (tmp.length == 0) {
                ToastAndroid.show('Nessuna sfida trovata..', ToastAndroid.LONG);
              }
            }}>
            Cerca
          </Button>
        }
      />
      <ScrollView>
        {(filterChallenge.length > 0 ? filterChallenge : con.sentChall).map(
          (value, index) => {
            return (
              <Card
                key={index}
                containerStyle={{
                  borderRadius: 10,
                  backgroundColor:
                    value.challenge.data().result == 'none'
                      ? 'white'
                      : value.challenge.data().result == 'win'
                      ? 'rgba(122, 199, 125, 1)'
                      : 'rgba(255, 154, 154, 1)',
                }}>
                <Text h4>{value.player.data().username}</Text>
                <Card.Divider />
                <Text>Parola: {value.challenge.data().word}</Text>
                <Text>Tempo: {value.challenge.data().time / 60} minuti</Text>
                <Text style={{fontSize: 19}}>
                  Risultato:
                  <Text style={{fontWeight: 'bold'}}>
                    {value.challenge.data().result == 'none'
                      ? 'Non giocato'
                      : value.challenge.data().result == 'win'
                      ? 'Vinto'
                      : 'Perso'}
                  </Text>
                </Text>
              </Card>
            );
          },
        )}
      </ScrollView>
    </>
  );
};

export default Challenge;
