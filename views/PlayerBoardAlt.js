import {
  StyleSheet,
  ToastAndroid,
  AppState,
  ImageBackground,
} from 'react-native';
import React, {
  useState,
  useReducer,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import CountDown from 'react-native-countdown-component';
import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Button} from '@rneui/base';
import {View} from 'native-base';

import {next, incScore} from '../state/matchSlice';

import back1 from '../helper/playBack1.png';
import back2 from '../helper/playBack2.png';
import back3 from '../helper/playBack3.png';
import back4 from '../helper/playBack4.png';
import back5 from '../helper/playBack5.png';
import back6 from '../helper/playBack6.png';

const initState = {
  first: '',
  second: '',
  third: '',
  fourth: '',
  fifth: '',
  sixth: '',
  status1: [],
  status2: [],
  status3: [],
  status4: [],
  status5: [],
  status6: [],
  word: '',
};

const translate = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

function reducer(state, action) {
  switch (action.type) {
    case 'init':
      let tmp = {...state};
      tmp.word = action.payload;
      return tmp;

    case 'addfirst':
      return {
        ...state,
        first: state.first.concat(action.payload),
        status1: getStatus(state.word, action.payload, state.first),
      };
    case 'removefirst':
      return {...state, first: state.first.slice(0, -1), status1: []};

    case 'addsecond':
      return {
        ...state,
        second: state.second.concat(action.payload),
        status2: getStatus(state.word, action.payload, state.second),
      };

    case 'removesecond':
      return {...state, second: state.second.slice(0, -1), status2: []};

    case 'addthird':
      return {
        ...state,
        third: state.third.concat(action.payload),
        status3: getStatus(state.word, action.payload, state.third),
      };

    case 'removethird':
      return {...state, third: state.third.slice(0, -1), status3: []};

    case 'addfourth':
      return {
        ...state,
        fourth: state.fourth.concat(action.payload),
        status4: getStatus(state.word, action.payload, state.fourth),
      };

    case 'removefourth':
      return {...state, fourth: state.fourth.slice(0, -1), status4: []};

    case 'addfifth':
      return {
        ...state,
        fifth: state.fifth.concat(action.payload),
        status5: getStatus(state.word, action.payload, state.fifth),
      };

    case 'removefifth':
      return {...state, fifth: state.fifth.slice(0, -1), status5: []};

    case 'addsixth':
      return {
        ...state,
        sixth: state.sixth.concat(action.payload),
        status6: getStatus(state.word, action.payload, state.sixth),
      };

    case 'removesixth':
      return {...state, sixth: state.sixth.slice(0, -1), status6: []};

    default:
      throw new Error();
  }
}

const getStatus = (word, newLetter, current) => {
  if (current.length + 1 < word.length) {
    return [];
  }
  const guess = current.concat(newLetter);
  const dec = decWord(word);
  const sol = new Array(word.length).fill(0);

  for (let i = 0; i < word.length; i++) {
    if (word[i] == guess[i]) {
      sol[i] = 2;
      dec[word[i]] = dec[word[i]] - 1;
    }
  }

  for (let i = 0; i < word.length; i++) {
    if (sol[i] == 0 && dec.hasOwnProperty(guess[i])) {
      if (dec[guess[i]] > 0) {
        sol[i] = 1;
        dec[guess[i]] = dec[guess[i]] - 1;
      }
    }
  }

  return sol;
};

const PlayContext = createContext();

const decWord = w => {
  const deconstruction = {};
  for (let i = 0; i < w.length; i++) {
    if (deconstruction.hasOwnProperty(w[i])) {
      deconstruction[w[i]] = deconstruction[w[i]] + 1;
    } else {
      deconstruction[w[i]] = 1;
    }
  }
  return deconstruction;
};

// an object with every uppercase letter as key
const getUppercaseLetters = () => {
  const letters = {};
  for (let i = 65; i <= 90; i++) {
    letters[String.fromCharCode(i)] = -1;
  }
  return letters;
};

const PlayBoardAlt = ({route, navigation}) => {
  const appState = useRef(AppState.currentState);
  const [background, setBackground] = useState();

  const matchData = useSelector(state => state.match);
  const dispatch = useDispatch();
  const {mode, challengeId, challengeDoc} = route.params;
  const [word, setWord] = useState(challengeDoc.word.toUpperCase());
  const [gameEnd, setGameEnd] = useState(false);
  const [lineNo, setLineNo] = useState(0);
  const [noAction, setNoAction] = useState(false);
  const [size, setSize] = useState(word.length);
  const [tryNo, setTryNo] = useState(0);
  const [triggers, setTriggers] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [alphabetState, setAlphabetState] = useState(getUppercaseLetters());

  const [show, setShow] = useState(true);
  const [stopCountdown, setStopCountdown] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');
  const [dialogColor, setDialogColor] = useState();

  const [state, dispatchLocal] = useReducer(reducer, initState);

  const [toggleExit, setToggleExit] = useState(false);

  const contextData = {
    tryNo,
    word,
    lineNo,
    setLineNo,
    state,
    dispatchLocal,
    dispatch,
    noAction,
    setNoAction,
    size,
    triggers,
    setTriggers,
    alphabetState,
    setAlphabetState,
    stopCountdown,
    setShowDialog,
    setDialogMsg,
    setDialogColor,
    setStopCountdown,
    setGameEnd,
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatchLocal({type: 'init', payload: word});
      switch (Math.floor(Math.random() * 6)) {
        case 0:
          setBackground(back1);
          break;
        case 1:
          setBackground(back2);
          break;
        case 2:
          setBackground(back3);
          break;
        case 3:
          setBackground(back4);
          break;
        case 4:
          setBackground(back5);
          break;
        case 5:
          setBackground(back6);
          break;
      }
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (state[`${translate[lineNo]}`].length == size) {
        setNoAction(true);
      } else if (state[`${translate[lineNo]}`].length < size) {
        setNoAction(false);
      }
    }, [state, lineNo]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscribe = navigation.addListener('beforeRemove', e => {
        e.preventDefault();

        if (
          //   e.data.action.payload?.name == 'Homepage' &&
          e.data.action.type == 'POP_TO_TOP'
        ) {
          console.log('FAILING CHALLENGE');

          firestore()
            .runTransaction(async t => {
              const query = firestore()
                .collection('challenges')
                .doc(challengeId);

              await t.update(query, {result: 'lose'});
            })
            .then(() => {
              console.log('put to lose');
              navigation.dispatch(e.data.action);
            })
            .catch(err => {
              console.log('problem');
              console.log(err);
            });
        } else if (
          e.data.action.payload?.name == 'Challenge' &&
          e.data.action.type == 'REPLACE'
        ) {
          console.log('ENDING CHALLENGE');
          navigation.dispatch(e.data.action);
        } else if (
          e.data.action.payload?.name == 'Ending' &&
          e.data.action.type == 'REPLACE'
        ) {
          console.log('NAVIGATING TO ENDING');
          navigation.dispatch(e.data.action);
        } else {
          setToggleExit(true);
        }
      });
      return () => {
        subscribe();
      };
    }, [challengeId]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const subscription = AppState.addEventListener('change', next => {
        if (
          appState.current.match(/active/) &&
          (next === 'background' || next === 'inactive')
          //    &&
          //   matchData.matchId !== ''
        ) {
          console.log('exited');
          console.log(challengeId);
          navigation.popToTop();
        }
      });
      return () => {
        subscription.remove();
      };
    }, []),
  );

  const endChallenge = () => {
    const result = dialogColor == 'green' ? 'win' : 'lose';
    firestore()
      .runTransaction(async t => {
        const query = firestore().collection('challenges').doc(challengeId);

        await t.update(query, {result: result});
      })
      .then(() => {
        console.log('result updated');
      })
      .catch(err => {
        console.log('result NOT update');
        console.log(err);
      })
      .finally(() => {
        navigation.replace('Challenge', {tab: 1});
      });
  };
  return (
    <ImageBackground source={background} resizeMode="cover">
      <View h="full">
        <PlayContext.Provider value={contextData}>
          <Dialog
            animationType="fade"
            isVisible={showDialog}
            overlayStyle={{
              backgroundColor: dialogColor,
              width: '90%',
            }}>
            <View style={{display: 'flex', alignItems: 'center'}}>
              <Text
                h1
                h1Style={{color: 'white', marginTop: 20, textAlign: 'center'}}>
                {dialogMsg}
              </Text>
              <Text style={{color: 'white', fontSize: 25, marginTop: 30}}>
                La parola era: {word}!
              </Text>
              <Text style={{color: 'white', fontSize: 25}}>
                La sfida e' stata {dialogColor == 'green' ? 'vinta' : 'persa'}!
              </Text>
              {mode == 'challenge' ? (
                <Button
                  title="COMPLETA SFIDA"
                  color="warning"
                  containerStyle={{fontSize: 50, color: 'black', marginTop: 40}}
                  onPress={() => {
                    //   nextWord();
                    endChallenge();
                  }}
                />
              ) : (
                <></>
              )}
            </View>
          </Dialog>

          <Dialog
            animationType="fade"
            isVisible={toggleExit}
            onBackdropPress={() => {
              setToggleExit(false);
            }}>
            <Text style={{color: 'black', fontSize: 16}}>
              Vuoi arrenderti alla sfida?
            </Text>
            <Dialog.Actions>
              <Button
                type="clear"
                title="ESCI"
                onPress={() => {
                  setToggleExit(false);
                  navigation.popToTop();
                }}
              />
              <Button
                type="clear"
                title="ANNULLA"
                onPress={() => {
                  setToggleExit(false);
                }}
              />
            </Dialog.Actions>
          </Dialog>

          <View
            // h="full"
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View>
              <Countdown show={show} time={challengeDoc.time} />
              <InputBoard size={5} />
            </View>
            <Keyboard />
          </View>
        </PlayContext.Provider>
      </View>
    </ImageBackground>
  );
};

const Countdown = ({show, time}) => {
  const con = useContext(PlayContext);
  const matchData = useSelector(state => state.match);
  return (
    <>
      {show == true ? (
        <CountDown
          running={!con.stopCountdown}
          id="dio"
          until={time}
          size={30}
          style={{
            height: '10%',
            marginVertical: '1.5%',
          }}
          digitStyle={{
            backgroundColor: 'white',
            borderRadius: 100,
            height: '100%',
          }}
          separatorStyle={{color: 'rgba(255, 255, 255, 0)'}}
          timeToShow={['M', 'S']}
          timeLabels={{m: '', s: ''}}
          showSeparator
          onPress={() => {
            ToastAndroid.showWithGravity(
              con.word,
              ToastAndroid.LONG,
              ToastAndroid.TOP,
            );
          }}
          onFinish={() => {
            con.setDialogColor('red');
            con.setDialogMsg('TEMPO SCADUTO!');
            con.setShowDialog(true);
            // if (matchData.position == matchData.words.length) {
            //   con.setGameEnd(true);
            // }
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};

const InputBoard = () => {
  return (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginHorizontal: '5%',
        borderRadius: 10,
        paddingVertical: '1%',
        // width: '100%',
      }}>
      <SingleRow tryPos={0} />
      <SingleRow tryPos={1} />
      <SingleRow tryPos={2} />
      <SingleRow tryPos={3} />
      <SingleRow tryPos={4} />
      <SingleRow tryPos={5} />
    </View>
  );
};

const SingleRow = ({tryPos}) => {
  const con = useContext(PlayContext);
  const [colorArray, setColorArray] = useState(['', '', '', '', '']);

  useFocusEffect(
    React.useCallback(() => {
      setColorArray(con.state[`status${tryPos + 1}`]);
      const statusArray = con.state[`status${tryPos + 1}`];

      const letterStatus = {};

      for (let i = 0; i < con.state[translate[tryPos]].length; i++) {
        const letter = con.state[translate[tryPos]][i];
        letterStatus[letter] = con.alphabetState[letter];
      }
      console.log('PRIMA');
      console.log(letterStatus);

      for (let i = 0; i < statusArray.length; i++) {
        const letter = con.state[translate[tryPos]][i];
        if (letterStatus[letter] < statusArray[i]) {
          letterStatus[letter] = statusArray[i];
        }
      }
      console.log('DOPO');
      console.log(letterStatus);
      con.setAlphabetState(prev => {
        return {
          ...prev,
          ...letterStatus,
        };
      });
    }, [con.triggers[tryPos]]),
  );

  const setColor = (i, c) => {
    setColorArray(curr => {
      curr[i] = c;
      return curr;
    });
  };

  return (
    <View
      style={{
        marginVertical: '2%',
        // width: '95%',
        marginHorizontal: '2%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
      }}>
      {[...Array(con.size).keys()].map((value, index) => {
        const guess = con.state[`${translate[tryPos]}`];
        let lett;
        if (guess.length < index + 1) {
          lett = '';
        } else {
          lett = guess.charAt(index);
        }
        return (
          <LetterInput
            key={index}
            lett={lett}
            trigger={con.triggers[tryPos]}
            color={colorArray[index]}
          />
        );
      })}
    </View>
  );
};

const LetterInput = ({lett, trigger, color}) => {
  const con = useContext(PlayContext);

  const getColor = v => {
    switch (v) {
      case 0:
        return 'gray';
        break;
      case 2:
        return 'green';
        break;
      case 1:
        return 'yellow';
        break;
    }
  };

  return (
    <Text
      style={{
        height: '100%',
        width: '14%',
        marginHorizontal: '2%',
        backgroundColor: trigger ? getColor(color) : 'white',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 35,
      }}>
      {lett}
    </Text>
  );
};

const alphArr = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const Keyboard = () => {
  const con = useContext(PlayContext);
  const matchData = useSelector(state => state.match);

  const removeLetter = () => {
    const k = `remove${translate[con.lineNo]}`;
    con.dispatchLocal({type: k});
  };

  const confirm = () => {
    con.setTriggers(curr => {
      curr[con.lineNo] = true;
      return curr;
    });
    if (con.state[`${translate[con.lineNo]}`] == con.word) {
      //   con.dispatch(incScore());
      con.setStopCountdown(true);
      con.setDialogMsg('INDOVINATO!');
      con.setDialogColor('green');
      con.setShowDialog(true);
    } else if (con.lineNo == 5) {
      con.setStopCountdown(true);
      con.setDialogMsg('PAROLA NON TROVATA!');
      con.setDialogColor('red');
      con.setShowDialog(true);
    } else {
      con.setLineNo(con.lineNo + 1);
    }
    // if (matchData.position == matchData.words.length) {
    //   con.setGameEnd(true);
    // }
  };
  return (
    <View
      style={{
        width: '95%',
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <Button
          raised={true}
          size="lg"
          color="error"
          title="ELIMINA"
          titleStyle={{fontSize: 20}}
          onPress={() => {
            removeLetter();
          }}
        />
        <Button
          disabled={!con.noAction}
          raised={true}
          size="lg"
          color="success"
          title="INDOVINA"
          titleStyle={{fontSize: 20}}
          onPress={() => {
            confirm();
          }}
        />
      </View>
      <View style={{marginVertical: '4%'}}>
        {alphArr.map((val, index) => {
          return (
            <View
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                // width: '100%',
                marginBottom: '1%',
              }}>
              {val.map((l, i) => {
                return <Letter l={l} key={i} />;
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const Letter = ({l}) => {
  const con = useContext(PlayContext);
  const [color, setColor] = useState('white');

  const addLetter = l => {
    if (!con.noAction) {
      const k = `add${translate[con.lineNo]}`;
      con.dispatchLocal({type: k, payload: l});
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      switch (con.alphabetState[l]) {
        case -1:
          setColor('white');
          break;
        case 0:
          setColor('gray');
          break;
        case 2:
          setColor('green');
          break;
        case 1:
          setColor('yellow');
          break;
        default:
          setColor('red');
          break;
      }
    }, [con.alphabetState[l]]),
  );
  return (
    <Text
      style={{
        fontSize: 27,
        marginHorizontal: '0.5%',
        color: 'black',
        padding: '1%',
        borderWidth: 1,
        borderRadius: 5,
        width: '9%',
        textAlign: 'center',
        backgroundColor: color,
      }}
      onPress={() => {
        if (con.alphabetState[l] != 0) {
          addLetter(l);
        }
      }}>
      {l}
    </Text>
  );
};

export default PlayBoardAlt;
