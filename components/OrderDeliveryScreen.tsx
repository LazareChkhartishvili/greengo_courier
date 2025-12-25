import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  deliveryTimeMinutes?: number;
}

export const OrderDeliveryScreen: React.FC<OrderDeliveryScreenProps> = ({
  order,
  onDeliver,
  isLoading = false,
  deliveryTimeMinutes = 15,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const customerName = order.userId?.name || "მომხმარებელი";
  const deliveryAddress = order.deliveryAddress?.street || "";
  const instructions = order.deliveryAddress?.instructions;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Title */}
        <Text style={styles.sectionLabel}>შეკვეთა მიგაქვს</Text>
        
        {/* Customer Info */}
        <View style={styles.customerInfoContainer}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerAddress}>{deliveryAddress}</Text>
        </View>

        <View style={styles.divider} />

        {/* Delivery Address Section */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>მისამართის დეტალები</Text>
          <Text style={styles.deliveryAddress}>{deliveryAddress}</Text>
          
          {/* Notes */}
          {instructions && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>შენიშვნა</Text>
              <Text style={styles.notesText}>{instructions}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Deliver Button - Fixed at bottom */}
      <TouchableOpacity 
        style={[styles.deliverButton, isLoading && styles.deliverButtonDisabled]} 
        onPress={onDeliver}
        disabled={isLoading}
      >
        <Text style={styles.deliverButtonText}>
          {isLoading ? "მუშავდება..." : "შეკვეთა მიტანილია!"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Dims.padding.large,
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  customerInfoContainer: {
    marginBottom: Dims.padding.medium,
  },
  customerName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Dims.padding.small,
  },
  customerAddress: {
    fontSize: 16,
    color: Colors.gray.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray.light,
    marginVertical: Dims.padding.medium,
  },
  deliverySection: {
    marginBottom: Dims.padding.medium,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.small,
  },
  deliveryAddress: {
    fontSize: 15,
    color: Colors.black,
    marginBottom: Dims.padding.small,
  },
  notesContainer: {
    marginTop: Dims.padding.small,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.gray.medium,
    lineHeight: 20,
  },
  deliverButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Dims.borderRadius.medium,
    alignItems: "center",
    marginTop: Dims.padding.medium,
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
