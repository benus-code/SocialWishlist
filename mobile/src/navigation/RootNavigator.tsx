import React from 'react';
import {NavigationContainer, LinkingOptions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../contexts/AuthContext';
import {AuthStack} from './AuthStack';
import {MainTabs} from './MainTabs';
import {PublicWishlistScreen} from '../screens/public/PublicWishlistScreen';
import {LoadingScreen} from '../components/LoadingScreen';

const RootStack = createNativeStackNavigator();

// Deep linking configuration
const linking: LinkingOptions<any> = {
  prefixes: ['wishly://', 'https://wishly.app'],
  config: {
    screens: {
      PublicWishlistDeepLink: 'list/:slug',
      AuthStack: {
        screens: {
          ResetPassword: 'reset-password',
        },
      },
    },
  },
};

export function RootNavigator() {
  const {isLoading, isAuthenticated} = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen
              name="PublicWishlistDeepLink"
              component={PublicWishlistScreen}
              options={{presentation: 'modal'}}
            />
          </>
        ) : (
          <>
            <RootStack.Screen name="AuthStack" component={AuthStack} />
            <RootStack.Screen
              name="PublicWishlistDeepLink"
              component={PublicWishlistScreen}
              options={{presentation: 'modal'}}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
