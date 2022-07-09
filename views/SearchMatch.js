import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import React, {useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';
import {shallowEqual} from 'react-redux';

import {Text, Card, Icon, Dialog, Divider} from '@rneui/themed';
import {Button, color, fonts} from '@rneui/base';

import {Input, Box, WarningOutlineIcon, FormControl} from 'native-base';

const SearchMatch = ({navigation}) => {
  const [matchList, setMatchList] = useState([]);
  const [filteredMatchList, setFilteredMatchList] = useState([]);
  const [search, setSearch] = useState('');

  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [inputPwd, setInputPwd] = useState('');
  const [validPwd, setValidPwd] = useState(true);
  const [matchIndex, setMatchIndex] = useState();

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      console.log('in initial fetch');

      const subscribe = firestore()
        .collection('matches')
        .where('wait', '==', true)
        .where('canc', '==', false)
        .where('play', '==', false)
        .onSnapshot(
          qs => {
            //   console.log(qs.docs);
            setMatchList(qs.docs);
            setFilteredMatchList(qs.docs);
            setLoading(false);
          },
          err => {
            console.log('IN FETCH LIST ERROR');
            console.log(err);
          },
        );

      return () => {
        subscribe();
      };
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      setFilteredMatchList([]);
      if (search.length > 0) {
        const tmp = [];
        matchList.forEach((value, index) => {
          if (
            value
              .data()
              .hostName.toLowerCase()
              .startsWith(search.toLowerCase(), 0)
          ) {
            tmp.push(value);
          }
        });
        setFilteredMatchList(tmp);
      } else {
        setFilteredMatchList(matchList);
      }
    }, [search]),
  );

  const withPwd = () => {
    const match = filteredMatchList[matchIndex];
    console.log(match.data().password);
    if (inputPwd == match.data().password) {
      enterRoom(match);
    } else {
      setInputPwd('');
      setValidPwd(false);
      setTimeout(() => {
        setValidPwd(true);
      }, 4000);
    }
  };

  const enterRoom = value => {
    if (value._data.playerNum > value._data.playersUid.length) {
      navigation.replace('Playerroom', {
        id: value.id,
        pNum: value._data.playerNum,
        wNum: value._data.words[0].length,
        wLen: value._data.words.length,
      });
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <Dialog
        isVisible={loading}
        overlayStyle={{
          backgroundColor: 'none',
          shadowColor: 'rgba(255, 255, 255, 0)',
        }}>
        <Dialog.Loading />
      </Dialog>
      <Dialog
        isVisible={showPwdDialog}
        onBackdropPress={() => {
          setShowPwdDialog(false);
        }}
        animationType="fade">
        <Dialog.Title
          titleStyle={{textAlign: 'center', color: 'black'}}
          title="Inserisci la password della partita"
        />
        <Divider style={{marginVertical: '5%'}} />
        <FormControl isInvalid={!validPwd}>
          <Input
            placeholder="Password"
            value={inputPwd}
            type="password"
            size={'xl'}
            onChangeText={txt => {
              setInputPwd(txt);
            }}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="md" />}>
            Password errata
          </FormControl.ErrorMessage>
        </FormControl>
        <Button
          containerStyle={{marginTop: '10%'}}
          title="ENTRA"
          onPress={() => {
            Keyboard.dismiss();
            withPwd();
          }}
        />
      </Dialog>
      <Text h3 style={{width: '100%', textAlign: 'center', paddingTop: 10}}>
        Partite in attesa
      </Text>

      <Box alignItems="center" marginTop="3%">
        <Input
          value={search}
          onChangeText={text => {
            setSearch(text);
          }}
          size="lg"
          placeholder="Cerca host"
          w="100%"
          maxWidth="300px"
          variant="rounded"
          InputRightElement={
            <Icon
              name="close-circle-outline"
              type="ionicon"
              style={{marginRight: '3%'}}
              iconStyle={{color: '#808080', borderRadius: 50}}
              onPress={() => setSearch('')}
            />
          }
        />
      </Box>

      {filteredMatchList.length > 0 ? (
        filteredMatchList.map((value, index) => {
          return (
            <Card key={index} containerStyle={{padding: 0}}>
              <TouchableOpacity
                onPress={() => {
                  if (value.data().password != '') {
                    setMatchIndex(index);
                    setShowPwdDialog(true);
                  } else {
                    enterRoom(value);
                  }
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{paddingLeft: 10, paddingVertical: 10}}>
                    <Text style={styles.hostCardText}>
                      Host: {value._data.hostName}
                    </Text>
                    <Text style={styles.cardText}>
                      Numero giocatori: {value._data.playerNum}
                    </Text>
                    <Text style={styles.cardText}>
                      Numero parole: {value._data.words[0].length}
                    </Text>
                    <Text style={styles.cardText}>
                      Lunghezza parole: {value._data.words.length}
                    </Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '30%',
                      justifyContent: 'flex-end',
                    }}>
                    {value.data().password != '' ? (
                      <Icon
                        size={30}
                        name="lock-closed"
                        type="ionicon"
                        style={{marginRight: '15%'}}
                      />
                    ) : (
                      <Icon
                        size={30}
                        name="lock-open"
                        type="ionicon"
                        style={{marginRight: '15%'}}
                      />
                    )}
                    <View
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '10%',
                      }}>
                      <Text>giocatori</Text>
                      <Text h4>
                        {value._data.playersUid.length} /{' '}
                        {value._data.playerNum}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          );
        })
      ) : (
        <Icon
          name="sad-outline"
          type="ionicon"
          containerStyle={{marginTop: 70}}
          iconStyle={{fontSize: 100, color: 'gray'}}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardText: {
    color: 'black',
    fontSize: 18,
  },
  hostCardText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SearchMatch;
