import {View, Text} from 'react-native';
import React, {createContext, useState} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Provider} from 'react-redux';
import store from './state/store';

import App2 from './App2';
import Login from './views/Login';
import Home from './views/Home';
// import UserContext from './context/userContext'

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
  // const DevicesContextValue = React.useMemo(() => ({ userData, setUserData}), [userData]);

  return (
    <Provider store={store}>
      {/* <UserContext.Provider value={red}> */}
      <NavigationContainer>
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
            options={{
              headerLeft: props => <></>,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {/* </UserContext.Provider> */}
    </Provider>
  );
};

export default App;
