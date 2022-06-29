import {View, StyleSheet, ToastAndroid} from 'react-native';
import React, {
  useState,
  useReducer,
  useEffect,
  createContext,
  useContext,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';

import CountDown from 'react-native-countdown-component';
import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';
import {Button} from '@rneui/base';

import {reset, init, del, inc} from '../state/wordSlice';
import {TextComponent} from 'react-native';

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
      sol[i] = 1;
      dec[word[i]] = dec[word[i]] - 1;
    }
  }

  for (let i = 0; i < word.length; i++) {
    if (sol[i] == 0 && dec.hasOwnProperty(guess[i])) {
      if (dec[guess[i]] > 0) {
        sol[i] = 2;
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

const PlayBoard = ({navigation}) => {
  const [word, setWord] = useState('nano'.toUpperCase());
  const [lineNo, setLineNo] = useState(0);
  const [noAction, setNoAction] = useState(false);
  const [size, setSize] = useState(word.length);
  const [show, setShow] = useState(true);
  const [tryNo, setTryNo] = useState(0);
  const [triggers, setTriggers] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [state, dispatchLocal] = useReducer(reducer, initState);
  const matchData = useSelector(state => state.match);

  const contextData = {
    tryNo,
    word,
    lineNo,
    setLineNo,
    state,
    dispatchLocal,
    noAction,
    setNoAction,
    size,
    triggers,
    setTriggers,
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatchLocal({type: 'init', payload: word});
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

  return (
    <View>
      <PlayContext.Provider value={contextData}>
        <Countdown show={show} setShow={setShow} />
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: show ? '86%' : '100%',
          }}>
          <InputBoard size={5} />
          <Keyboard />
        </View>
      </PlayContext.Provider>
    </View>
  );
};

const Countdown = ({show, setShow}) => {
  const con = useContext(PlayContext);
  return (
    <>
      {show == true ? (
        <CountDown
          id="dio"
          until={200}
          onFinish={() => {
            console.log('finish');
          }}
          size={30}
          digitStyle={{backgroundColor: '#f2f2f2', height: 40}}
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
        backgroundColor: '#444444',
        margin: 10,
        borderRadius: 10,
        paddingVertical: 5,
        width: '80%',
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
        marginVertical: 7,
        width: '100%',
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
      case 1:
        return 'green';
        break;
      case 2:
        return 'yellow';
        break;
    }
  };

  return (
    <Text
      style={{
        height: 45,
        width: 40,
        marginHorizontal: 5,
        backgroundColor: trigger ? getColor(color) : 'white',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 35,
      }}>
      {lett}
    </Text>
  );
};

const letterStyle = StyleSheet.create({});

const alphArr = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const Keyboard = () => {
  const con = useContext(PlayContext);

  const removeLetter = () => {
    const k = `remove${translate[con.lineNo]}`;
    con.dispatchLocal({type: k});
  };

  const confirm = () => {
    con.setTriggers(curr => {
      curr[con.lineNo] = true;
      return curr;
    });
    // con.setAccurs(decWord(con.word));
    con.setLineNo(con.lineNo + 1);
  };
  return (
    <View
      style={{
        width: '100%',
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 5,
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
      <View style={{marginTop: 10}}>
        {alphArr.map((val, index) => {
          return (
            <View
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                marginBottom: 5,
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

  const addLetter = l => {
    if (!con.noAction) {
      const k = `add${translate[con.lineNo]}`;
      // console.log(k);
      con.dispatchLocal({type: k, payload: l});
    }
  };
  return (
    <Text
      style={{
        fontSize: 27,
        marginHorizontal: 3,
        color: 'black',
        padding: 5,
        borderWidth: 1,
        borderRadius: 5,
        width: 35,
        textAlign: 'center',
      }}
      onPress={() => {
        addLetter(l);
      }}>
      {l}
    </Text>
  );
};

export default PlayBoard;
