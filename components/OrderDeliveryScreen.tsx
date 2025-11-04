import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface OrderDeliveryScreenProps {
  onDeliver: () => void;
}

export const OrderDeliveryScreen: React.FC<OrderDeliveryScreenProps> = ({
  onDeliver,
}) => {
  return (
    <>
      <Text style={styles.title}>შეკვეთა მიგაქვს</Text>
      <View style={styles.customerInfoContainer}>
        <Text style={styles.customerName}>Davit Avaliani</Text>
        <Text style={styles.customerAddress}>გალაქტიონ ტაბიძის 5</Text>
      </View>
      <View style={styles.deliveryAddressContainer}>
        <Text style={styles.addressLabel}>მისამართის დეტალები</Text>
        <Text style={styles.addressText}>შანიძის 43</Text>
      </View>
      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>შენიშვნა</Text>
        <Text style={styles.notesText}>კორპუსში არ მუშაობს ლიფტი</Text>
      </View>
      <TouchableOpacity style={styles.deliverButton} onPress={onDeliver}>
        <Text style={styles.deliverButtonText}>შეკვეთა მიტანილია!</Text>
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
  customerInfoContainer: {
    marginBottom: Dims.padding.large,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 16,
    color: Colors.gray.medium,
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
    marginTop: Dims.padding.small,
  },
  deliverButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

