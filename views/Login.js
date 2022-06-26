import {View, ScrollView, StyleSheet, ToastAndroid} from 'react-native';
import React, {useState, useRef, useContext, useEffect} from 'react';

import {Text} from '@rneui/themed';
import {Input} from '@rneui/themed';
import {Button} from '@rneui/base';
import {Dialog} from '@rneui/themed';

import auth from '@react-native-firebase/auth';
import {
  StackActions,
  useIsFocused,
  useFocusEffect,
} from '@react-navigation/native';

import {useSelector, useDispatch} from 'react-redux';

import {UserContext} from '../App';
import {setUsername, setMailState, setUid} from '../state/userSlice';

const Login = ({navigation}) => {
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();

  const input1 = useRef();
  const input2 = useRef();

  const [mail, setMail] = useState('');
  const [pwd, setPwd] = useState('');

  const [mailError, setMailError] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [toogleLoading, setToggleLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkStatus = u => {
        if (u) {
          navigation.navigate('Homepage');
        }
      };
      const subscriber = auth().onAuthStateChanged(checkStatus);
      return subscriber; // unsubscribe on unmount
    }),
  );

  const checkData = () => {
    setToggleLoading(true);
    input1.current.clear();
    input2.current.clear();

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

    login();
  };

  const login = async () => {
    auth()
      .signInWithEmailAndPassword(mail, pwd)
      .then(() => {
        ToastAndroid.show('Login avvenuto con successo!', ToastAndroid.LONG);
        console.log('LOGGED IN');
        setToggleLoading(false);
        setMail('');
        setPwd('');
        navigation.navigate('Homepage');
      })
      .catch(err => {
        switch (err.code) {
          case 'auth/invalid-email':
            input1.current.shake();
            setMailError('email non valida!');
            break;

          case 'auth/user-not-found':
            input1.current.shake();
            setMailError('email non esistente!');
            break;

          case 'auth/wrong-password':
            input2.current.shake();
            setPwdError('password errata!');
            break;
          default:
            input1.current.shake();
            input2.current.shake();
            setMailError('Errore!');
            setPwdError('Errore!');
            break;
        }

        setTimeout(() => {
          setMailError('');
        }, 5000);

        setTimeout(() => {
          setPwdError('');
        }, 5000);
      });
    setToggleLoading(false);
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
      <Text h2 style={{marginBottom: 55, marginTop: 40}}>
        Accedi!
      </Text>
      <Text h4>Mail</Text>
      <Input
        ref={input1}
        errorMessage={mailError}
        containerStyle={{width: '80%', marginTop: 20}}
        placeholder="Inserisci la mail"
        onChangeText={txt => {
          setMail(txt);
        }}
      />

      <Text h4 style={{marginTop: 30}}>
        Password
      </Text>
      <Input
        ref={input2}
        errorMessage={pwdError}
        containerStyle={{width: '80%', marginTop: 20}}
        placeholder="Inserisci la password"
        secureTextEntry={true}
        onChangeText={txt => {
          setPwd(txt);
        }}
      />

      <Button
        containerStyle={{marginTop: 15}}
        titleStyle={{fontSize: 20}}
        size="md"
        color="success"
        title="LOG IN"
        onPress={() => {
          checkData();
        }}
      />

      <Text
        onPress={() => {
          navigation.navigate('Register');
        }}
        style={{
          fontSize: 15,
          marginTop: 25,
          color: '#000',
          fontWeight: 'bold',
        }}>
        Non hai un account? Registrati!
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

export default Login;
