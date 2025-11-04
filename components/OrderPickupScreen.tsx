import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface OrderPickupScreenProps {
  preparationTime: number;
  isReady: boolean;
  onPickup: () => void;
}

export const OrderPickupScreen: React.FC<OrderPickupScreenProps> = ({
  preparationTime,
  isReady,
  onPickup,
}) => {
  return (
    <>
      <Text style={styles.title}>შეკვეთის აღება</Text>
      <View style={styles.restaurantInfoContainer}>
        <Text style={styles.restaurantName}>რესტორანი მაგნოლია</Text>
        <Text style={styles.restaurantAddress}>გალაქტიონ ტაბიძის 5</Text>
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
      </View>
      <View style={styles.deliveryAddressContainer}>
        <Text style={styles.addressLabel}>მისამართის დეტალები</Text>
        <Text style={styles.addressText}>შანიძის 43</Text>
      </View>
      <TouchableOpacity
        style={[styles.pickupButton, !isReady && styles.pickupButtonDisabled]}
        onPress={onPickup}
        disabled={!isReady}
      >
        <Text style={styles.pickupButtonText}>ავიღე კერძი</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  restaurantInfoContainer: {
    marginBottom: Dims.padding.screen,
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
    marginTop: Dims.padding.small,
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
  pickupButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Dims.borderRadius.medium,
    alignItems: "center",
    marginTop: Dims.padding.small,
  },
  pickupButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  pickupButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

