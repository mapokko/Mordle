import { View, ScrollView, StyleSheet, ToastAndroid } from 'react-native'
import React from 'react'

import { Text } from "@rneui/themed";
import { Input } from "@rneui/themed";
import { Button } from "@rneui/base";

const Login = ({navigation}) => {
  return (
    <ScrollView contentContainerStyle={s.view}>
        <Text h2 style={{marginBottom: 55, marginTop: 40}}>Accedi!</Text>
        <Text h4>Mail</Text>
        <Input containerStyle={{width: '80%', marginTop: 20}} placeholder='Inserisci la mail'/>

        <Text h4 style={{marginTop: 30}}>Password</Text>
        <Input containerStyle={{width: '80%', marginTop: 20}} placeholder='Inserisci la password' secureTextEntry={true}/>

        <Button containerStyle={{marginTop: 15}} titleStyle={{fontSize: 20}} size='md' color='success' title='LOG IN'
          onPress={() => {
            ToastAndroid.show('te sogni..', ToastAndroid.LONG)
          }}
        />

        <Text onPress={() => {navigation.navigate('Register')}} style={{fontSize: 15, marginTop: 25, color: '#000', fontWeight: 'bold'}}>Non hai un account? Registrati!</Text>
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

export default Login