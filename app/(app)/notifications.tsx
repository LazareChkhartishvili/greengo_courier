import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";

interface Notification {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    category: "ოფისი",
    title: "ოფისი",
    description: "ოფისის ლოკაცია შეიცვალა",
    date: "11.1.2025",
  },
  {
    id: "2",
    category: "ოფისი",
    title: "ავტომატური თარგმანი",
    description:
      "დამატებითი ინფორმაციის გადათარგმნას უკვე GreenGo Partner აპლიკაციიდან შეძლებ.",
    date: "11.1.2025",
  },
  {
    id: "3",
    category: "ოფისი",
    title: "გადახდის თარიღი",
    description:
      "მალე აპლიკაციში შენი გამომუშავება განულდება, დეტალებს შეუთობინებაში ნახავ.",
    date: "11.1.2025",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const groupedNotifications = mockNotifications.reduce((acc, notification) => {
    if (!acc[notification.category]) {
      acc[notification.category] = [];
    }
    acc[notification.category].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>შემომავალი შეტყობინებები</Text>

        {/* Notifications grouped by category */}
        {Object.entries(groupedNotifications).map(
          ([category, notifications]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>

              {notifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    index === notifications.length - 1 && styles.lastItem,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationDescription}>
                    {notification.description}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {notification.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
      </ScrollView>
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
    fontSize: 26,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  categorySection: {
    marginBottom: Dims.padding.medium,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray.dark,
    textTransform: "uppercase",
    marginBottom: Dims.padding.medium,
  },
  notificationItem: {
    paddingVertical: Dims.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.small,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.gray.medium,
    lineHeight: 20,
    marginBottom: Dims.padding.small,
  },
  notificationDate: {
    fontSize: 13,
    color: Colors.gray.medium,
  },
});
