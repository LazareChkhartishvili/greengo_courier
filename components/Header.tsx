import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Status, OrderState } from "../types";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface HeaderProps {
  status: Status;
  orderState: OrderState;
  onMenuPress: () => void;
  onRejectOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  orderState,
  onMenuPress,
  onRejectOrder,
}) => {
  return (
    <SafeAreaView style={styles.overlay} edges={["top"]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={Colors.gray.dark} />
        </TouchableOpacity>
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusLabel}>სტატუსი</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status === "online" ? Colors.primary : Colors.error,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: status === "online" ? Colors.primary : Colors.error,
                  },
                ]}
              >
                {status === "online" ? "აქტიური" : "არ არის აქტიური"}
              </Text>
            </View>
          </View>
        </View>
        {orderState === "pickup" && onRejectOrder && (
          <TouchableOpacity style={styles.rejectButton} onPress={onRejectOrder}>
            <Text style={styles.rejectButtonText}>უარყოფა</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Dims.padding.large,
    paddingTop: Dims.header.paddingTop,
    paddingBottom: Dims.header.paddingBottom,
  },
  menuButton: {
    position: "absolute",
    left: Dims.padding.large,
    padding: Dims.padding.small,
    borderRadius: Dims.borderRadius.large,
    backgroundColor: Colors.white,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Dims.padding.small,
  },
  statusBadge: {
    backgroundColor: Colors.overlay.light,
    borderRadius: Dims.borderRadius.large,
    paddingHorizontal: Dims.padding.medium,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 10,
    color: Colors.gray.medium,
    marginBottom: 2,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  rejectButton: {
    position: "absolute",
    right: Dims.padding.large,
    paddingHorizontal: 16,
    paddingVertical: Dims.padding.small,
    borderRadius: Dims.borderRadius.large,
    backgroundColor: Colors.overlay.light,
  },
  rejectButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
});

