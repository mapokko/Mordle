import {ScrollView, View, ToastAndroid} from 'react-native';
import React, {useContext, useState} from 'react';

import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Button, fonts} from '@rneui/base';

import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {useFocusEffect} from '@react-navigation/native';

const PlayersTab = ({RoomContext}) => {
  const con = useContext(RoomContext);
  const [userFriends, setUserFriends] = useState([]);
  const [friendReqs, setFriendReqs] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      firestore()
        .collection('users')
        .where('uid', '==', auth().currentUser.uid)
        .onSnapshot(qs => {
          console.log('from playersTab');
          setUserFriends(qs.docs[0].data().friends);
          setFriendReqs(qs.docs[0].data().friendRequests);
        });
    }, []),
  );

  return (
    <ScrollView>
      {con.waitPlayers.length > 0 ? (
        con.waitPlayers.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomColor: 'grey',
                borderBottomWidth: 1,
              }}>
              <Text
                key={index}
                style={{
                  fontSize: 20,
                  paddingLeft: 10,
                  paddingVertical: 10,
                }}>
                {item}
              </Text>
              {userFriends?.includes(con.waitPlayersUid[index]) ? (
                <Button
                  disabled={true}
                  title="AMICO"
                  containerStyle={{marginRight: '3%'}}
                />
              ) : con.waitPlayersUid[index] == auth().currentUser.uid ? (
                <></>
              ) : friendReqs.includes(con.waitPlayersUid[index]) ? (
                <Button
                  title={'ACCETTA AMICIZIA'}
                  containerStyle={{marginRight: '3%'}}
                  color="success"
                  onPress={() => {
                    con.setLoading(true);
                    firestore()
                      .collection('users')
                      .where('uid', '==', auth().currentUser.uid)
                      .get()
                      .then(qs => {
                        firestore()
                          .collection('users')
                          .doc(qs.docs[0].id)
                          .update({
                            friendRequests: firestore.FieldValue.arrayRemove(
                              con.waitPlayersUid[index],
                            ),
                            friends: firestore.FieldValue.arrayUnion(
                              con.waitPlayersUid[index],
                            ),
                          })
                          .then(() => {
                            con.setLoading(false);
                          });
                      });

                    firestore()
                      .collection('users')
                      .where('uid', '==', con.waitPlayersUid[index])
                      .get()
                      .then(qs => {
                        firestore()
                          .collection('users')
                          .doc(qs.docs[0].id)
                          .update({
                            friends: firestore.FieldValue.arrayUnion(
                              auth().currentUser.uid,
                            ),
                          });
                      });
                  }}
                />
              ) : (
                <Button
                  title="MANDA AMICIZIA"
                  containerStyle={{marginRight: '3%'}}
                  onPress={() => {
                    con.setLoading(true);
                    firestore()
                      .collection('users')
                      .where('uid', '==', con.waitPlayersUid[index])
                      .get()
                      .then(query => {
                        firestore()
                          .collection('users')
                          .doc(query.docs[0].id)
                          .update({
                            friendRequests: firestore.FieldValue.arrayUnion(
                              auth().currentUser.uid,
                            ),
                          })
                          .then(() => {
                            ToastAndroid.show(
                              'Richiesta mandata con successo!',
                              ToastAndroid.SHORT,
                            );
                          })
                          .catch(err => {
                            console.log('IN UPDATE');
                            console.log(err);
                          })
                          .finally(() => {
                            con.setLoading(false);
                          });
                      })
                      .catch(err => {
                        console.log('IN FECTH');
                        console.log(err);
                      })
                      .finally(() => {
                        con.setLoading(false);
                      });
                  }}
                />
              )}
            </View>
          );
        })
      ) : (
        <></>
      )}
    </ScrollView>
  );
};

export default PlayersTab;
