import {View, ScrollView, Keyboard, ToastAndroid} from 'react-native';
import React, {useEffect, useState} from 'react';
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
  const [username, setUsername] = useState(route.params.username);
  const [editUsername, setEditUsername] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const [firstCount, setFirstCount] = useState(0);
  const [created, setCreated] = useState(0);
  const [played, setPlayed] = useState(0);
  const [abandoned, setAbandoned] = useState(0);

  const [winChall, setWinChall] = useState(0);
  const [loseChall, setLoseChall] = useState(0);
  const [receivedChall, setReceivedChall] = useState(0);
  const [sentChall, setSentChall] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setLoading2(true);
      const prom1 = firestore()
        .collection('challenges')
        .where('from', '==', route.params.realUid)
        .get()
        .then(qs2 => {
          setSentChall(qs2.docs.length);
        });

      const prom2 = firestore()
        .collection('challenges')
        .where('to', '==', route.params.realUid)
        .get()
        .then(qs2 => {
          setReceivedChall(qs2.docs.length);
          let winCount = 0;
          let loseCount = 0;
          for (let i = 0; i < qs2.docs.length; i++) {
            if (qs2.docs[i].data().result == 'win') {
              winCount++;
            } else if (qs2.docs[i].data().result == 'lose') {
              loseCount++;
            }
          }

          setWinChall(winCount);
          setLoseChall(loseCount);

          Promise.all([prom1, prom2]).then(() => {
            setLoading2(false);
          });
        });
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      console.log(route.params.uid);

      setLoading(true);
      const prom1 = firestore()
        .collection('matches')
        .where('canc', '==', false)
        .where('play', '==', false)
        .where('finish', '==', true)
        .where('playersUid', 'array-contains', route.params.uid)
        .get()
        .then(qs => {
          let tmp = [];
          let createdCount = 0;
          let abandonCount = 0;
          for (let i = 0; i < qs.docs.length; i++) {
            const status = qs.docs[i].data().scores[route.params.uid].status;
            if (status == 'finish') {
              tmp.push(qs.docs[i]);
            } else if (status == 'abandon') {
              abandonCount++;
            }
            if (qs.docs[i].data().hostUid == route.params.uid) {
              createdCount++;
            }
          }
          setPlayed(tmp.length);
          setAbandoned(abandonCount);
          setCreated(createdCount);
          setupData(tmp);
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
        // console.log(matches.docs);
      });
    }, []),
  );

  const setupData = matches => {
    let first = 0;
    const uid = route.params.uid;
    for (let i = 0; i < matches.length; i++) {
      let podium = matches[i].data().podium;
      if (podium.indexOf(uid) == 0) {
        first++;
      }
    }

    setFirstCount(first);
  };

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

    setUsername(auth().currentUser.displayName);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <Loading loading={loading || loading2} />
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
              route.params.uid == auth().currentUser.uid ? (
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
              ) : (
                <></>
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
          {route.params.uid == auth().currentUser.uid ? (
            <View style={{paddingHorizontal: '2%'}}>
              <Text h4 h4Style={{fontSize: 16}}>
                Data creazione
              </Text>
              <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
                {auth().currentUser.metadata.creationTime.split('T')[0]}
              </Text>
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>
      <View style={{marginTop: '5%', paddingHorizontal: '3%'}}>
        <Text h4>Partite</Text>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite vinte
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
            {firstCount}
          </Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite create
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>{created}</Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite giocate
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>{played}</Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Partite abbandonate
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
            {abandoned}
          </Text>
        </View>
      </View>

      <View style={{marginTop: '5%', paddingHorizontal: '3%'}}>
        <Text h4>Sfide</Text>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Sfide vinte
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
            {winChall}
          </Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Sfide perse
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
            {loseChall}
          </Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Sfide ricevute
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
            {receivedChall}
          </Text>
        </View>
        <View style={{paddingHorizontal: '2%', marginVertical: '1%'}}>
          <Text h4 h4Style={{fontSize: 16}}>
            Sfide lanciate
          </Text>
          <Text style={{fontSize: 22, paddingHorizontal: '2%'}}>
            {sentChall}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Statistics;
