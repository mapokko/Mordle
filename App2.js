import { View, StyleSheet } from 'react-native'
import React from 'react'

import { Text } from "@rneui/themed";
import { Input } from "@rneui/themed";
import { Button } from "@rneui/base";

const App2 = ({navigation}) => {
  return (
    <View style={s.view}>
        <Text h2 style={{marginBottom: 55, marginTop: 40}}>Iscriviti per giocare!</Text>
        <Text h4>Mail</Text>
        <Input containerStyle={{width: '80%', marginTop: 20}} placeholder='Inserisci la mail'/>

        <Text h4 style={{marginTop: 30}}>Password</Text>
        <Input containerStyle={{width: '80%', marginTop: 20}} placeholder='Inserisci la password' secureTextEntry={true}/>

        <Button containerStyle={{marginTop: 15}} titleStyle={{fontSize: 20}} size='md' color='success' title='REGISTRATI'
          onPress={() => {
            console.log('cliccalto')
          }}
        />

        <Text onPress={() => {navigation.navigate('Login')}} style={{fontSize: 15, marginTop: 25, color: '#000', fontWeight: 'bold'}}>Gia' iscritto? fai Log-in!</Text>
    </View>
  )
}

const s = StyleSheet.create({
    view: {
        display: 'flex',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    input: {
        width: '80%'
    }
})

export default App2