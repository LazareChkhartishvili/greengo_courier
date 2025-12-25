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

export default function HelpContactScreen() {
  const router = useRouter();
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  const handleLikePress = () => {
    // Mark as helpful and show checkmark
    setIsHelpful(true);
  };

  const handleDislikePress = () => {
    // Mark as not helpful
    setIsHelpful(false);
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
        <Text style={styles.title}>სხვა</Text>

        <Text style={styles.description}>
          გთხოვთ, გვითხარით, როგორ შეგვიძლია დაგეხმაროთ ქვემოთ მოცემულ ჩატის
          საშუალებით.
        </Text>

        <Text style={styles.description}>
          თუ თქვენი მოთხოვნა დაკავშირებულია კონკრეტულ შეკვეთასთან, გთხოვთ,
          მიუთითოთ რომელ შეკვეთასთან დაკავშირებით გჭირდებათ დახმარება. რაც მეტ
          ინფორმაციას მოგვაწვდით, მით უფრო სწრაფად შევძლებთ თქვენი დახმარებას.
        </Text>

        <Text style={styles.description}>
          ვეცდებით რაც შეიძლება მალე შევძლოთ თქვენი დახმარება 💙
        </Text>

        {/* Question Section */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>დაგეხმარათ ეს ინფორმაციაზე?</Text>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isHelpful === true && styles.selectedButton,
              ]}
              onPress={handleLikePress}
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
              style={[
                styles.actionButton,
                isHelpful === false && styles.selectedButton,
              ]}
              onPress={handleDislikePress}
            >
              <Ionicons
                name={
                  isHelpful === false ? "checkmark-circle" : "close-outline"
                }
                size={20}
                color={isHelpful === false ? "#00C851" : Colors.black}
              />
              <Text
                style={[
                  styles.buttonText,
                  isHelpful === false && styles.selectedButtonText,
                ]}
              >
                არა
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => {
            // TODO: Open chat interface
          }}
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
