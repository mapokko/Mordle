import {View, Text, Dimensions} from 'react-native';
import React, {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {useFocusEffect} from '@react-navigation/native';

const Statistics = () => {
  const [matches, setMatches] = useState({});
  const screenWidth = Dimensions.get('screen').width;

  useFocusEffect(
    React.useCallback(() => {
      firestore()
        .collection('matches')
        .where('playersUid', 'array-contains', auth().currentUser.uid)
        .get()
        .then(query => {
          setMatches(query.docs);
        });
    }, []),
  );

  return (
    <View>
      <Text>Statistics</Text>
    </View>
  );
};

export default Statistics;
