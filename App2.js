import { View, ScrollView, StyleSheet, ToastAndroid } from 'react-native'
import React, {useContext, useState, useEffect, useRef} from 'react'

import { Text } from "@rneui/themed";
import { Input, Icon } from "@rneui/themed";
import { Button } from "@rneui/base";
import { Tooltip } from '@rneui/base';

import auth from '@react-native-firebase/auth';


const App2 = ({navigation}) => {
  const input1 = useRef()
  const input2 = useRef()

  const [mail, setMail] = useState('')
  const [pwd, setPwd] = useState('')

  const [mailError, setMailError] = useState('')

  const [pwdError, setPwdError] = useState('')

  const checkData = () => {
    input1.current.clear()
    input2.current.clear()

    if(!mail.match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)){
      input1.current.shake()
      setMailError('Email non adeguata!')
      setTimeout(()=>{
        setMailError('')
      }, 5000)
      return
    }

    if(pwd.length < 6){
      input2.current.shake()
      setPwdError('Password troppo breve!')
      setTimeout(()=>{
        setPwdError('')
      }, 5000)
      return
    }

    addUser()
  }

  const addUser = async () => {
   auth()
    .createUserWithEmailAndPassword(mail, pwd)
    .then(()=>{
      ToastAndroid.show('Utente creato!', ToastAndroid.LONG)
      navigation.navigate('Homepage')
    })
    .catch((error)=>{
      if (error.code === 'auth/email-already-in-use') {
        setMailError("Email gia' utilizzata!")
        setTimeout(()=>{
          setMailError('')
        }, 5000)
      }
  
      if (error.code === 'auth/invalid-email') {
        console.log('Email non adeguata!');
      }

      console.log(error.code)

    })

  }

  return (
    <ScrollView contentContainerStyle={s.view}>
        <Text h2 style={{marginBottom: 55, marginTop: 40}}>Iscriviti per giocare!</Text>
        <Text h4>Mail</Text>
        <Input 
          ref={input1}
          value={mail} 
          containerStyle={{width: '80%', marginTop: 20}} 
          placeholder='Inserisci la mail' 
          onChangeText={(str) => {
            setMail(str)
          }}  
          errorMessage={mailError}/>


        <Text h4 style={{marginTop: 30}}>Password</Text>
        <Input 
          ref={input2}
          errorMessage={pwdError}
          value={pwd} 
          containerStyle={{width: '80%', marginTop: 20}} 
          placeholder='Inserisci la password' 
          secureTextEntry={true} 
          onChangeText={(str) => {
            setPwd(str)
          }}
        />

        <Button containerStyle={{marginTop: 15}} titleStyle={{fontSize: 20}} size='md' color='success' title='REGISTRATI'
          onPress={() => {
            checkData()
          }}
        />

        <Text onPress={() => {navigation.navigate('Login')}} style={{fontSize: 15, marginTop: 25, color: '#000', fontWeight: 'bold'}}>Gia' iscritto? fai Log-in!</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
    view: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    input: {
        width: '80%'
    }
})

export default App2