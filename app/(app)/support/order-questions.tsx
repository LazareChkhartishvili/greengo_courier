import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/colors";
import { Dimensions as Dims } from "../../../constants/dimensions";

export default function OrderQuestionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          შეკვეთასთან დაკავშირებული{"\n"}ზოგადი კითხვები
        </Text>

        {/* Menu Options */}
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(app)/support/how-to-order")}
          >
            <Text style={styles.menuText}>როგორ შევუკვეთო?</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(app)/support/order-history")}
          >
            <Text style={styles.menuText}>
              სად ვნახო შეკვეთების{"\n"}ისტორია
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(app)/support/other-address")}
          >
            <Text style={styles.menuText}>
              შეკვეთის განთავსება{"\n"}სხვა მისამართზე
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push("/(app)/support/chat")}
        >
          <Text style={styles.contactButtonText}>ჩათი მხარდაჭერთ გუნდთან</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: Dims.padding.screen,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 32,
    marginBottom: Dims.padding.large,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Dims.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  menuText: {
    fontSize: 16,
    color: Colors.black,
    flex: 1,
    lineHeight: 22,
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
    color: Colors.primary,
    fontWeight: "600",
  },
});

