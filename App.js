/**
 * Sweatcoin Platform WebView example
 * https://github.com/sweatco/sweatcoin-platform-webview-example
 */

import React, {useRef} from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import Clipboard from '@react-native-community/clipboard';
import useAppState from 'react-native-appstate-hook';

const App = () => {
  const webviewRef = useRef(null);

  useAppState({onForeground: reloadData});

  return (
    <>
      {/* Make sure to setup StatusBar to `dark-content` otherwise it might be white
       * when user uses dark layout on his device */}
      <StatusBar barStyle={'dark-content'} />
      <WebView
        ref={webviewRef}
        source={{
          uri: 'https://platform.sweatco.in/webview/marketplace',
          headers: {
            'Authentication-Token': 'user token here',
          },
        }}
        /* Reflect your actual AppName and your current build number, which should increment
         * with each App Store or Google Play release */
        applicationNameForUserAgent={'AppName/1'}
        scalesPageToFit={false}
        startInLoadingState={true}
        autoManageStatusBarEnabled={false}
        automaticallyAdjustsScrollIndicatorInsets={true}
        renderLoading={() => <Loading />}
        renderError={() => <Error onReload={reloadWebview} />}
        onContentProcessDidTerminate={reloadWebview}
        onMessage={handleMessage}
      />

      {/* This is debug action bar to showcase reload actions */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={reloadData}>
          <Text style={styles.actionBarButton}>Reload Data</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reloadWebview}>
          <Text style={styles.actionBarButton}>Force WebView</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  function handleMessage(synteticEvent) {
    const {nativeEvent} = synteticEvent;
    const action = JSON.parse(nativeEvent.data);
    switch (action.type) {
      case 'SWC.COPY_CODE':
        Clipboard.setString(action.payload);
        break;
      case 'SWC.OPEN_URL':
        InAppBrowser.open(action.payload);
        break;
      case 'SWC.DISMISS':
        // Use ?dismissable=1 to add Cross button to Marketplace NavBar

        // eslint-disable-next-line no-alert
        alert('TODO: hide current screen');
        break;
    }
  }

  function reloadWebview() {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  }

  // Use this action when screen got focus, similarly to App became active
  function reloadData() {
    if (webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({
          type: 'SWC.RELOAD',
        }),
      );
    }
  }
};

/* Replace with your own implementation */
const Loading = () => {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingTitle}>TODO: Loading...</Text>
    </View>
  );
};

/* Replace with your own implementation, make sure to setup reload action as well */
const Error = props => {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingTitle}>TODO: Error Component</Text>
      <TouchableOpacity onPress={props.onReload}>
        <Text style={styles.loadingAction}>Reload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  loadingTitle: {
    fontSize: 16,
  },

  loadingAction: {
    marginTop: 24,
    fontSize: 24,
    color: 'blue',
  },

  actionBar: {
    height: 100,
    justifyContent: 'center',
    paddingTop: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
  },

  actionBarButton: {
    fontSize: 16,
    color: 'blue',
    marginHorizontal: 10,
  },
});

export default App;
