import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";

interface QuestItem {
  id: string;
  title: string;
  reward: string;
  dateRange: string;
  description: string;
  progress: number;
  total: number;
}

const mockQuest: QuestItem = {
  id: "1",
  title: "Bronze Quest / გამორჩევა",
  reward: "240 ₾",
  dateRange: "კვი, 2 ნოე, 23:59 - კვი, 9 ნოე, 23:59",
  description: "მიზნის მისაღწევად შეასრულე კიდევ 40 მიტანა და მიიღე 240₾",
  progress: 0,
  total: 40,
};

const REFERRAL_CODE = "6DA728EF";

interface ShareOption {
  id: string;
  name: string;
  icon: string;
  iconFamily: "ionicons" | "material";
  color: string;
}

const shareOptions: ShareOption[] = [
  {
    id: "message",
    name: "მესიჯი",
    icon: "chatbubble",
    iconFamily: "ionicons",
    color: "#34C759",
  },
  {
    id: "viber",
    name: "Viber",
    icon: "phone",
    iconFamily: "ionicons",
    color: "#7360F2",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "logo-whatsapp",
    iconFamily: "ionicons",
    color: "#25D366",
  },
  {
    id: "more",
    name: "სხვა",
    icon: "ellipsis-horizontal",
    iconFamily: "ionicons",
    color: Colors.gray.medium,
  },
];

export default function EarnMoreScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const progressPercentage = (mockQuest.progress / mockQuest.total) * 100;

  const handleInvitePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsCopied(false);
  };

  const handleCopyCode = async () => {
    try {
      await Share.share({
        message: REFERRAL_CODE,
      });
    } catch (error) {
      Alert.alert("კოპირება", `რეფერალური კოდი: ${REFERRAL_CODE}`);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async (option: ShareOption) => {
    const message = `გამოიყენე ჩემი რეფერალური კოდი GreenGo-ში და მიიღე ბონუსი! კოდი: ${REFERRAL_CODE}`;

    if (option.id === "more") {
      try {
        await Share.share({
          message,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // For specific apps, use Share API as fallback
      try {
        await Share.share({
          message,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

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
        <Text style={styles.title}>გამოიმუშავე მეტი! მოიწვიე მეგობრები.</Text>

        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <View style={styles.heroImagePlaceholder}>
            <View style={styles.phonesContainer}>
              <View style={styles.phone}>
                <Ionicons
                  name="phone-portrait"
                  size={80}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.moneyIcon}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={50}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.phone}>
                <Ionicons
                  name="phone-portrait"
                  size={80}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {/* Referral Code */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="link" size={24} color={Colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                რეფერალური კოდის გაზიარება
              </Text>
              <Text style={styles.featureDescription}>
                არ არის რეკომენდაციების ლიმიტი, ასე რომ სთხოვეთ ყველას თქვენ
                მეგობარს დროულად დარეგისტრირდება!
              </Text>
            </View>
          </View>

          {/* Complete Challenge */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="person-add" size={24} color={Colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>შეასრულეთ გამორჩევა</Text>
              <Text style={styles.featureDescription}>
                მათი გამორჩევა იქნება ერთჯერადად შეკვეთის მიტანა მათი გამოცდის
                მიზნით.
              </Text>
            </View>
          </View>

          {/* Earn Rewards */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={24}
                color={Colors.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>გაინაწილეთ კილდოები</Text>
              <Text style={styles.featureDescription}>
                შეასრულეთ ეს გამორჩევა და ორივე თქვენგანს შეძლებთ დამატებითი
                თანხის გამომუშავებას.
              </Text>
            </View>
          </View>
        </View>

        {/* Quest Card */}
        <View style={styles.questCard}>
          <View style={styles.questHeader}>
            <Text style={styles.questTitle}>{mockQuest.title}</Text>
            <View style={styles.questRewardBadge}>
              <Text style={styles.questRewardText}>{mockQuest.reward}</Text>
            </View>
          </View>

          <Text style={styles.questDateRange}>{mockQuest.dateRange}</Text>

          <Text style={styles.questDescription}>
            მიზნის მისაღწევად შეასრულე კიდევ{" "}
            <Text style={styles.highlightText}>40</Text> მიტანა და მიიღე{" "}
            <Text style={styles.highlightGreen}>240₾</Text>
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressIconStart}>
              <Text style={styles.progressIconText}>P</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <View style={styles.progressDots}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index < (mockQuest.progress / mockQuest.total) * 10 &&
                        styles.progressDotFilled,
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.progressIconEnd}>
              <Ionicons name="gift" size={20} color={Colors.primary} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.inviteButton}
          activeOpacity={0.8}
          onPress={handleInvitePress}
        >
          <Text style={styles.inviteButtonText}>მოიწვიე მეგობარი</Text>
        </TouchableOpacity>
      </View>

      {/* Share Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalDragHandle} />
            </View>

            {/* Modal Title */}
            <Text style={styles.modalTitle}>გაგზავნე მეგობარს</Text>

            {/* Referral Code Section */}
            <View style={styles.referralSection}>
              <Text style={styles.referralLabel}>რეფერალური კოდი</Text>
              <View style={styles.referralCodeContainer}>
                <Text style={styles.referralCode}>{REFERRAL_CODE}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyCode}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isCopied ? "checkmark" : "copy-outline"}
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.copyButtonText}>
                    {isCopied ? "დაკოპირდა" : "კოპირება"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Share Options */}
            <View style={styles.shareOptionsContainer}>
              <Text style={styles.shareOptionsTitle}>გააზიარე</Text>
              <View style={styles.shareOptions}>
                {shareOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.shareOption}
                    onPress={() => handleShare(option)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.shareOptionIcon,
                        { backgroundColor: option.color },
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={Colors.white}
                      />
                    </View>
                    <Text style={styles.shareOptionName}>{option.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseModal}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>გაუქმება</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
    lineHeight: 34,
  },
  heroImageContainer: {
    alignItems: "center",
    marginBottom: Dims.padding.large * 1.5,
  },
  heroImagePlaceholder: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  phonesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  phone: {
    opacity: 0.8,
  },
  moneyIcon: {
    marginHorizontal: -20,
    zIndex: 1,
  },
  featuresContainer: {
    marginBottom: Dims.padding.large * 1.5,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Dims.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Dims.padding.medium,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.gray.medium,
    lineHeight: 20,
  },
  questCard: {
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    padding: Dims.padding.large,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Dims.padding.small,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    flex: 1,
  },
  questRewardBadge: {
    backgroundColor: Colors.gray.light,
    paddingHorizontal: Dims.padding.medium,
    paddingVertical: Dims.padding.small,
    borderRadius: Dims.borderRadius.large,
  },
  questRewardText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  questDateRange: {
    fontSize: 13,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  questDescription: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
    marginBottom: Dims.padding.large,
  },
  highlightText: {
    fontWeight: "700",
  },
  highlightGreen: {
    fontWeight: "700",
    color: Colors.primary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressIconStart: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  progressIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
    marginHorizontal: Dims.padding.small,
  },
  progressBarBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.gray.light,
    borderRadius: 2,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray.light,
  },
  progressDotFilled: {
    backgroundColor: Colors.primary,
  },
  progressIconEnd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Dims.padding.screen,
    paddingBottom: Platform.OS === "ios" ? 34 : Dims.padding.screen,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.light,
  },
  inviteButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Dims.padding.large,
    borderRadius: Dims.borderRadius.medium,
    alignItems: "center",
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Dims.borderRadius.xlarge,
    borderTopRightRadius: Dims.borderRadius.xlarge,
    paddingBottom: Platform.OS === "ios" ? 34 : Dims.padding.large,
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: Dims.padding.medium,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray.light,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: Dims.padding.large,
  },
  referralSection: {
    paddingHorizontal: Dims.padding.screen,
    marginBottom: Dims.padding.large,
  },
  referralLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  referralCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.gray.light,
    borderRadius: Dims.borderRadius.medium,
    padding: Dims.padding.medium,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: Dims.padding.small,
    paddingHorizontal: Dims.padding.medium,
    borderRadius: Dims.borderRadius.small,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 4,
  },
  shareOptionsContainer: {
    paddingHorizontal: Dims.padding.screen,
    marginBottom: Dims.padding.large,
  },
  shareOptionsTitle: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  shareOptions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: Dims.padding.large,
  },
  shareOption: {
    alignItems: "center",
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Dims.padding.small,
  },
  shareOptionName: {
    fontSize: 12,
    color: Colors.black,
    textAlign: "center",
  },
  cancelButton: {
    marginHorizontal: Dims.padding.screen,
    paddingVertical: Dims.padding.large,
    borderRadius: Dims.borderRadius.medium,
    backgroundColor: Colors.gray.light,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
});
