import {View} from 'react-native';
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

const initState = {
  first: '',
  second: '',
  third: '',
  fourth: '',
  fifth: '',
  sixth: '',
};

const translate = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

function reducer(state, action) {
  switch (action.type) {
    case 'addfirst':
      return {...state, first: state.first.concat(action.payload)};
      break;
    case 'removefirst':
      return {...state, first: state.first.slice(0, -1)};
      break;

    case 'addsecond':
      return {...state, second: state.second.concat(action.payload)};
      break;

    case 'removesecond':
      return {...state, second: state.second.slice(0, -1)};
      break;

    case 'addthird':
      return {...state, third: state.third.concat(action.payload)};
      break;

    case 'removethird':
      return {...state, third: state.third.slice(0, -1)};
      break;

    case 'addfourth':
      return {...state, fourth: state.fourth.concat(action.payload)};
      break;

    case 'removefourth':
      return {...state, fourth: state.fourth.slice(0, -1)};
      break;

    case 'addfifth':
      return {...state, fifth: state.fifth.concat(action.payload)};
      break;

    case 'removefifth':
      return {...state, fifth: state.fifth.slice(0, -1)};
      break;

    case 'addsixth':
      return {...state, sixth: state.sixth.concat(action.payload)};
      break;

    case 'removesixth':
      return {...state, sixth: state.sixth.slice(0, -1)};
      break;

    default:
      throw new Error();
  }
}

const PlayContext = createContext();

const PlayBoard = ({navigation}) => {
  const words = ['cipro', 'ibiza', 'greca'];
  const [position, setPosition] = useState(0);
  const [noAction, setNoAction] = useState(false);
  const [size, setSize] = useState(5);
  const [show, setShow] = useState(true);
  const [tryNo, setTryNo] = useState(0);

  const [state, dispatchLocal] = useReducer(reducer, initState);
  const matchData = useSelector(state => state.match);

  const contextData = {
    tryNo,
    words,
    position,
    setPosition,
    state,
    dispatchLocal,
    noAction,
    setNoAction,
    size,
  };

  useEffect(() => {
    console.log('some changed');
    console.log(state);
    if (state[`${translate[position]}`].length == size) {
      setNoAction(true);
    } else if (state[`${translate[position]}`].length < size) {
      setNoAction(false);
    }
  }, [state, position]);

  return (
    <View>
      <Countdown show={show} setShow={setShow} />
      <PlayContext.Provider value={contextData}>
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
  return (
    <>
      {show == true ? (
        <CountDown
          id="dio"
          until={200}
          onFinish={() => {
            console.log('finish');
          }}
          onPress={() => alert('hello')}
          size={30}
          digitStyle={{backgroundColor: '#f2f2f2', height: 40}}
          timeToShow={['M', 'S']}
          timeLabels={{m: '', s: ''}}
          showSeparator
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
        if (guess.length < index + 1) {
          return <LetterInput lett="" />;
        } else {
          return <LetterInput lett={guess.charAt(index)} />;
        }
      })}
    </View>
  );
};

const LetterInput = ({lett}) => {
  return (
    <Text
      style={{
        height: 45,
        width: 40,
        marginHorizontal: 5,
        backgroundColor: 'white',
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

  const removeLetter = () => {
    const k = `remove${translate[con.position]}`;
    console.log(k);
    con.dispatchLocal({type: k});
  };

  const confirm = () => {
    con.setPosition(con.position + 1);
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
      const k = `add${translate[con.position]}`;
      console.log(k);
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
