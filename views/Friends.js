import {View, ScrollView, Keyboard, ToastAndroid} from 'react-native';
import React, {useState, useContext, createContext, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {fonts} from '@rneui/base';
import {Button, Input, Box, WarningOutlineIcon, FormControl} from 'native-base';

import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import Loading from '../components/Loading';

const LoadingContext = createContext();

const Friends = ({route}) => {
  const [index, setIndex] = useState(route.params.tab);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendReqs, setFriendReqs] = useState([]);
  const con = {setLoading, friends, friendReqs, setIndex};

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = firestore()
        .collection('users')
        .where('uid', '==', auth().currentUser.uid)
        .onSnapshot(qs => {
          setFriends(qs.docs[0].data().friends);
          setFriendReqs(qs.docs[0].data().friendRequests);
        });
      return () => {
        setFriends([]);
        setFriendReqs([]);
        subscribe();
      };
    }, []),
  );

  return (
    <>
      <Loading loading={loading} />
      <Tab
        value={index}
        onChange={e => setIndex(e)}
        indicatorStyle={{
          backgroundColor: 'white',
          height: 3,
        }}
        variant="primary">
        <Tab.Item
          title="Giocatori"
          titleStyle={{fontSize: 17}}
          icon={{
            name: 'account-search',
            type: 'material-community',
            color: 'white',
            size: 25,
          }}
        />
        <Tab.Item
          title="Amici"
          titleStyle={{fontSize: 17}}
          icon={{
            name: 'account-group',
            type: 'material-community',
            color: 'white',
            size: 25,
          }}
        />
        <Tab.Item
          title="Richieste"
          titleStyle={{fontSize: 17}}
          icon={{
            name: 'account-multiple-plus',
            type: 'material-community',
            color: 'white',
            size: 25,
          }}
        />
      </Tab>
      <LoadingContext.Provider value={con}>
        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={{width: '100%'}}>
            <PlayerSearchTab />
          </TabView.Item>
          <TabView.Item style={{width: '100%'}}>
            <FriendsTab />
          </TabView.Item>
          <TabView.Item style={{width: '100%'}}>
            <ReqsTab />
          </TabView.Item>
        </TabView>
      </LoadingContext.Provider>
    </>
  );
};

const PlayerSearchTab = () => {
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState([]);
  const con = useContext(LoadingContext);

  const addFriend = friendUid => {
    firestore()
      .collection('users')
      .where('uid', '==', friendUid)
      .get()
      .then(qs => {
        firestore()
          .collection('users')
          .doc(qs.docs[0].id)
          .update({
            friendRequests: firestore.FieldValue.arrayUnion(
              auth().currentUser.uid,
            ),
          })
          .then(() => {
            con.setLoading(false);
            ToastAndroid.show('Richiesta mandata!', ToastAndroid.LONG);
          })
          .catch(err => {
            con.setLoading(false);
            ToastAndroid.show('Richiesta fallita!', ToastAndroid.LONG);
            console.log(err);
          });
      });
  };

  return (
    <ScrollView keyboardShouldPersistTaps="always">
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
              if (search.length == 0) {
                return;
              }
              Keyboard.dismiss();
              con.setLoading(true);
              firestore()
                .collection('users')
                .orderBy('usernameLower')
                .startAt(search.toLowerCase())
                .endAt(search.toLowerCase() + '\uf8ff')
                .get()
                .then(qs => {
                  qs.docs.forEach((value, index) => {
                    console.log(value.data().username);
                  });
                  setPlayers(qs.docs);
                  con.setLoading(false);
                })
                .catch(err => {
                  setLoading(false);
                  console.log(err);
                  ToastAndroid.show('Ricerca fallita!', ToastAndroid.LONG);
                });
            }}>
            Cerca
          </Button>
        }
      />
      <View>
        {players.map((value, index) => {
          if (value.data().uid == auth().currentUser.uid) {
            return;
          }

          return (
            <View
              key={index}
              style={{
                paddingVertical: 10,
                paddingHorizontal: '5%',
                borderBottomWidth: 1,
                borderBottomColor: '#b1b1b1',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text h4>{value.data().username}</Text>
                <Text style={{color: '#242424', fontSize: 13}}>
                  {value.data().uid}
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                }}>
                {con.friends.includes(value.data().uid) ? (
                  <Button
                    w="1/2"
                    isDisabled={true}
                    backgroundColor="#373737"
                    size="lg"
                    mt="2">
                    GIA' AMICO
                  </Button>
                ) : con.friendReqs.includes(value.data().uid) ? (
                  <Button
                    w="1/2"
                    size="lg"
                    bgColor="#e6b800"
                    mt="2"
                    onPress={() => {
                      con.setIndex(2);
                    }}>
                    RICHIESTA IN ATTESA
                  </Button>
                ) : (
                  <Button
                    w="1/2"
                    size="lg"
                    bgColor="#2289dc"
                    mt="2"
                    onPress={() => {
                      con.setLoading(true);
                      addFriend(value.data().uid);
                    }}>
                    MANDA RICHIESTA
                  </Button>
                )}
                <Button
                  ml="0.5"
                  w="1/2"
                  size="lg"
                  bgColor="#669036"
                  mt="2"
                  onPress={() => {
                    console.log('go to PROFILO');
                  }}>
                  PROFILO
                </Button>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const FriendsTab = () => {
  const con = useContext(LoadingContext);
  const [friendsData, setFriendsData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      setFriendsData([]);
      const tmp = [];
      const promises = [];
      for (let i = 0; i < con.friends.length; i++) {
        const prom = firestore()
          .collection('users')
          .where('uid', '==', con.friends[i])
          .get()
          .then(qs => {
            tmp.push(qs.docs[0].data());
            // setFriendsData(prev => {
            //   return [...prev, qs.docs[0].data()];
            // });
          });
      }
      Promise.all(promises).then(() => {
        setFriendsData(tmp);
      });
      //   setFriendsData(newData);
      return () => {
        setFriendsData([]);
      };
    }, [con.friends]),
  );

  return (
    <ScrollView>
      {friendsData.map((value, index) => {
        return (
          <View
            key={index}
            style={{
              paddingVertical: 10,
              paddingHorizontal: '5%',
              borderBottomWidth: 1,
              borderBottomColor: '#b1b1b1',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text h4>{value.username}</Text>
              <Text style={{color: '#242424', fontSize: 13}}>{value.uid}</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
              }}>
              <Button
                ml="0.5"
                w="full"
                size="lg"
                bgColor="#669036"
                mt="2"
                onPress={() => {
                  console.log('go to PROFILO');
                }}>
                PROFILO
              </Button>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const ReqsTab = ({}) => {
  const con = useContext(LoadingContext);
  const [reqsData, setReqsData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      setReqsData([]);
      const tmp = [];
      const promises = [];
      for (let i = 0; i < con.friendReqs.length; i++) {
        const prom = firestore()
          .collection('users')
          .where('uid', '==', con.friendReqs[i])
          .get()
          .then(qs => {
            tmp.push(qs.docs[0].data());
            // setReqsData(prev => {
            //   return [...prev, qs.docs[0].data()];
            // });
          });
        promises.push(prom);
      }
      Promise.all(promises).then(() => {
        setReqsData(tmp);
      });
      return () => {
        setReqsData([]);
      };
    }, [con.friendReqs]),
  );

  return (
    <ScrollView>
      {reqsData.map((value, index) => {
        return (
          <View
            key={index}
            style={{
              paddingVertical: 10,
              paddingHorizontal: '5%',
              borderBottomWidth: 1,
              borderBottomColor: '#b1b1b1',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <UserRow value={value} />
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
              }}>
              <Button
                ml="0.5"
                w="1/2"
                size="lg"
                bgColor="#669036"
                mt="2"
                onPress={() => {
                  con.setLoading(true);

                  firestore()
                    .collection('users')
                    .where('uid', '==', auth().currentUser.uid)
                    .get()
                    .then(qs => {
                      firestore()
                        .collection('users')
                        .doc(qs.docs[0].id)
                        .update({
                          friendRequests: firestore.FieldValue.arrayRemove(
                            value.uid,
                          ),
                          friends: firestore.FieldValue.arrayUnion(value.uid),
                        })
                        .then(() => {
                          con.setLoading(false);
                        })
                        .catch(err => {
                          ToastAndroid.show(
                            'Amicizia non possibile..',
                            ToastAndroid.LONG,
                          );
                          console.log(err);
                          con.setLoading(false);
                        });
                    })
                    .catch(err => {
                      ToastAndroid.show(
                        'Utente corrente non trovato',
                        ToastAndroid.LONG,
                      );
                      console.log(err);
                      con.setLoading(false);
                    });

                  firestore()
                    .collection('users')
                    .where('uid', '==', value.uid)
                    .get()
                    .then(qs => {
                      firestore()
                        .collection('users')
                        .doc(qs.docs[0].id)
                        .update({
                          friends: firestore.FieldValue.arrayUnion(
                            auth().currentUser.uid,
                          ),
                        })
                        .then(() => {})
                        .catch(err => {
                          ToastAndroid.show(
                            'non aggiunto ad amico..',
                            ToastAndroid.LONG,
                          );
                          console.log(err);
                        });
                    });
                }}>
                ACCETTA
              </Button>
              <Button
                ml="0.5"
                w="1/2"
                size="lg"
                bgColor="rgb(179, 0, 0)"
                mt="2"
                onPress={() => {
                  con.setLoading(true);

                  firestore()
                    .collection('users')
                    .where('uid', '==', auth().currentUser.uid)
                    .get()
                    .then(qs => {
                      firestore()
                        .collection('users')
                        .doc(qs.docs[0].id)
                        .update({
                          friendRequests: firestore.FieldValue.arrayRemove(
                            value.uid,
                          ),
                        })
                        .then(() => {
                          con.setLoading(false);
                        })
                        .catch(err => {
                          ToastAndroid.show(
                            'rimozione non possibile..',
                            ToastAndroid.LONG,
                          );
                          console.log(err);
                          con.setLoading(false);
                        });
                    })
                    .catch(err => {
                      ToastAndroid.show(
                        'Utente corrente non trovato',
                        ToastAndroid.LONG,
                      );
                      console.log(err);
                      con.setLoading(false);
                    });
                }}>
                RIFIUTA
              </Button>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const UserRow = ({value}) => {
  return (
    <View>
      <Text h4>{value.username}</Text>
      <Text style={{color: '#242424', fontSize: 13}}>{value.uid}</Text>
    </View>
  );
};

export default Friends;
