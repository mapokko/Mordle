import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

import {Button, color, fonts} from '@rneui/base';
import {Input, Text, Card, Icon} from '@rneui/themed';

import {useFocusEffect} from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';
import {shallowEqual} from 'react-redux';

const SearchMatch = ({navigation}) => {
  const [matchList, setMatchList] = useState([]);
  const [matchIds, setMatchIds] = useState([]);

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
            let tmp = [];
            qs.docs.forEach((value, index) => {
              tmp.push(value.id);
            });
            setMatchIds(tmp);
          },
          err => {
            console.log('IN FETCH LIST ERROR');
            console.log(err);
          },
        );

      return subscribe;
    }, []),
  );

  return (
    <ScrollView>
      <Text h3 style={{width: '100%', textAlign: 'center', paddingTop: 10}}>
        Partite in attesa
      </Text>

      {matchList.length > 0 ? (
        matchList.map((value, index) => {
          return (
            <Card key={index} containerStyle={{padding: 0}}>
              <TouchableOpacity
                onPress={() => {
                  if (value._data.playerNum > value._data.playersUid.length) {
                    navigation.replace('Playerroom', {
                      id: matchIds[index],
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
