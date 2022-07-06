import {View, AppState} from 'react-native';
import React, {useState, useRef} from 'react';

import {StackActions, useFocusEffect} from '@react-navigation/native';
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
  const [scores, setScores] = useState({});
  const [toggleLoading, setToggleLoading] = useState(true);
  const [better, setBetter] = useState(0);
  const [worse, setWorse] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const subscriber = firestore()
        .collection('matches')
        .doc(matchData.matchId)
        .onSnapshot(doc => {
          const data = doc.data();
          if (data) {
            if (Object.keys(data.scores).length == data.playersUid.length) {
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
      // console.log(finalScore);
      // console.log(scores);

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

      setBetter(betterScore);
      setWorse(lowerScore);

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
          <Text style={{marginBottom: '5%'}} h1>
            Sei arrivato {better + 1}°
          </Text>
          {worse > 0 ? (
            <>
              <Text style={{color: '#222222', fontSize: 20}}>
                Hai battuto {worse} giocator{worse > 1 ? 'i' : 'e'}!
              </Text>
            </>
          ) : (
            <></>
          )}
          <Text style={{color: '#222222', fontSize: 20, marginTop: '2%'}}>
            Hai indovinato {finalScore?.scored} parole in {finalScore.time}{' '}
            secondi!
          </Text>
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
