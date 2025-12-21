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
    <>
      <View style={styles.earningsContainer}>
        <Text style={styles.earningsText}>+ {earnings.toFixed(2)} ₾</Text>
        <Text style={styles.earningsSubtext}>
          დაამატეთ თქვენს მიმდინარე ანგარიშს
        </Text>
      </View>
      <View style={styles.orderInfoContainer}>
        <Text style={styles.orderLabel}>შეკვეთა</Text>
        <Text style={styles.restaurantName}>
          {order.restaurantId?.name || "რესტორანი"}
        </Text>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceLabel}>მარშრუტის მანძილი</Text>
          <Text style={styles.distanceValue}>{distanceText}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]} 
        onPress={onConfirm}
        disabled={isLoading}
      >
        <Text style={styles.confirmButtonText}>
          {isLoading ? "მუშავდება..." : "შეკვეთის დადასტურება"}
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  earningsContainer: {
    marginBottom: Dims.padding.screen,
  },
  earningsText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  orderInfoContainer: {
    marginBottom: Dims.padding.screen,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  distanceContainer: {
    marginTop: Dims.padding.medium,
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

