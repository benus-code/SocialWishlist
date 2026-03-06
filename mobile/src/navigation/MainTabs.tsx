import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {DashboardScreen} from '../screens/dashboard/DashboardScreen';
import {WishlistEditorScreen} from '../screens/dashboard/WishlistEditorScreen';
import {ContributionsScreen} from '../screens/ContributionsScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {PublicWishlistScreen} from '../screens/public/PublicWishlistScreen';
import {colors, fonts} from '../theme';

// Dashboard stack (lists + editor)
const DashboardStack = createNativeStackNavigator();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{headerShown: false}}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="WishlistEditor" component={WishlistEditorScreen} />
      <DashboardStack.Screen name="PublicWishlist" component={PublicWishlistScreen} />
    </DashboardStack.Navigator>
  );
}

// Contributions stack
const ContribStack = createNativeStackNavigator();

function ContribStackNavigator() {
  return (
    <ContribStack.Navigator screenOptions={{headerShown: false}}>
      <ContribStack.Screen name="ContributionsHome" component={ContributionsScreen} />
      <ContribStack.Screen name="PublicWishlist" component={PublicWishlistScreen} />
    </ContribStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const {t} = useTranslation('navigation');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarLabelStyle: {
          fontSize: fonts.sizes.xs,
          fontWeight: '600',
        },
        tabBarStyle: {
          borderTopColor: colors.gray100,
          paddingTop: 4,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: t('myLists'),
          tabBarIcon: ({color}) => (
            <TabIcon icon="🎁" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Contributions"
        component={ContribStackNavigator}
        options={{
          tabBarLabel: t('contributions'),
          tabBarIcon: ({color}) => (
            <TabIcon icon="💝" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({color}) => (
            <TabIcon icon="👤" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({icon}: {icon: string; color: string}) {
  return <Text style={{fontSize: 22}}>{icon}</Text>;
}
