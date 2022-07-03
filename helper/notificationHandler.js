import notifee from '@notifee/react-native';

async function onDisplayNotification() {
  await notifee.deleteChannel('new');

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'nello',
    name: 'Default Channel',
    sound: 'hollow',
  });

  // Display a notification
  await notifee.displayNotification({
    title: 'Notification Title',
    body: 'nuovo corpo',
    android: {
      channelId,
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
    },
  });
}

const handleNotification = (remoteMessage, state) => {
  console.log('message received from ' + state + 'ground!');
  console.log(remoteMessage);

  if (remoteMessage.data.name == 'friend requests') {
    console.log('abot to show');
    notifee.displayNotification({
      title: 'Mordle',
      body: 'Hai ' + remoteMessage.data.num + ' richieste di amicizia!',
      android: {
        channelId: state == 'fore' ? 'mordleHigh' : 'mordleDef',
        // pressAction: {
        //   id: 'default',
        // },
      },
    });
  }
  // notifee.displayNotification({
  //   title: 'Mordle'
  //   body
  // })
};

export {onDisplayNotification, handleNotification};
