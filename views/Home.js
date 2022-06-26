import {View, Text} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {Button} from '@rneui/base';
import {Overlay} from '@rneui/themed';

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

  // useEffect(() =>{
  //     console.log(userData)
  //     if(userData.username === ''){
  //         console.log('non ce il username')
  //     }
  //     else {
  //         console.log('CE il username')
  //     }
  // }, [userData])

  const onAuthStateChanged = u => {
    if (u) {
      console.log(auth().currentUser);
      dispatch(setUsername(u.displayName));
      dispatch(setMailState(u.email));
      dispatch(setUid(u.uid));
      // console.log(userData)
      console.log('wowwwow');
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
    <View>
      <Text> Ciao {userData.username ? userData.username : ''}!</Text>
      <Button
        title="Clicca"
        onPress={() => {
          showUser();
        }}
      />

      <Button
        title="overlay"
        onPress={() => {
          toggleOverlay();
        }}
      />

      <Button
        title="esci"
        onPress={() => {
          signOut();
        }}
      />

      <AddUsername showOverlay={showOverlay} toggleOverlay={toggleOverlay} />
    </View>
  );
};

const AddUsername = ({showOverlay, toggleOverlay}) => {
  return (
    <Overlay isVisible={showOverlay} fullScreen={true}>
      <Button
        title="CHIUDI"
        style={{margin: 10}}
        onPress={() => {
          toggleOverlay();
        }}
      />
    </Overlay>
  );
};

export default Home;
