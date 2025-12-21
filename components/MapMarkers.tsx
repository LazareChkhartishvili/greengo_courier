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
  const showRestaurant = showRoute && (orderState === "pickup" || orderState === "delivery");
  const showCustomer = showRoute && orderState === "delivery";

  return (
    <>
      {/* Driver marker */}
      <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.driverMarker}>
          <Ionicons name="bicycle" size={Dims.markers.driver} color={Colors.secondary} />
        </View>
      </Marker>

      {/* Restaurant marker - show during pickup and delivery */}
      {showRestaurant && (
        <Marker coordinate={restaurantLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.restaurantMarker}>
            <Ionicons name="business" size={24} color={Colors.white} />
          </View>
        </Marker>
      )}

      {/* Customer marker - show only during delivery */}
      {showCustomer && (
        <Marker coordinate={customerLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.customerMarker}>
            <Ionicons name="person" size={24} color={Colors.white} />
          </View>
        </Marker>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  driverMarker: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantMarker: {
    width: Dims.markers.restaurant,
    height: Dims.markers.restaurant,
    borderRadius: Dims.markers.restaurant / 2,
    backgroundColor: Colors.restaurant,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  customerMarker: {
    width: Dims.markers.customer,
    height: Dims.markers.customer,
    borderRadius: Dims.markers.customer / 2,
    backgroundColor: Colors.customer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
});

