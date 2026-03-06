import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import './src/i18n';
import {AuthProvider} from './src/contexts/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
