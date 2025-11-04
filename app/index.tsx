import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem(
        "onboardingComplete"
      );
      if (onboardingComplete === "true") {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/phone");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      router.replace("/(auth)/phone");
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
