import {View, Text, ImageBackground, StyleSheet, Image} from 'react-native';
import React, {useState, useEffect, useContext, createContext} from 'react';

import {Button} from '@rneui/base';
import {Text as TextE} from '@rneui/themed';
import {Overlay, Dialog, ListItem, Badge} from '@rneui/themed';

import {Select, Box, Input, CheckIcon} from 'native-base';

import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';

import {useSelector, useDispatch} from 'react-redux';
import {
  setUsername,
  setMailState,
  setUid,
  clear,
  setToken,
} from '../state/userSlice';

import pp from '../helper/tile4.png';

import {UserContext} from '../App';
import TutorialDialog from './TutorialDialog';

const Home = ({navigation}) => {
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [reqsNum, setReqsNum] = useState(0);
  const [challengeNum, setChallengeNum] = useState(0);
  const con = useContext(UserContext);

  const [toggleLoading, setToggleLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        if (
          e.data.action.payload?.name == 'Login' &&
          e.data.action.type == 'NAVIGATE'
        ) {
          navigation.dispatch(e.data.action);
        }
      });
      return () => {
        subscribe();
      };
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      firestore()
        .collection('users')
        .where('uid', '==', auth().currentUser.uid)
        .get()
        .then(qs => {
          setUser(qs.docs[0]);
          setReqsNum(qs.docs[0].data().friendRequests.length);
        })
        .catch(err => {
          console.log('ERROR IN USER FETCH:  ' + err);
        });

      firestore()
        .collection('users')
        .where('uid', '==', auth().currentUser.uid)
        .get()
        .then(qs => {
          firestore()
            .collection('challenges')
            .where('to', '==', qs.docs[0].id)
            .where('result', '==', 'none')
            .get()
            .then(qs => {
              setChallengeNum(qs.docs.length);
            });
        })
        .catch(err => {
          console.log('failed to retrive realUid');
          console.log(err);
        });
    }, []),
  );

  const onAuthStateChanged = u => {
    if (u) {
      dispatch(setUsername(u.displayName));
      dispatch(setMailState(u.email));
      dispatch(setUid(u.uid));
      // console.log(userData)
    } else {
      console.log('user not logged');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      auth().currentUser.reload();
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
      return subscriber; // unsubscribe on unmount
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (userData.uid != '') {
        messaging()
          .getToken()
          .then(token => {
            dispatch(setToken(token));
            updateToken(token);
          });

        return messaging().onTokenRefresh(token => {
          updateToken(token);
        });
      }
    }, [userData.uid]),
  );

  const updateToken = token => {
    firestore()
      .collection('users')
      .where('uid', '==', auth().currentUser.uid)
      .get()
      .then(qs => {
        firestore()
          .collection('users')
          .doc(qs.docs[0].id)
          .update({token: firestore.FieldValue.arrayUnion(token)})
          .then(() => {
            console.log('TOKEN ADDED');
          })
          .catch(err => {
            console.log('ERROR IN TOKEN ADD:  ' + err);
          });
      })
      .catch(err => {
        console.log('ERROR IN USER FETCH:  ' + err);
      });
  };

  const signOut = () => {
    dispatch(clear());

    messaging()
      .getToken()
      .then(token => {
        firestore()
          .collection('users')
          .where('uid', '==', auth().currentUser.uid)
          .get()
          .then(qs => {
            firestore()
              .collection('users')
              .doc(qs.docs[0].id)
              .update({token: firestore.FieldValue.arrayRemove(token)})
              .then(() => {
                auth()
                  .signOut()
                  .then(() => {
                    console.log('User signed out!');
                    navigation.navigate('Login');
                  });
              });
          });
      });
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <ImageBackground
      source={pp}
      resizeMode="cover"
      // imageStyle={{height: 800, width: 800}}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            height: '95%',
            width: '70%',
            marginTop: '5%',
            borderRadius: 10,
          }}>
          <Dialog
            isVisible={toggleLoading}
            overlayStyle={{
              backgroundColor: 'none',
              shadowColor: 'rgba(255, 255, 255, 0)',
            }}>
            <Dialog.Loading />
          </Dialog>

          <TutorialDialog
            showTutorial={showTutorial}
            setShowTutorial={setShowTutorial}
          />

          <Image
            source={require('../helper/title2C.png')}
            style={{
              // height: '11%',
              width: '85%',
            }}
          />
          <TextE
            h4
            h4Style={{
              color: 'black',
              fontSize: 22,
              marginBottom: '1%',
              width: '80%',
              textAlign: 'center',
            }}>
            Ciao {userData.username ? userData.username : ''}!
          </TextE>

          <View
            style={{
              height: '65%',
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10%',
            }}>
            <Button
              title="CREA PARTITA"
              buttonStyle={[styles.buttonStyle, {backgroundColor: '#669036'}]}
              titleStyle={styles.titleStyle}
              containerStyle={styles.buttonContainerStyle}
              icon={{
                name: 'plus-circle',
                type: 'material-community',
                size: 30,
                color: 'white',
              }}
              onPress={() => {
                toggleOverlay();
              }}
            />

            <Button
              title="CERCA PARTITA"
              buttonStyle={[styles.buttonStyle, {backgroundColor: '#a655a3'}]}
              titleStyle={styles.titleStyle}
              containerStyle={styles.buttonContainerStyle}
              icon={{
                name: 'magnify',
                type: 'material-community',
                size: 30,
                color: 'white',
              }}
              onPress={() => {
                navigation.navigate('Search');
              }}
            />
            <View>
              <Button
                title="SFIDE"
                buttonStyle={[styles.buttonStyle, {backgroundColor: '#ff7043'}]}
                titleStyle={styles.titleStyle}
                containerStyle={styles.buttonContainerStyle}
                icon={{
                  name: 'sword-cross',
                  type: 'material-community',
                  size: 30,
                  color: 'white',
                }}
                onPress={() => {
                  navigation.navigate('Challenge', {tab: 0});
                }}
              />
              {challengeNum > 0 ? (
                <Badge
                  status="error"
                  value={challengeNum}
                  containerStyle={{
                    position: 'absolute',
                    top: '5%',
                    left: '70%',
                  }}
                />
              ) : (
                <></>
              )}
            </View>
            <View>
              <Button
                title="AMICI"
                buttonStyle={styles.buttonStyle}
                titleStyle={styles.titleStyle}
                containerStyle={styles.buttonContainerStyle}
                icon={{
                  name: 'account-group',
                  type: 'material-community',
                  size: 30,
                  color: 'white',
                }}
                onPress={() => {
                  navigation.navigate('Friends', {tab: 0});
                }}
              />
              {reqsNum > 0 ? (
                <Badge
                  status="error"
                  value={reqsNum}
                  containerStyle={{
                    position: 'absolute',
                    top: '5%',
                    left: '70%',
                  }}
                />
              ) : (
                <></>
              )}
            </View>

            <Button
              title="PROFILO"
              buttonStyle={[styles.buttonStyle, {backgroundColor: '#f2bd29'}]}
              titleStyle={styles.titleStyle}
              containerStyle={styles.buttonContainerStyle}
              icon={{
                name: 'account',
                type: 'material-community',
                size: 30,
                color: 'white',
              }}
              onPress={() => {
                navigation.navigate('Statistics', {
                  realUid: user.id,
                  uid: user.data().uid,
                  username: auth().currentUser.displayName,
                });
              }}
            />

            <Button
              title="INFO"
              buttonStyle={[styles.buttonStyle, {backgroundColor: '#26a69a'}]}
              titleStyle={styles.titleStyle}
              containerStyle={styles.buttonContainerStyle}
              icon={{
                name: 'help-circle-outline',
                type: 'material-community',
                size: 30,
                color: 'white',
              }}
              onPress={() => {
                setShowTutorial(true);
              }}
            />

            <Button
              buttonStyle={([styles.buttonStyle], {backgroundColor: '#373737'})}
              titleStyle={styles.titleStyle}
              containerStyle={styles.buttonContainerStyle}
              icon={{
                name: 'logout',
                type: 'material-community',
                size: 30,
                color: 'white',
              }}
              title="LOG OUT"
              onPress={() => {
                signOut();
              }}
            />
          </View>

          <CreateMatchDialog
            showOverlay={showOverlay}
            toggleOverlay={toggleOverlay}
            navigation={navigation}
            setToggleLoading={setToggleLoading}
          />
          <TextE
            h4
            h4Style={{
              color: 'black',
              fontSize: 11,
              width: '80%',
              textAlign: 'center',
              marginTop: '5%',
            }}>
            id: {userData.uid}
          </TextE>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {},
  titleStyle: {fontSize: 20},
  buttonContainerStyle: {borderRadius: 15},
});

const playerNumDropList = [
  {label: '2', value: 2},
  {label: '3', value: 3},
  {label: '4', value: 4},
  {label: '5', value: 5},
  {label: '6', value: 6},
];

const wordsNum = [
  {label: '3', value: 3},
  {label: '4', value: 4},
  {label: '5', value: 5},
  {label: '6', value: 6},
  {label: '7', value: 7},
  {label: '8', value: 8},
  {label: '9', value: 9},
  {label: '10', value: 10},
];

const wordsLen = [
  {label: '4', value: 4},
  {label: '5', value: 5},
  {label: '6', value: 6},
];

const initVals = {
  pNum: 2,
  wNum: 3,
  wLen: 4,
  pwd: '',
};

const SelectData = createContext();

const CreateMatchDialog = ({
  showOverlay,
  toggleOverlay,
  navigation,
  setToggleLoading,
}) => {
  const [vals, setVals] = useState(initVals);
  const v = {vals, setVals};

  return (
    <Overlay
      onShow={() => {
        console.log('doing');
        setVals(() => {
          return {...initVals};
        });
      }}
      animationType="fade"
      isVisible={showOverlay}
      overlayStyle={{width: '90%', display: 'flex', alignItems: 'center'}}>
      <TextE h4 style={{marginVertical: '3%'}}>
        Seleziona e crea una nuova partita
      </TextE>
      <SelectData.Provider value={v}>
        <SelectDropdown
          label="Numero Giocatori"
          data={playerNumDropList}
          placeholder="..."
          k="pNum"
        />

        <SelectDropdown
          label="Numero parole"
          data={wordsNum}
          placeholder="..."
          k="wNum"
        />

        <SelectDropdown
          label="Lunghezza parole"
          data={wordsLen}
          placeholder="..."
          k="wLen"
        />

        <View style={{width: '80%', marginBottom: '3%'}}>
          <Text style={{color: 'black', fontSize: 17, marginBottom: '1%'}}>
            Password (opzionale)
          </Text>
          <Input
            placeholder="Password per la partita"
            w="100%"
            size="xl"
            type="password"
            onChangeText={txt => {
              setVals(cur => {
                cur.pwd = txt;
                return cur;
              });
            }}
          />
        </View>
      </SelectData.Provider>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          marginTop: '4%',
        }}>
        <Button
          title="ANNULLA"
          buttonStyle={{margin: '2%'}}
          onPress={() => {
            toggleOverlay();
            console.log(vals);
          }}
        />
        <Button
          title="CREA PARTITA"
          buttonStyle={{margin: '2%'}}
          onPress={() => {
            toggleOverlay();
            setToggleLoading(true);
            navigation.navigate('Hostroom', vals);
            setToggleLoading(false);
          }}
        />
      </View>
    </Overlay>
  );
};

const SelectDropdown = ({label, data, placeholder, k}) => {
  const [isFocus, setIsFocus] = useState(false);
  const {vals, setVals} = useContext(SelectData);

  return (
    <View style={{width: '80%', marginBottom: '4%'}}>
      <Text style={{color: 'black', fontSize: 17, marginBottom: '1%'}}>
        {label}
      </Text>

      <Box w={'100%'}>
        <Select
          w={'100%'}
          defaultValue={data[0].value}
          size="xl"
          _selectedItem={{
            bg: 'teal.600',
            endIcon: <CheckIcon size={5} />,
          }}
          onValueChange={n => {
            setVals(cur => {
              cur[k] = n;
              return cur;
            });
          }}>
          {data.map(({label, value}, index) => (
            <Select.Item key={index} label={label} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select>
      </Box>
    </View>
  );
};

export default Home;
