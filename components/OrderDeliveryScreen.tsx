import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface Order {
  _id: string;
  userId: {
    name?: string;
    phoneNumber: string;
  };
  restaurantId?: {
    name?: string;
  };
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount?: number;
  deliveryFee?: number;
  tip?: number;
  paymentMethod?: string;
  deliveryAddress: {
    street: string;
    city: string;
    instructions?: string;
  };
}

interface OrderDeliveryScreenProps {
  order: Order | null;
  onDeliver: () => void;
  isLoading?: boolean;
}

export const OrderDeliveryScreen: React.FC<OrderDeliveryScreenProps> = ({
  order,
  onDeliver,
  isLoading = false,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const deliveryAddress = `${order.deliveryAddress?.street || ""}, ${order.deliveryAddress?.city || ""}`;
  const instructions = order.deliveryAddress?.instructions;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>შეკვეთა მიგაქვს</Text>
      
      {/* Delivery Address */}
      <View style={styles.deliveryAddressContainer}>
        <Text style={styles.addressLabel}>მიტანის მისამართი</Text>
        <Text style={styles.addressText}>{deliveryAddress}</Text>
      </View>

      {/* Instructions */}
      {instructions && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>შენიშვნა</Text>
          <Text style={styles.notesText}>{instructions}</Text>
        </View>
      )}
      
      {/* Deliver Button */}
      <TouchableOpacity 
        style={[styles.deliverButton, isLoading && styles.deliverButtonDisabled]} 
        onPress={onDeliver}
        disabled={isLoading}
      >
        <Text style={styles.deliverButtonText}>
          {isLoading ? "მუშავდება..." : "დასრულება"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  deliveryAddressContainer: {
    marginBottom: Dims.padding.large,
  },
  addressLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  notesContainer: {
    marginBottom: Dims.padding.large,
    padding: Dims.padding.medium,
    backgroundColor: "#F5F5F5",
    borderRadius: Dims.borderRadius.small,
  },
  notesLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.black,
  },
  deliverButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Dims.borderRadius.medium,
    alignItems: "center",
    marginTop: Dims.padding.large,
  },
  deliverButtonDisabled: {
    opacity: 0.6,
  },
  deliverButtonText: {
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

