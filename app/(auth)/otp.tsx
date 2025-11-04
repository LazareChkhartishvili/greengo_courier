import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, 4);
      const newOtp = [...otp];
      for (let i = 0; i < pastedText.length && index + i < 4; i++) {
        newOtp[index + i] = pastedText[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedText.length, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all fields are filled
    if (newOtp.every((digit) => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (code: string) => {
    if (code.length === 4) {
      // Simulate OTP verification (no backend validation)
      router.push("/(onboarding)/verification-start");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>დაადასტურე ტელეფონის ნომერი</Text>
          <Text style={styles.subtitle}>
            ვერიფიკაციის კოდი გაგზავნილია ნომერზე {phoneNumber}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit !== "" && styles.otpInputFilled]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 60,
    maxWidth: 80,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  otpInputFilled: {
    borderColor: "#4CAF50",
  },
});
