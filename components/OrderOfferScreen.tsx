import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface OrderOfferScreenProps {
  onConfirm: () => void;
}

export const OrderOfferScreen: React.FC<OrderOfferScreenProps> = ({
  onConfirm,
}) => {
  return (
    <>
      <View style={styles.earningsContainer}>
        <Text style={styles.earningsText}>+ 12,25 ₾</Text>
        <Text style={styles.earningsSubtext}>
          დაამატეთ თქვენს მიმდინარე ანგარიშს
        </Text>
      </View>
      <View style={styles.orderInfoContainer}>
        <Text style={styles.orderLabel}>შეკვეთა</Text>
        <Text style={styles.restaurantName}>რესტორანი მაგნოლია</Text>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceLabel}>მარშრუტის მანძილი</Text>
          <Text style={styles.distanceValue}>13.5 კმ</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>შეკვეთის დადასტურება</Text>
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
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

