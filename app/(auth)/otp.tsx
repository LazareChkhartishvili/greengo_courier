import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourierAuth } from "../../hooks/useCourierAuth";
import { apiService } from "../../utils/api";

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const name = params.name as string | undefined;
  const { saveCourierData } = useCourierAuth();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
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

  const handleVerify = async (code: string) => {
    if (code.length !== 4) {
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Verifying OTP code for:', phoneNumber);

      // Register courier with OTP verification
      const registerResponse = await apiService.registerCourier(phoneNumber, code, name);

      console.log('📦 Register response:', JSON.stringify(registerResponse, null, 2));

      if (registerResponse.success && registerResponse.data) {
        const courier = registerResponse.data;
        const id = courier._id || courier.id;
        console.log('✅ Courier registered, ID:', id);
        
        if (id) {
          await saveCourierData(id, phoneNumber);
          router.replace('/(app)/home');
        } else {
          console.error('❌ Courier ID not found in response');
          Alert.alert('შეცდომა', 'კურიერი რეგისტრირდა, მაგრამ ID ვერ მოიძებნა');
        }
      } else {
        const errorMessage = registerResponse.error?.details || 'OTP კოდი არასწორია';
        console.error('❌ Register courier failed:', errorMessage);
        Alert.alert('შეცდომა', errorMessage);
        // Clear OTP on error
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      const errorMessage = error.message || 'უცნობი შეცდომა';
      Alert.alert('შეცდომა', errorMessage);
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
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
                style={[
                  styles.otpInput,
                  digit !== "" && styles.otpInputFilled,
                  loading && styles.otpInputDisabled,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>ვერიფიკაცია...</Text>
            </View>
          )}
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
  otpInputDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
});
