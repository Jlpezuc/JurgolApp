import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Color, Font } from '@/constants/design';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Color.pitch,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Color.chalk,
        tabBarInactiveTintColor: Color.fg3,
        tabBarLabelStyle: {
          fontFamily: Font.mono.medium,
          fontSize: 9,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match/index"
        options={{
          title: 'Partido',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="trophy.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="squads/index"
        options={{
          title: 'Equipos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.3.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
