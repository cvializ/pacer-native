import { Stack, Tabs } from "expo-router";

export default function RootLayout() {
  return ( 
    <Tabs
        screenOptions={{
          // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          // tabBarButton: HapticTab,
          // tabBarBackground: TabBarBackground,
          // tabBarStyle: Platform.select({
          //   ios: {
          //     // Use a transparent background on iOS to show the blur effect
          //     position: 'absolute',
          //   },
          //   default: {},
          // }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pacer',
          }}
        />
        <Tabs.Screen
          name="bpm"
          options={{
            title: 'BPM',
          }}
        />
      </Tabs>
  );
}
