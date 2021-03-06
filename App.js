import {View, Text} from 'react-native';
import React, {createContext, useState, useEffect, useRef} from 'react';

import {NavigationContainer, StackActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeBaseProvider} from 'native-base';

import {Provider} from 'react-redux';
import store from './state/store';

import App2 from './App2';
import Login from './views/Login';
import Home from './views/Home';
import HostRoom from './views/HostRoom';
import PlayerRoom from './views/PlayerRoom';
import SearchMatch from './views/SearchMatch';
import PlayBoard from './views/PlayBoard';
import Ending from './views/Ending';
import Statistics from './views/Statistics';
import Friends from './views/Friends';
import Challenge from './views/Challenge';
import PlayBoardAlt from './views/PlayerBoardAlt';

import messaging from '@react-native-firebase/messaging';
import {handleNotification} from './helper/notificationHandler';

import Tmp from './views/Tmp';

import notifee, {EventType, AndroidImportance} from '@notifee/react-native';

export const UserContext = createContext();

const Stack = createNativeStackNavigator();

const initData = {
  username: '',
  mail: '',
  uid: '',
};

const App = () => {
  const [userData, setUserData] = useState({
    username: '',
    mail: '',
    uid: '',
  });
  const data = {userData, setUserData};

  const navigationRef = useRef();

  useEffect(() => {
    console.log('listening for messages');

    messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotification(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        handleNotification(remoteMessage);
      });
  }, []);

  const handleNotification = remoteMessage => {
    if (remoteMessage) {
      if (remoteMessage.data.type == 'friendRequests') {
        navigationRef.current.navigate('Friends', {tab: 2});
      } else if (remoteMessage.data.type == 'newChallenge') {
        navigationRef.current.navigate('Challenge', {tab: 1});
      } else if (remoteMessage.data.type == 'endChallenge') {
        navigationRef.current.navigate('Challenge', {tab: 2});
      }
    }
  };

  return (
    <NativeBaseProvider>
      <Provider store={store}>
        {/* <UserContext.Provider value={red}> */}
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              options={{headerShown: false}}
              name="Login"
              component={Login}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Register"
              component={App2}
            />
            <Stack.Screen
              name="Homepage"
              component={Home}
              // options={{
              //   headerLeft: props => <></>,
              //   gestureEnabled: false,
              // }}
              options={{headerShown: false}}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Search"
              component={SearchMatch}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Statistics"
              component={Statistics}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Friends"
              component={Friends}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Challenge"
              component={Challenge}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Playboardalt"
              component={PlayBoardAlt}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Hostroom"
              component={HostRoom}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Playerroom"
              component={PlayerRoom}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Playboard"
              component={PlayBoard}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Tmp"
              component={Tmp}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Ending"
              component={Ending}
            />
          </Stack.Navigator>
        </NavigationContainer>
        {/* </UserContext.Provider> */}
      </Provider>
    </NativeBaseProvider>
  );
};

export default App;
