import { View, ScrollView, StyleSheet, ToastAndroid } from 'react-native'
import React, {useContext, useState, useEffect, useRef} from 'react'

import { Text } from "@rneui/themed";
import { Input, Icon } from "@rneui/themed";
import { Button } from "@rneui/base";
import { Tooltip } from '@rneui/base';

import auth from '@react-native-firebase/auth';

import { UserContext } from './App';


const App2 = ({navigation}) => {
  const con = useContext(UserContext)

  const input1 = useRef()
  const input2 = useRef()
  const input3 = useRef()

  const [mail, setMail] = useState('')
  const [pwd, setPwd] = useState('')

  const [mailError, setMailError] = useState('')
  const [pwdError, setPwdError] = useState('')

  const checkData = () => {
    input1.current.clear()
    input2.current.clear()

    if(mail.length === 0){
      input1.current.shake()
      setMailError('Email mancante!')
      setTimeout(()=>{
        setMailError('')
      }, 5000)
      return
    }

    if(pwd.length === 0){
      input2.current.shake()
      setPwdError('Password mancante!')
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
      ToastAndroid.show('Utente e username!', ToastAndroid.LONG)
      navigation.navigate('Homepage')
    })
    .catch((error)=>{
      switch (error.code) {
        case 'auth/email-already-in-use':
          setMailError("email gia' in utilizzo!")
          input1.current.shake()
          break;
        
        case 'auth/invalid-email':
          setMailError("email non valida!")
          input1.current.shake()
          break;

        case 'auth/weak-password':
          setPwdError("password troppo debole!")
          input1.current.shake()
          break;
      
        default:
          break;
      }

      setTimeout(()=>{
        setMailError('')
      }, 5000)

      setTimeout(()=>{
        setPwdError('')
      }, 5000)

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

        <Text onPress={() => {navigation.navigate('Login')}} style={{fontSize: 15, marginVertical: 25, color: '#000', fontWeight: 'bold'}}>Gia' iscritto? fai Log-in!</Text>
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