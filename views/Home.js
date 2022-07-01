import {View, Text} from 'react-native';
import React, {useState, useEffect, useContext, createContext} from 'react';

import {Button, fonts} from '@rneui/base';
import {Text as TextE} from '@rneui/themed';
import {Overlay, Dialog} from '@rneui/themed';

import {Dropdown} from 'react-native-element-dropdown';

import {Select, Box, Input} from 'native-base';
import {CheckIcon} from 'native-base';

import auth from '@react-native-firebase/auth';
import {CommonActions} from '@react-navigation/native';
import {StackActions, useFocusEffect} from '@react-navigation/native';

import {useSelector, useDispatch} from 'react-redux';
import {setUsername, setMailState, setUid} from '../state/userSlice';

import {UserContext} from '../App';

const Home = ({navigation}) => {
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [showOverlay, setShowOverlay] = useState(false);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
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
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
      return () => {
        subscriber();
      }; // unsubscribe on unmount
    }, []),
  );

  const showUser = () => {
    console.log(userData);
  };

  const signOut = () => {
    dispatch(setUsername(''));
    dispatch(setMailState(''));
    dispatch(setUid(''));

    auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
        navigation.navigate('Login');
      });
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}>
      <Dialog
        isVisible={toggleLoading}
        overlayStyle={{
          backgroundColor: 'none',
          shadowColor: 'rgba(255, 255, 255, 0)',
        }}>
        <Dialog.Loading />
      </Dialog>
      <Text style={{color: 'black', fontSize: 20, marginVertical: 20}}>
        Ciao {userData.username ? userData.username : ''}!
      </Text>

      <View>
        <Button
          title="CREA PARTITA"
          buttonStyle={{marginBottom: '5%'}}
          onPress={() => {
            toggleOverlay();
          }}
        />

        <Button
          title="CERCA PARTITA"
          buttonStyle={{marginBottom: '5%'}}
          onPress={() => {
            navigation.navigate('Search');
          }}
        />

        <Button
          title="STATISTICHE"
          buttonStyle={{marginBottom: '5%'}}
          onPress={() => {
            navigation.navigate('Statistics');
          }}
        />

        <Button
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
    </View>
  );
};

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
      <TextE h4 style={{marginVertical: 10}}>
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

        <View style={{width: '80%', marginBottom: 15}}>
          <Text style={{color: 'black', fontSize: 17, marginBottom: 5}}>
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
          marginTop: 20,
        }}>
        <Button
          title="ANNULLA"
          buttonStyle={{margin: 5}}
          onPress={() => {
            toggleOverlay();
            console.log(vals);
          }}
        />
        <Button
          title="CREA PARTITA"
          buttonStyle={{margin: 5}}
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
    <View style={{width: '80%', marginBottom: 15}}>
      <Text style={{color: 'black', fontSize: 17, marginBottom: 5}}>
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
