import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Dimensions as Dims } from '../../constants/dimensions';
import { useCourierAuth } from '../../hooks/useCourierAuth';
import { apiService } from '../../utils/api';

type Period = 'today' | 'week' | 'month';

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

export default function StatisticsScreen() {
  const router = useRouter();
  const { courierId } = useCourierAuth();
  const [period, setPeriod] = useState<Period>('today');
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
      console.error('Error fetching statistics:', error);
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
      'იანვარი',
      'თებერვალი',
      'მარტი',
      'აპრილი',
      'მაისი',
      'ივნისი',
      'ივლისი',
      'აგვისტო',
      'სექტემბერი',
      'ოქტომბერი',
      'ნოემბერი',
      'დეკემბერი',
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const normalizedPercentage = Math.min(100, Math.max(0, percentage));
    const progressAngle = (normalizedPercentage / 100) * 360;

    return (
      <View style={styles.circularProgressContainer}>
        <View style={styles.circularProgress}>
          {/* Background circle */}
          <View style={styles.circularProgressBackground} />
          {/* Progress overlay */}
          {normalizedPercentage > 0 && (
            <View
              style={[
                styles.circularProgressOverlay,
                {
                  transform: [{ rotate: `${progressAngle - 90}deg` }],
                },
              ]}
            >
              <View style={styles.circularProgressFill} />
            </View>
          )}
          {/* Inner circle with text */}
          <View style={styles.circularProgressInner}>
            <Text style={styles.circularProgressText}>{normalizedPercentage.toFixed(1)}%</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>თქვენი სტატისტიკა</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>თქვენი სტატისტიკა</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>სტატისტიკა ვერ მოიძებნა</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>თქვენი სტატისტიკა</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'today' && styles.periodButtonActive]}
            onPress={() => setPeriod('today')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === 'today' && styles.periodButtonTextActive,
              ]}
            >
              დღეს
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === 'week' && styles.periodButtonTextActive,
              ]}
            >
              ამ კვირაში
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === 'month' && styles.periodButtonTextActive,
              ]}
            >
              ამ თვეში
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Section */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formatDate(statistics.date)}</Text>
        </View>

        {/* Daily Stats */}
        <View style={styles.dailyStatsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>მიტანილი შეკვეთები</Text>
            <Text style={styles.statValue}>{statistics.deliveredOrders}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>მანძილი</Text>
            <Text style={styles.statValue}>{statistics.totalDistance} კმ</Text>
          </View>
        </View>

        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>ანალიტიკა</Text>

          {/* Completed Orders */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>შესრულებული შეკვეთები</Text>
            <View style={styles.completedOrdersContainer}>
              <Text style={styles.completedOrdersNumber}>{statistics.totalCompleted}</Text>
              <Text style={styles.completedOrdersLabel}>შესრულებული შეკვეთა</Text>
            </View>
            {statistics.improvementNeeded > 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  შეასრულე {statistics.improvementNeeded}-თ მეტი შეკვეთა წინა{' '}
                  {period === 'today' ? 'დღის' : period === 'week' ? 'კვირის' : 'თვის'}{' '}
                  შედეგის გასაუმჯობესებლად!
                </Text>
              </View>
            )}
          </View>

          {/* Confirmation Rate */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>შეკვეთის დადასტურების მაჩვენებელი</Text>
            <CircularProgress percentage={statistics.confirmationRate} />
            {statistics.improvementNeeded > 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  შეასრულე {statistics.improvementNeeded}-თ მეტი შეკვეთა წინა{' '}
                  {period === 'today' ? 'დღის' : period === 'week' ? 'კვირის' : 'თვის'}{' '}
                  შედეგის გასაუმჯობესებლად!
                </Text>
              </View>
            )}
          </View>

          {/* Completion Rate */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardTitle}>შესრულებული შეკვეთების მაჩვენებელი</Text>
            <CircularProgress percentage={statistics.completionRate} />
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                გვესმის, რომ შესაძლოა არსებობდეს ისეთი გარემოებები, როდესაც დაგჭირდებათ
                დადასტურებული შეკვეთების გაუქმება. გთხოვთ, განიხილოთ შეკვეთებზე უარის თქმა
                მათი გაუქმების ნაცვლად, თუ ეს შესაძლებელია, რათა უზრუნველვყოთ ჩვენი
                მომხმარებლებისთვის შეკვეთების დროულად მიღება.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: Dims.padding.screen,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.black,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Dims.padding.screen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.gray.light,
    borderRadius: Dims.borderRadius.medium,
    padding: 4,
    marginBottom: Dims.padding.large,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Dims.borderRadius.small,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray.medium,
  },
  periodButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dateSection: {
    marginBottom: Dims.padding.large,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  dailyStatsContainer: {
    flexDirection: 'row',
    gap: Dims.padding.medium,
    marginBottom: Dims.padding.large * 2,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Dims.padding.large,
    borderRadius: Dims.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray.light,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
  },
  analyticsSection: {
    marginTop: Dims.padding.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  analyticsCard: {
    backgroundColor: Colors.white,
    padding: Dims.padding.large,
    borderRadius: Dims.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    marginBottom: Dims.padding.large,
  },
  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  completedOrdersContainer: {
    alignItems: 'center',
    marginBottom: Dims.padding.medium,
  },
  completedOrdersNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  completedOrdersLabel: {
    fontSize: 16,
    color: Colors.gray.medium,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: Dims.padding.large,
  },
  circularProgress: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularProgressBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: Colors.gray.light,
  },
  circularProgressOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  circularProgressFill: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  circularProgressInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circularProgressText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: Dims.padding.medium,
    borderRadius: Dims.borderRadius.small,
    marginTop: Dims.padding.medium,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});

