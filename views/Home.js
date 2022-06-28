import {View, Text} from 'react-native';
import React, {useState, useEffect, useContext, createContext} from 'react';

import {Button, fonts} from '@rneui/base';
import {Input, Text as TextE} from '@rneui/themed';
import {Overlay} from '@rneui/themed';

import {Dropdown} from 'react-native-element-dropdown';

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
      return subscribe;
    }),
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
      return subscriber; // unsubscribe on unmount
    }),
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
      }}>
      <Text style={{color: 'black', fontSize: 20, marginVertical: 20}}>
        Ciao {userData.username ? userData.username : ''}!
      </Text>
      <Button
        title="Clicca"
        onPress={() => {
          showUser();
        }}
      />

      <Button
        title="CREA PARTITA"
        onPress={() => {
          toggleOverlay();
        }}
      />

      <Button
        title="CERCA PARTITA"
        onPress={() => {
          navigation.navigate('Search');
        }}
      />

      <Button
        title="LOG OUT"
        onPress={() => {
          signOut();
        }}
      />

      <AddUsername
        showOverlay={showOverlay}
        toggleOverlay={toggleOverlay}
        navigation={navigation}
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
  wLen: 5,
};

const SelectData = createContext();

const AddUsername = ({showOverlay, toggleOverlay, navigation}) => {
  const [vals, setVals] = useState(initVals);
  const v = {vals, setVals};

  return (
    <Overlay
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
          }}
        />
        <Button
          title="CREA PARTITA"
          buttonStyle={{margin: 5}}
          onPress={() => {
            toggleOverlay();
            navigation.navigate('Hostroom', vals);
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
      <Dropdown
        value={vals[k]}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        data={data}
        style={[
          {
            width: '100%',
            borderColor: 'gray',
            borderWidth: 1.5,
            borderRadius: 8,
            paddingHorizontal: 5,
          },
          isFocus && {borderColor: 'blue'},
        ]}
        selectedTextStyle={{color: 'black'}}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        onChange={n => {
          setVals(cur => {
            cur[k] = n.value;
            return cur;
          });
        }}
      />
    </View>
  );
};

export default Home;
