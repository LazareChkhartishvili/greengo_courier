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

interface Transaction {
  id: string;
  date: string;
  title: string;
  merchant: string;
  amount: string;
  isNegative: boolean;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "28 August, 2025",
    title: "ნაღდი ფულის შეტანა",
    merchant: "Madart",
    amount: "-206$",
    isNegative: true,
  },
  {
    id: "2",
    date: "28 August, 2025",
    title: "ნაღდი ფულის აღება",
    merchant: "Madart",
    amount: "206$",
    isNegative: false,
  },
  {
    id: "3",
    date: "28 August, 2025",
    title: "ნაღდი ფულის აღება",
    merchant: "Madart",
    amount: "206$",
    isNegative: false,
  },
  {
    id: "4",
    date: "28 August, 2025",
    title: "ნაღდი ფულის აღება",
    merchant: "Madart",
    amount: "206$",
    isNegative: false,
  },
];

export default function FinancesScreen() {
  const router = useRouter();

  const totalIncome = 143.75;
  const cashToWithdraw = 12.4;

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
        <Text style={styles.title}>ფინანსები</Text>

        {/* Income Card */}
        <View style={styles.incomeCard}>
          <Text style={styles.incomeLabel}>მთლიანი შემოსავალი</Text>
          <Text style={styles.incomeAmount}>
            {totalIncome.toFixed(2).replace(".", ",")} ₾
          </Text>

          <View style={styles.divider} />

          <View style={styles.cashRow}>
            <View style={styles.cashLabelContainer}>
              <Text style={styles.cashLabel}>ჩამოსაჭრელი ნაღდი ფული</Text>
              <TouchableOpacity style={styles.infoButton}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={Colors.gray.medium}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.cashAmount}>
              {cashToWithdraw.toFixed(2).replace(".", ",")} ₾
            </Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>ბოლო ტრანზაქციები</Text>

          {mockTransactions.map((transaction, index) => (
            <View
              key={transaction.id}
              style={[
                styles.transactionItem,
                index === mockTransactions.length - 1 && styles.lastTransaction,
              ]}
            >
              <Text style={styles.transactionDate}>{transaction.date}</Text>
              <View style={styles.transactionRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionMerchant}>
                    {transaction.merchant}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.isNegative && styles.negativeAmount,
                  ]}
                >
                  {transaction.amount}
                </Text>
              </View>
            </View>
          ))}
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
    fontSize: 26,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  incomeCard: {
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    padding: Dims.padding.large,
    marginBottom: Dims.padding.large * 1.5,
  },
  incomeLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  incomeAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray.light,
    marginVertical: Dims.padding.large,
  },
  cashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cashLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cashLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  infoButton: {
    marginLeft: Dims.padding.small,
  },
  cashAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  transactionsSection: {
    marginTop: Dims.padding.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  transactionItem: {
    paddingVertical: Dims.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  lastTransaction: {
    borderBottomWidth: 0,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  transactionMerchant: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  negativeAmount: {
    color: Colors.black,
  },
});

