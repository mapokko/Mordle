import { View, Text } from 'react-native'
import React ,{ useState, useEffect, useContext } from 'react';
import { Button } from '@rneui/base';
import { Overlay } from "@rneui/themed";

import auth from '@react-native-firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';



import { UserContext } from '../App';


const Home = ({navigation}) => {

    const [showOverlay, setShowOverlay] = useState(false)

    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState()
    const con = useContext(UserContext);
    let backListener



    useEffect(() => {
        console.log(con.userData)
        const subscribe = backListener =  navigation.addListener('beforeRemove', (e) => {
            e.preventDefault()
            if(e.data.action.payload?.name == 'Login' && e.data.action.type == 'NAVIGATE'){
                navigation.dispatch(e.data.action)
            }
        })
        return subscribe
    }, [])
    

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
        
        navigation.navigate('Login')
    }

    const toggleOverlay = () =>{
        setShowOverlay(!showOverlay)
    }

  return (
    <View>
        <Text> Ciao {con.userData.username ? con.userData.username: ''}!</Text>
        <Button 
            title='Clicca'
            onPress={()=>{
                showUser()
            }}
        />

        <Button 
            title='overlay'
            onPress={()=>{
                toggleOverlay()
            }}
        />

        <Button 
            title='esci'
            onPress={()=>{
                signOut()
            }}
        />

        <AddUsername showOverlay={showOverlay} toggleOverlay={toggleOverlay} />
    </View>
  )
}

const AddUsername = ({showOverlay, toggleOverlay}) => {

    return (
        <Overlay isVisible={showOverlay} fullScreen={true}>
            <Button 
                title='CHIUDI'
                style={{margin: 10}} 
                onPress={() => {toggleOverlay()}}
            />
        </Overlay>
    )
}

export default Home