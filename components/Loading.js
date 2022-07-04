import {View} from 'react-native';
import React from 'react';
import {Input, Text, Tab, TabView, Icon, Dialog} from '@rneui/themed';

const Loading = ({loading}) => {
  return (
    <Dialog
      animationType="fade"
      isVisible={loading}
      overlayStyle={{
        backgroundColor: 'none',
        shadowColor: 'rgba(255, 255, 255, 0)',
      }}>
      <Dialog.Loading />
    </Dialog>
  );
};

export default Loading;
