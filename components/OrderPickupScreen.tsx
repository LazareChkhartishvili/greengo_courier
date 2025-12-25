import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface Order {
  _id: string;
  restaurantId: {
    name: string;
    location?: {
      address?: string;
      city?: string;
    };
  };
  deliveryAddress: {
    street: string;
    city: string;
    instructions?: string;
  };
  status: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount?: number;
  deliveryFee?: number;
  tip?: number;
  paymentMethod?: string;
}

interface OrderPickupScreenProps {
  order: Order | null;
  preparationTime: number;
  isReady: boolean;
  onPickup: () => void;
}

export const OrderPickupScreen: React.FC<OrderPickupScreenProps> = ({
  order,
  preparationTime,
  isReady,
  onPickup,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const restaurantAddress =
    order.restaurantId?.location?.address ||
    `${order.restaurantId?.location?.city || ""}` ||
    "მისამართი არ არის მითითებული";

  const deliveryAddress = `${order.deliveryAddress?.street || ""}`;
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
        <Text style={styles.sectionLabel}>შეკვეთის აღება</Text>
        
        {/* Restaurant Info */}
        <View style={styles.restaurantInfoContainer}>
          <Text style={styles.restaurantName}>
            {order.restaurantId?.name || "რესტორანი"}
          </Text>
          <Text style={styles.restaurantAddress}>{restaurantAddress}</Text>
        </View>

        {/* Preparation Status Button */}
        <TouchableOpacity
          style={[
            styles.preparationButton,
            isReady && styles.preparationButtonReady,
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.preparationButtonText,
              isReady && styles.preparationButtonTextReady,
            ]}
          >
            {isReady
              ? "შეკვეთა მზადაა"
              : `შეკვეთა მზადდება... (${preparationTime}წ)`}
          </Text>
        </TouchableOpacity>

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

      {/* Pickup Button - Fixed at bottom */}
      <TouchableOpacity
        style={[styles.pickupButton, !isReady && styles.pickupButtonDisabled]}
        onPress={onPickup}
        disabled={!isReady}
      >
        <Text style={styles.pickupButtonText}>ავიღე კერძი</Text>
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
  restaurantInfoContainer: {
    marginBottom: Dims.padding.medium,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Dims.padding.small,
  },
  restaurantAddress: {
    fontSize: 16,
    color: Colors.gray.medium,
  },
  preparationButton: {
    backgroundColor: "#E3F2FD",
    paddingVertical: Dims.padding.medium,
    paddingHorizontal: 16,
    borderRadius: Dims.borderRadius.small,
    marginBottom: Dims.padding.medium,
    alignSelf: "flex-start",
  },
  preparationButtonReady: {
    backgroundColor: "#E8F5E9",
  },
  preparationButtonText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "600",
  },
  preparationButtonTextReady: {
    color: Colors.primary,
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
  pickupButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Dims.borderRadius.medium,
    alignItems: "center",
    marginTop: Dims.padding.medium,
  },
  pickupButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  pickupButtonText: {
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
