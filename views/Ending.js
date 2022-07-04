import {View, AppState} from 'react-native';
import React, {useState, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';

import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Button} from '@rneui/base';

import {clear} from '../state/matchSlice';

const Ending = ({route, navigation}) => {
  const appState = useRef(AppState.currentState);

  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();
  const [finalScore, setFinalScore] = useState(null);
  const [pos, setPos] = useState(0);
  const [scores, setScores] = useState({});
  const [sameScore, setSameScore] = useState(0);
  const [playersAfter, setPlayersAfter] = useState(0);
  const [toggleLoading, setToggleLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const subscriber = firestore()
        .collection('matches')
        .doc(matchData.matchId)
        .onSnapshot(doc => {
          const data = doc.data();
          if (data) {
            let count = 0;
            for (let i = 0; i < data.playersUid.length; i++) {
              if (
                data.scores[data.playersUid[i]].status == 'abandon' ||
                data.scores[data.playersUid[i]].status == 'finish'
              ) {
                count++;
              }

              if (count == data.playersUid.length) {
                setScores(data.scores);
                setFinalScore(() => {
                  return data.scores[auth().currentUser.uid];
                });
                // prepResult(data.scores);
              }
            }
          }
        });

      return () => subscriber();
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (finalScore == null) {
        return;
      }

      const sorted = Object.entries(scores).sort(
        (a, b) => b[1].scored - a[1].scored,
      );

      let tmpPos = 1;

      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i][1].scored != sorted[i - 1][1].scored) {
          tmpPos++;
        }
        if (sorted[i][0] == auth().currentUser.uid) {
          setPos(tmpPos);
          setPlayersAfter(() => {
            return sorted.length - i - 1;
          });
        }

        if (sorted[i][1].scored == finalScore.scored) {
          setSameScore(curr => {
            return curr + 1;
          });
        }
      }

      setSameScore(curr => {
        return curr - 1;
      });

      setToggleLoading(false);
    }, [finalScore, scores]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        console.log(e);
        if (e.data.action.type == 'GO_BACK') {
          navigation.popToTop();
        }
        if (e.data.action.type == 'POP_TO_TOP') {
          navigation.dispatch(e.data.action);
        }
      });
      return () => {
        setToggleLoading(false);
        subscribe();
      };
    }, []),
  );

  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#2289dc',
      }}>
      <Dialog
        isVisible={toggleLoading}
        overlayStyle={{
          backgroundColor: 'none',
          shadowColor: 'rgba(255, 255, 255, 0)',
        }}>
        <Dialog.Loading loadingProps={{size: 50}} />
        <Text h4 h4Style={{color: 'white', width: '100%', textAlign: 'center'}}>
          Attendo gli altri giocatori...
        </Text>
      </Dialog>
      {!toggleLoading && (
        <>
          <Text h3>Indovinando {finalScore.scored} parole</Text>
          <Text style={{marginTop: '2%'}} h2>
            Sei arrivato {pos}°
          </Text>
          {sameScore > 0 ? (
            <Text style={{color: '#222222', fontSize: 20, marginTop: '4%'}}>
              Insieme ad{sameScore > 1 ? ' altri' : ''} {sameScore} giocator
              {sameScore > 1 ? 'i' : 'e'}
            </Text>
          ) : (
            <></>
          )}
          {playersAfter > 0 ? (
            <Text style={{color: '#222222', fontSize: 20}}>
              Hai battuto {playersAfter} giocator{playersAfter > 1 ? 'i' : 'e'}!
            </Text>
          ) : (
            <></>
          )}
          <Button
            title="TORNA ALLA HOMEPAGE"
            buttonStyle={{
              marginTop: '5%',
              backgroundColor: 'green',
            }}
            onPress={() => {
              navigation.popToTop();
            }}
          />
        </>
      )}
    </View>
  );
};

export default Ending;
