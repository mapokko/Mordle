import {View, Text, Dimensions} from 'react-native';
import React, {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {useFocusEffect} from '@react-navigation/native';

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';

const data = {
  labels: ['Swim', 'Bike', 'Run'], // optional
  data: [0.4, 0.6, 0.8],
};

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => {
    return `rgba(243, 84, 105, ${opacity})`;
  },
  //   color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

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
      <View style={{display: 'flex', alignItems: 'center'}}>
        <ProgressChart
          style={{borderRadius: 50}}
          data={data}
          width={screenWidth * 0.8}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
        />
      </View>
    </View>
  );
};

export default Statistics;
