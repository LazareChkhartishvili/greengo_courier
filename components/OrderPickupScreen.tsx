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

  const items = order.items || [];
  const totalAmount = order.totalAmount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const tip = order.tip || 0;
  const paymentMethod = order.paymentMethod === "card" ? "ბარათი" : order.paymentMethod === "cash" ? "ნაღდი" : "უცნობი";

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <Text style={styles.title}>შეკვეთის აღება</Text>
        
        {/* Preparation Status - Moved to top */}
        <View
          style={[
            styles.preparationButton,
            isReady && styles.preparationButtonReady,
          ]}
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
        </View>

        <View style={styles.restaurantInfoContainer}>
          <Text style={styles.restaurantName}>
            {order.restaurantId?.name || "რესტორანი"}
          </Text>
          <Text style={styles.restaurantAddress}>{restaurantAddress}</Text>
        </View>

        {/* Order Items */}
        {items.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsLabel}>შეკვეთის დეტალები</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price.toFixed(2)} ₾</Text>
              </View>
            ))}
            <View style={styles.itemsDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>სულ:</Text>
              <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} ₾</Text>
            </View>
            {deliveryFee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>მიტანის საფასური:</Text>
                <Text style={styles.feeAmount}>{deliveryFee.toFixed(2)} ₾</Text>
              </View>
            )}
            {tip > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>ჩაი:</Text>
                <Text style={styles.feeAmount}>{tip.toFixed(2)} ₾</Text>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>გადახდის მეთოდი:</Text>
              <Text style={styles.paymentMethod}>{paymentMethod}</Text>
            </View>
          </View>
        )}
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
    paddingBottom: Dims.padding.large + 100, // Extra padding to ensure all content is visible above button
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  restaurantInfoContainer: {
    marginBottom: Dims.padding.medium,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  restaurantAddress: {
    fontSize: 16,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  preparationButton: {
    backgroundColor: Colors.warning,
    paddingVertical: Dims.padding.medium,
    paddingHorizontal: 16,
    borderRadius: Dims.borderRadius.small,
    marginBottom: Dims.padding.large,
  },
  preparationButtonReady: {
    backgroundColor: Colors.primary,
  },
  preparationButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  preparationButtonTextReady: {
    color: Colors.white,
  },
  itemsContainer: {
    marginBottom: Dims.padding.large,
    padding: Dims.padding.medium,
    backgroundColor: "#F9F9F9",
    borderRadius: Dims.borderRadius.small,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: Dims.padding.small,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Dims.padding.small,
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "500",
    marginRight: Dims.padding.small,
  },
  itemQuantity: {
    fontSize: 12,
    color: Colors.gray.medium,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  itemsDivider: {
    height: 1,
    backgroundColor: Colors.gray.light,
    marginVertical: Dims.padding.small,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Dims.padding.small,
    paddingTop: Dims.padding.small,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.light,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  feeLabel: {
    fontSize: 12,
    color: Colors.gray.medium,
  },
  feeAmount: {
    fontSize: 12,
    color: Colors.gray.medium,
    fontWeight: "500",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Dims.padding.small,
    paddingTop: Dims.padding.small,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.light,
  },
  paymentLabel: {
    fontSize: 12,
    color: Colors.gray.medium,
  },
  paymentMethod: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.black,
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

