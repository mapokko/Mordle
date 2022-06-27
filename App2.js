import {View, ScrollView, StyleSheet, ToastAndroid} from 'react-native';
import React, {useContext, useState, useEffect, useRef} from 'react';

import {Text} from '@rneui/themed';
import {Input, Icon} from '@rneui/themed';
import {Button} from '@rneui/base';
import {Tooltip} from '@rneui/base';
import {Dialog} from '@rneui/themed';

import auth from '@react-native-firebase/auth';

const App2 = ({navigation}) => {
  const input1 = useRef();
  const input2 = useRef();
  const input3 = useRef();

  const [user, setUser] = useState('');
  const [mail, setMail] = useState('');
  const [pwd, setPwd] = useState('');

  const [userError, setUserError] = useState('');
  const [mailError, setMailError] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [toogleLoading, setToggleLoading] = useState(false);

  const checkData = () => {
    setToggleLoading(true);
    input1.current.clear();
    input2.current.clear();
    input3.current.clear();

    if (user.length === 0) {
      input3.current.shake();
      setUserError('username mancante!');
      setTimeout(() => {
        setUserError('');
      }, 5000);
      setToggleLoading(false);
      return;
    }

    if (mail.length === 0) {
      input1.current.shake();
      setMailError('Email mancante!');
      setTimeout(() => {
        setMailError('');
      }, 5000);
      setToggleLoading(false);

      return;
    }

    if (pwd.length === 0) {
      input2.current.shake();
      setPwdError('Password mancante!');
      setTimeout(() => {
        setPwdError('');
      }, 5000);
      setToggleLoading(false);
      return;
    }

    addUser();
  };

  const addUser = async () => {
    try {
      await auth().createUserWithEmailAndPassword(mail, pwd);
      await auth().currentUser.updateProfile({displayName: user});
      await auth().currentUser.reload();
      setToggleLoading(false);
      setUser('');
      setMail('');
      setPwd('');
      navigation.navigate('Homepage');
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setMailError("email gia' in utilizzo!");
          input1.current.shake();
          break;

        case 'auth/invalid-email':
          setMailError('email non valida!');
          input1.current.shake();
          break;

        case 'auth/weak-password':
          setPwdError('password troppo debole!');
          input1.current.shake();
          break;

        default:
          break;
      }

      setTimeout(() => {
        setMailError('');
      }, 5000);

      setTimeout(() => {
        setPwdError('');
      }, 5000);

      console.log(error.code);
      setToggleLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={s.view}
      keyboardShouldPersistTaps="handled">
      <Dialog
        isVisible={toogleLoading}
        overlayStyle={{
          backgroundColor: 'none',
          width: 0,
          height: 0,
          padding: 0,
          margin: 0,
        }}>
        <Dialog.Loading />
      </Dialog>

      <Text h2 style={{marginBottom: 30, marginTop: 20}}>
        Iscriviti per giocare!
      </Text>

      <Text h4>Nome utente</Text>
      <Input
        ref={input3}
        value={user}
        containerStyle={{width: '80%', marginTop: 20}}
        placeholder="Inserisci il nome utente"
        onChangeText={str => {
          setUser(str);
        }}
        errorMessage={userError}
      />

      <Text h4>Mail</Text>
      <Input
        ref={input1}
        value={mail}
        containerStyle={{width: '80%', marginTop: 10}}
        placeholder="Inserisci la mail"
        onChangeText={str => {
          setMail(str);
        }}
        errorMessage={mailError}
      />

      <Text h4>Password</Text>
      <Input
        ref={input2}
        errorMessage={pwdError}
        value={pwd}
        containerStyle={{width: '80%', marginTop: 20}}
        placeholder="Inserisci la password"
        secureTextEntry={true}
        onChangeText={str => {
          setPwd(str);
        }}
      />

      <Button
        containerStyle={{marginTop: 15}}
        titleStyle={{fontSize: 20}}
        size="md"
        color="success"
        title="REGISTRATI"
        onPress={() => {
          checkData();
        }}
      />

      <Text
        onPress={() => {
          navigation.navigate('Login');
        }}
        style={{
          fontSize: 15,
          marginVertical: 25,
          color: '#000',
          fontWeight: 'bold',
        }}>
        Gia' iscritto? fai Log-in!
      </Text>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  view: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    width: '80%',
  },
});

export default App2;
