import {View, ScrollView, StyleSheet} from 'react-native';
import React, {useState} from 'react';

import {Button, fonts} from '@rneui/base';
import {Input, Text, Card} from '@rneui/themed';

import {useFocusEffect} from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';

const SearchMatch = () => {
  const [matchList, setMatchList] = useState([]);

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
          },
          err => {
            console.log('IN FETCH LIST ERROR');
            console.log(err);
          },
        );

      //   firestore()
      //     .collection('matches')
      //     .where('wait', '==', true)
      //     .where('canc', '==', false)
      //     .where('play', '==', false)
      //     .get()
      //     .then(qs => {
      //       //   console.log(qs.docs);
      //       setMatchList(qs.docs);
      //     })
      //     .catch(err => {
      //       console.log('IN FETCH LIST ERROR');
      //       console.log(err);
      //     });

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
                <Button
                  icon={{name: 'sign-in', type: 'font-awesome', reverse: true}}
                  buttonStyle={{backgroundColor: 'white'}}
                  onPress={() => {}}
                />
              </View>
            </Card>
          );
        })
      ) : (
        <></>
      )}
      <Button
        title="some some"
        onPress={() => {
          console.log(matchList);
        }}
      />
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
