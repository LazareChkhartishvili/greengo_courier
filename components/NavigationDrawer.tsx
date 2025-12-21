import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface NavigationDrawerProps {
  translateX: Animated.AnimatedInterpolation<number>;
  overlayOpacity: Animated.AnimatedInterpolation<number>;
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  translateX,
  overlayOpacity,
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const handleStatisticsPress = () => {
    onClose();
    router.push("/(app)/statistics");
  };
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: Colors.background,
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <BlurView intensity={100} tint="light" style={styles.blur}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>გამარჯობა, DAVIT AVALIANI 👋</Text>
          </View>

          {/* Profile Section */}
          <TouchableOpacity style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Davit Avaliani</Text>
              <Text style={styles.profileLabel}>ჩემი პროფილი</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
          </TouchableOpacity>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {/* Notifications */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>შეტყობინებები</Text>
              </View>
              <View style={styles.menuItemRight}>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Finances */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="cash" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>ფინანსები</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
            </TouchableOpacity>

            {/* Statistics */}
            <TouchableOpacity style={styles.menuItem} onPress={handleStatisticsPress}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="stats-chart" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>სტატისტიკა</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
            </TouchableOpacity>

            {/* Earn More */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="wallet" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>გამოიმუშავე მეტი</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
            </TouchableOpacity>

            {/* Support */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="headset" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>მხარდაჭერა</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "85%",
    maxWidth: Dims.drawer.maxWidth,
    zIndex: 1000,
    elevation: 1000,
  },
  blur: {
    flex: 1,
    backgroundColor:
      Platform.OS === "ios" ? Colors.overlay.light : Colors.white,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Dims.drawerHeader.paddingTop,
    paddingBottom: Dims.drawerHeader.paddingBottom,
    paddingHorizontal: Dims.padding.large,
    borderTopRightRadius: 0,
    borderBottomRightRadius: Dims.borderRadius.xlarge,
  },
  greeting: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "600",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: Dims.padding.large,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray.light,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  profileLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  menuItems: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Dims.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 16,
    fontWeight: "500",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Dims.padding.small,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
});

