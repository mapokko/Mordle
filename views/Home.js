import { View, Text } from 'react-native'
import React ,{ useState, useEffect, useContext } from 'react';
import { Button } from '@rneui/base';

import auth from '@react-native-firebase/auth';
import { UserContext } from '../App';


const Home = ({navigation}) => {

    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState()
    const ss = useContext(UserContext);

    function onAuthStateChanged(user) {
        if(user){
            setUser(user);
            if (initializing) setInitializing(false);
        }
        else{
            navigation.navigate('Login')
        }
      }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
      }, []);

      const signOut = () =>{
        auth()
            .signOut()
            .then(() => console.log('User signed out!'));
      }

  return (
    <View>
        <Text>Home</Text>
        <Button 
            title='Clicca'
            onPress={()=>{
                console.log(ss.userData)
                console.log('ciao')
            }}
        />
        <Button 
            title='esci'
            onPress={()=>{
                signOut()
            }}
        />
    </View>
  )
}

export default Home