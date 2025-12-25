import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useCourierAuth } from "../../hooks/useCourierAuth";
import { apiService } from "../../utils/api";

type Period = "today" | "week" | "month";

interface Statistics {
  period: Period;
  deliveredOrders: number;
  totalDistance: number;
  totalCompleted: number;
  confirmationRate: number;
  completionRate: number;
  improvementNeeded: number;
  previousPeriodDelivered: number;
  date: string;
}

const ORANGE_COLOR = "#FF8C00";

export default function StatisticsScreen() {
  const router = useRouter();
  const { courierId } = useCourierAuth();
  const [period, setPeriod] = useState<Period>("today");
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    if (!courierId) return;

    setLoading(true);
    try {
      const response = await apiService.getCourierStatistics(courierId, period);
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courierId) {
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courierId, period]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "იანვარი",
      "თებერვალი",
      "მარტი",
      "აპრილი",
      "მაისი",
      "ივნისი",
      "ივლისი",
      "აგვისტო",
      "სექტემბერი",
      "ოქტომბერი",
      "ნოემბერი",
      "დეკემბერი",
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Simple circular progress using Views (no SVG needed)
  const CircularProgress = ({
    percentage,
    color = ORANGE_COLOR,
  }: {
    percentage: number;
    color?: string;
  }) => {
    const normalizedPercentage = Math.min(100, Math.max(0, percentage));
    const rotation = (normalizedPercentage / 100) * 360;

    return (
      <View style={styles.circularProgressContainer}>
        <View style={styles.circularProgressOuter}>
          {/* Background circle */}
          <View style={styles.circularProgressBackground} />

          {/* Progress arc - left half */}
          <View style={styles.progressHalfContainer}>
            <View
              style={[
                styles.progressHalf,
                {
                  borderColor: color,
                  transform: [
                    {
                      rotate: `${Math.min(rotation, 180)}deg`,
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Progress arc - right half (only shows after 50%) */}
          {rotation > 180 && (
            <View style={[styles.progressHalfContainer, styles.rightHalf]}>
              <View
                style={[
                  styles.progressHalf,
                  styles.rightProgressHalf,
                  {
                    borderColor: color,
                    transform: [
                      {
                        rotate: `${rotation - 180}deg`,
                      },
                    ],
                  },
                ]}
              />
            </View>
          )}

          {/* Inner circle with text */}
          <View style={styles.circularProgressInner}>
            <Text style={[styles.circularProgressText, { color }]}>
              {normalizedPercentage.toFixed(1)} %
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <Text style={styles.titleLoading}>თქვენი სტატისტიკა</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!statistics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <Text style={styles.titleLoading}>თქვენი სტატისტიკა</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>სტატისტიკა ვერ მოიძებნა</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>თქვენი სტატისტიკა</Text>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "today" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("today")}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === "today" && styles.periodButtonTextActive,
              ]}
            >
              დღეს
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "week" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("week")}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === "week" && styles.periodButtonTextActive,
              ]}
            >
              ამ კვირაში
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "month" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("month")}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === "month" && styles.periodButtonTextActive,
              ]}
            >
              ამ თვეში
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.dateText}>{formatDate(statistics.date)}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>მიტანილი შეკვეთები</Text>
            <Text style={styles.statsValue}>{statistics.deliveredOrders}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>მანძილი</Text>
            <Text style={styles.statsValue}>{statistics.totalDistance} კმ</Text>
          </View>
        </View>

        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>ანალიტიკა</Text>

          {/* Completed Orders Card */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardSubtitle}>
              შესრულებული შეკვეთები
            </Text>
            <View style={styles.completedOrdersContainer}>
              <Text style={styles.completedOrdersNumber}>
                {statistics.totalCompleted}
              </Text>
              <Text style={styles.completedOrdersLabel}>
                შესრულებული შეკვეთა
              </Text>
            </View>
            {statistics.improvementNeeded > 0 && (
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={ORANGE_COLOR}
                />
                <Text style={styles.infoText}>
                  შეასრულე {statistics.improvementNeeded}-თ მეტი შეკვეთა წინა{" "}
                  {period === "today"
                    ? "დღის"
                    : period === "week"
                      ? "კვირის"
                      : "თვის"}{" "}
                  შედეგის გასაუმჯობესებლად!
                </Text>
              </View>
            )}
          </View>

          {/* Confirmation Rate Card */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardSubtitle}>
              შეკვეთის დადასტურების მაჩვენებელი
            </Text>
            <CircularProgress percentage={statistics.confirmationRate} />
            {statistics.improvementNeeded > 0 && (
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={ORANGE_COLOR}
                />
                <Text style={styles.infoText}>
                  შეასრულე {statistics.improvementNeeded}-თ მეტი შეკვეთა წინა{" "}
                  {period === "today"
                    ? "დღის"
                    : period === "week"
                      ? "კვირის"
                      : "თვის"}{" "}
                  შედეგის გასაუმჯობესებლად!
                </Text>
              </View>
            )}
          </View>

          {/* Completion Rate Card */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardSubtitle}>
              შესრულებული შეკვეთების მაჩვენებელი
            </Text>
            <CircularProgress percentage={statistics.completionRate} />
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={ORANGE_COLOR}
              />
              <Text style={styles.infoText}>
                გვესმის, რომ შესაძლოა არსებობდეს ისეთი გარემოებები, როდესაც
                დაგჭირდებათ დადასტურებული შეკვეთების გაუქმება. გთხოვთ, განიხილოთ
                შეკვეთებზე უარის თქმა მათი გაუქმების ნაცვლად, თუ ეს შესაძლებელია,
                რათა უზრუნველვყოთ ჩვენი მომხმარებლებისთვის შეკვეთების დროულად
                მიღება.
              </Text>
            </View>
          </View>
        </View>
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
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  titleLoading: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    paddingHorizontal: Dims.padding.screen,
    marginBottom: Dims.padding.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors.gray.light,
    borderRadius: Dims.borderRadius.medium,
    padding: 4,
    marginBottom: Dims.padding.large,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Dims.borderRadius.small,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray.medium,
  },
  periodButtonTextActive: {
    color: Colors.black,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    padding: Dims.padding.large,
    marginBottom: Dims.padding.large * 1.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Dims.padding.small,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  analyticsSection: {
    marginTop: Dims.padding.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  analyticsCard: {
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    padding: Dims.padding.large,
    marginBottom: Dims.padding.large,
  },
  analyticsCardSubtitle: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  completedOrdersContainer: {
    alignItems: "flex-start",
    marginBottom: Dims.padding.medium,
  },
  completedOrdersNumber: {
    fontSize: 42,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  completedOrdersLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  circularProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Dims.padding.large,
  },
  circularProgressOuter: {
    width: 140,
    height: 140,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressBackground: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: Colors.gray.light,
  },
  progressHalfContainer: {
    position: "absolute",
    width: 140,
    height: 140,
    overflow: "hidden",
  },
  rightHalf: {
    transform: [{ rotate: "180deg" }],
  },
  progressHalf: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: "transparent",
    borderTopColor: ORANGE_COLOR,
    borderRightColor: ORANGE_COLOR,
  },
  rightProgressHalf: {
    borderTopColor: ORANGE_COLOR,
    borderRightColor: ORANGE_COLOR,
  },
  circularProgressInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  circularProgressText: {
    fontSize: 24,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFF8E7",
    padding: Dims.padding.medium,
    borderRadius: Dims.borderRadius.small,
    marginTop: Dims.padding.small,
    borderLeftWidth: 3,
    borderLeftColor: ORANGE_COLOR,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.gray.dark,
    lineHeight: 18,
    marginLeft: Dims.padding.small,
  },
});
