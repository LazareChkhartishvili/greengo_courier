import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/colors";
import { Dimensions as Dims } from "../../../constants/dimensions";

export default function PaymentInfoScreen() {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  const handleYesPress = () => {
    // Mark as helpful and show checkmark
    setIsHelpful(true);
  };

  const handleNoPress = () => {
    // Show the feedback section
    setShowFeedback(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          შეკვეთის განთავსება{"\n"}სხვისთვის/სხვა მისამართზე
        </Text>
        <Text style={styles.description}>
          შეკვეთის განთავსებისას შეგიძლიათ შეიყვანოთ ნებისმიერი მისამართი, სადაც
          გსურთ მიწოდება.
        </Text>

        <Text style={styles.description}>
          უბრალოდ აირჩიეთ მისამართი რუკაზე ან შეიყვანეთ ხელით სასურველი მისამართი.
        </Text>

        {/* Question Section */}
        {!showFeedback ? (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>დაგეხმარათ ეს ინფორმაციაზე?</Text>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isHelpful === true && styles.selectedButton,
                ]}
                onPress={handleYesPress}
              >
                <Ionicons
                  name={
                    isHelpful === true ? "checkmark-circle" : "person-outline"
                  }
                  size={20}
                  color={isHelpful === true ? "#00C851" : Colors.black}
                />
                <Text
                  style={[
                    styles.buttonText,
                    isHelpful === true && styles.selectedButtonText,
                  ]}
                >
                  დიახ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNoPress}
              >
                <Ionicons name="close-outline" size={20} color={Colors.black} />
                <Text style={styles.buttonText}>არა</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.feedbackContainer}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustrationEmoji}>🙋</Text>
            </View>

            <Text style={styles.subText}>სამწუხაროა ამის გაგება!</Text>

            {/* Action Buttons */}
            <View style={styles.fullButtonsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/(app)/support/chat")}
              >
                <Text style={styles.primaryButtonText}>
                  ჩათი მხარდაჭერ გუნდთან
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowFeedback(false)}
              >
                <Text style={styles.secondaryButtonText}>არა, მადლობთ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push("/(app)/support/chat")}
        >
          <Text style={styles.contactButtonText}>ჩათი მხარდაჭერ გუნდთან</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 0,
    paddingHorizontal: Dims.padding.screen,
    paddingBottom: Dims.padding.medium,
  },
  backButton: {
    padding: Dims.padding.small,
    marginLeft: -Dims.padding.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Dims.padding.screen,
    paddingBottom: Dims.padding.large * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: Colors.black,
    lineHeight: 22,
    marginBottom: 16,
  },
  questionContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.medium,
    paddingVertical: Dims.padding.large,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    gap: 8,
  },
  selectedButton: {
    borderColor: "#00C851",
    backgroundColor: "#E8F5E9",
  },
  buttonText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "600",
  },
  selectedButtonText: {
    color: "#00C851",
  },
  feedbackContainer: {
    marginTop: 30,
    alignItems: "center",
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    backgroundColor: Colors.gray.light,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  illustrationEmoji: {
    fontSize: 60,
  },
  subText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 24,
  },
  fullButtonsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#00C851",
    borderRadius: Dims.borderRadius.medium,
    paddingVertical: Dims.padding.large,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.medium,
    paddingVertical: Dims.padding.large,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray.light,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "600",
  },
  bottomContainer: {
    padding: Dims.padding.screen,
    paddingBottom: Platform.OS === "ios" ? 34 : Dims.padding.screen,
  },
  contactButton: {
    backgroundColor: "#E8F5E9",
    borderRadius: Dims.borderRadius.medium,
    paddingVertical: Dims.padding.large,
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "600",
  },
});
