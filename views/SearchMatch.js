import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';
import {shallowEqual} from 'react-redux';

import {Text, Card, Icon, Dialog} from '@rneui/themed';
import {Button, color, fonts} from '@rneui/base';

import {Input, Box} from 'native-base';

const SearchMatch = ({navigation}) => {
  const [matchList, setMatchList] = useState([]);
  const [filteredMatchList, setFilteredMatchList] = useState([]);
  const [search, setSearch] = useState('');

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

  const filterResults = () => {
    setFilteredMatchList([]);
    if (search.length > 0) {
      matchList.forEach((value, index) => {
        if (value.data().hostName.includes(search)) {
          setFilteredMatchList([...filteredMatchList, value]);
        }
      });
    } else {
      setFilteredMatchList(matchList);
    }
    console.log(filteredMatchList.length);
  };

  useFocusEffect(
    React.useCallback(() => {
      setFilteredMatchList([]);
      if (search.length > 0) {
        const tmp = [];
        matchList.forEach((value, index) => {
          console.log(value.data().hostName);
          if (
            value.data().hostName.toLowerCase().includes(search.toLowerCase())
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

  return (
    <ScrollView>
      <Dialog
        isVisible={loading}
        overlayStyle={{
          backgroundColor: 'none',
          shadowColor: 'rgba(255, 255, 255, 0)',
        }}>
        <Dialog.Loading />
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
          size="xl"
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
                  if (value._data.playerNum > value._data.playersUid.length) {
                    navigation.replace('Playerroom', {
                      id: value.id,
                      pNum: value._data.playerNum,
                      wNum: value._data.words[0].length,
                      wLen: value._data.words.length,
                    });
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
                  <Text h4 style={{marginRight: 20}}>
                    {value._data.playersUid.length} / {value._data.playerNum}
                  </Text>
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
