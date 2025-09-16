// _layout.tsx
import { Tabs, Redirect } from "expo-router";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { Home, Users, CircleHelp, Check } from "lucide-react-native";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/loginScreen" />;
  }

  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="homeScreen"
          options={{
            title: "Início",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="RegistroDeAulaScreen"
          options={{
            title: "Registro",
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="sobreScreen"
          options={{
            title: "Sobre",
            tabBarIcon: ({ color, size }) => (
              <CircleHelp color={color} size={size} />
            ),
          }}
        />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "hsla(127, 43%, 81%, 1.00)",
    borderTopWidth: 0,
  },
});