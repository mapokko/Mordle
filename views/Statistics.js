import {View, ScrollView, Keyboard, ToastAndroid} from 'react-native';
import React, {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Button, fonts} from '@rneui/base';
import {Input, Text, Icon} from '@rneui/themed';
import {Overlay, Dialog} from '@rneui/themed';
import {Badge} from '@rneui/themed';

import {useFocusEffect} from '@react-navigation/native';

import Loading from '../components/Loading';

const Statistics = ({route}) => {
  const [matches, setMatches] = useState({});
  const [user, setUser] = useState();
  const [username, setUsername] = useState(auth().currentUser.displayName);
  const [editUsername, setEditUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      const prom1 = firestore()
        .collection('matches')
        .where('playersUid', 'array-contains', route.params.uid)
        .get()
        .then(query => {
          setMatches(query.docs);
        });

      const prom2 = firestore()
        .collection('users')
        .where('uid', '==', route.params.uid)
        .get()
        .then(qs => {
          setUser(qs.docs[0]);
        });

      Promise.all([prom1, prom2]).then(() => {
        setLoading(false);
        console.log(matches);
      });
    }, []),
  );

  const updateUsername = async newName => {
    try {
      await auth().currentUser.updateProfile({displayName: newName});
      await auth().currentUser.reload();
    } catch (error) {
      console.log('failed to update displayname');
      console.log(error);
    }

    await firestore()
      .runTransaction(async t => {
        const query = firestore().collection('users').doc(user.id);

        await t.update(query, {
          username: newName,
          usernameLower: newName.toLowerCase(),
        });
      })
      .catch(err => {
        ToastAndroid.show('Nome non aggiornato..', ToastAndroid.LONG);
        console.log(err);
      });

    // await firestore()
    //   .collection('users')
    //   .doc(user.id)
    //   .update({username: newName, usernameLower: newName.toLowerCase()})
    //   .catch(err => {
    //     ToastAndroid.show('Nome non aggiornato..', ToastAndroid.LONG);
    //     console.log(err);
    //   });

    setUsername(auth().currentUser.displayName);
  };

  const getNumMatches = position => {
    const sorted = Object.entries(scores).sort(
      (a, b) => b[1].scored - a[1].scored,
    );
    let betterScore = 0;
    let lowerScore = 0;
    sorted.find((val, index) => {
      if (val[1].scored == finalScore.scored) {
        betterScore = index;
        return true;
      } else {
        return false;
      }
    });

    sorted.find((val, index) => {
      if (val[1].scored < finalScore.scored) {
        lowerScore = sorted.length - index;
        return true;
      } else {
        return false;
      }
    });

    let filtered = sorted.filter((val, index) => {
      if (val[1].scored == finalScore.scored) {
        return true;
      } else {
        return false;
      }
    });

    filtered = filtered.sort((a, b) => a[1].time - b[1].time);
    let finalIndex;
    filtered.find((val, index) => {
      if (val[0] == auth().currentUser.uid) {
        finalIndex = index;
        return true;
      } else {
        return false;
      }
    });
    betterScore = betterScore + finalIndex;
    lowerScore = lowerScore + filtered.length - finalIndex - 1;
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: '5%',
        // display: 'flex',
        // alignItems: 'center',
      }}
      keyboardShouldPersistTaps="always">
      <Button
        onPress={() => {
          console.log(matches.length);
        }}
      />
      <Loading loading={loading} />
      <Text
        h2
        h2Style={{
          textAlign: 'center',
          textDecorationLine: 'underline',
        }}>
        Profilo
      </Text>
      <View style={{marginTop: '5%', paddingHorizontal: '3%'}}>
        <Text h4>Dati</Text>
        <View
          style={{
            marginTop: '3%',
            paddingVertical: '2%',
          }}>
          <Input
            style={{fontSize: 20}}
            value={username}
            disabled={!editUsername}
            inputContainerStyle={{borderWidth: 1, borderRadius: 80}}
            label="Nome utente"
            labelStyle={{color: 'black'}}
            rightIcon={
              editUsername ? (
                <Icon
                  iconStyle={{borderRadius: 20}}
                  name="content-save"
                  type="material-community"
                  color="#000000"
                  size={30}
                  onPress={() => {
                    Keyboard.dismiss();
                    setLoading(true);
                    const prom = updateUsername(username);

                    Promise.all([prom]).then(() => {
                      setEditUsername(false);
                      setLoading(false);
                    });
                  }}
                />
              ) : (
                <Icon
                  iconStyle={{borderRadius: 20}}
                  name="pencil"
                  type="material-community"
                  color="#848b92"
                  size={30}
                  onPress={() => {
                    setEditUsername(true);
                  }}
                />
              )
            }
            onChangeText={txt => {
              setUsername(txt);
            }}
          />
          <Input
            style={{fontSize: 20}}
            value={user?.data().mail}
            disabled={true}
            inputContainerStyle={{borderWidth: 1, borderRadius: 80}}
            label="E-mail utente"
            labelStyle={{color: 'black'}}
          />
          <View style={{paddingHorizontal: '2%'}}>
            <Text h4 h4Style={{fontSize: 16}}>
              Data creazione
            </Text>
            <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
              {auth().currentUser.metadata.creationTime.split('T')[0]}
            </Text>
          </View>
        </View>
      </View>
      <View style={{marginTop: '5%', paddingHorizontal: '3%'}}>
        <Text h4>Partite</Text>
        <View style={{paddingHorizontal: '2%', marginVertical: '3%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite vinte
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>10</Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '3%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite arrivato secondo
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>10</Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '3%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite arrivato terzo
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>10</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Statistics;
