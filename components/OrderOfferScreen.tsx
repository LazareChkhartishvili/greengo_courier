import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface Order {
  _id: string;
  restaurantId: {
    name: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryAddress: {
    coordinates: { lat: number; lng: number };
  };
  deliveryFee: number;
}

interface OrderOfferScreenProps {
  order: Order | null;
  distance?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const OrderOfferScreen: React.FC<OrderOfferScreenProps> = ({
  order,
  distance,
  onConfirm,
  isLoading = false,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const earnings = order.deliveryFee || 0;
  const distanceText = distance ? `${distance.toFixed(1)} კმ` : "—";

  return (
    <View style={styles.container}>
      {/* Earnings Section */}
      <View style={styles.earningsContainer}>
        <Text style={styles.earningsText}>+ {earnings.toFixed(2)} ₾</Text>
        <Text style={styles.earningsSubtext}>
          დაამატეთ თქვენს მიმდინარე ანგარიშს
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Order Info Section */}
      <View style={styles.orderInfoContainer}>
        <Text style={styles.orderLabel}>შეკვეთა</Text>
        <Text style={styles.restaurantName}>
          {order.restaurantId?.name || "რესტორანი"}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Distance Section */}
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceLabel}>მარშრუტის მანძილი</Text>
        <Text style={styles.distanceValue}>{distanceText}</Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity 
        style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]} 
        onPress={onConfirm}
        disabled={isLoading}
      >
        <Text style={styles.confirmButtonText}>
          {isLoading ? "მუშავდება..." : "შეკვეთის დადასტურება"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  earningsContainer: {
    marginBottom: Dims.padding.medium,
  },
  earningsText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray.light,
    marginVertical: Dims.padding.medium,
  },
  orderInfoContainer: {
    marginBottom: Dims.padding.small,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
  },
  distanceContainer: {
    marginBottom: Dims.padding.large,
  },
  distanceLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Dims.borderRadius.medium,
    alignItems: "center",
    marginTop: Dims.padding.small,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
    textAlign: "center",
    padding: Dims.padding.large,
  },
});
