import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";
import { Location } from "../types";

interface MapMarkersProps {
  driverLocation: Location;
  restaurantLocation: Location;
  customerLocation: Location;
  showRoute: boolean;
  orderState?: "none" | "offer" | "pickup" | "delivery";
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  showRoute,
  orderState = "none",
}) => {
  // Show restaurant marker during offer, pickup and delivery
  const showRestaurant = showRoute || orderState === "offer" || orderState === "pickup" || orderState === "delivery";
  // Show customer marker during offer and delivery
  const showCustomer = orderState === "offer" || orderState === "delivery";

  return (
    <>
      {/* Driver marker - bicycle icon */}
      <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.driverMarkerContainer}>
          <View style={styles.driverMarker}>
            <Ionicons name="bicycle" size={18} color={Colors.white} />
          </View>
        </View>
      </Marker>

      {/* Restaurant marker - storefront icon */}
      {showRestaurant && (
        <Marker coordinate={restaurantLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.restaurantMarker}>
            <Ionicons name="storefront" size={20} color={Colors.white} />
          </View>
        </Marker>
      )}

      {/* Customer marker - person icon */}
      {showCustomer && (
        <Marker coordinate={customerLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.customerMarker}>
            <Ionicons name="person" size={20} color={Colors.white} />
          </View>
        </Marker>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  driverMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
