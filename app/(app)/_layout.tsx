import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: "",
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          title: "",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

