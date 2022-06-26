import { View, Text } from 'react-native'
import React ,{ useState, useEffect, useContext } from 'react';
import { Button } from '@rneui/base';

import auth from '@react-native-firebase/auth';
import { UserContext } from '../App';


const Home = ({navigation}) => {

    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState()
    const con = useContext(UserContext);

    function onAuthStateChanged(u) {
        if(u){
            setUser(u);
            console.log(u)
            console.log('wowwwow')
            con.setUserData({username: u.displayName, mail: u.email, uid: u.uid})
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

      const showUser = () => {
        const lol = auth().currentUser
        console.log(con.userData)
      }

      const signOut = () =>{
        con.setUserData({
            ...con.userData,
            username: '',
            mail: '',
            uid: ''
        })

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
                showUser()
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