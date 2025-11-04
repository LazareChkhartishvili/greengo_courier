import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { Header } from "../../components/Header";
import { MapMarkers } from "../../components/MapMarkers";
import { NavigationDrawer } from "../../components/NavigationDrawer";
import { OrderDeliveryScreen } from "../../components/OrderDeliveryScreen";
import { OrderOfferScreen } from "../../components/OrderOfferScreen";
import { OrderPickupScreen } from "../../components/OrderPickupScreen";
import { SlideButton } from "../../components/SlideButton";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";
import { useDrawer } from "../../hooks/useDrawer";
import { useLocation } from "../../hooks/useLocation";
import { useOrderSimulation } from "../../hooks/useOrderSimulation";
import { DemandLevel, Status } from "../../types";
import { getDemandConfig } from "../../utils/demand";

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const [status, setStatus] = useState<Status>("offline");
  const [demandLevel, setDemandLevel] = useState<DemandLevel>("low");
  const [panelTranslateY] = useState(new Animated.Value(0));
  const mapRef = useRef<MapView>(null);

  // Custom hooks
  const { driverLocation, mapRegion } = useLocation();
  const drawer = useDrawer();
  const orderSimulation = useOrderSimulation(driverLocation);

  // Panel dimensions
  const panelMaxHeight = height * Dims.panel.maxHeight;
  const panelMinHeight = Dims.panel.minHeight;

  // Slide button dimensions
  const slideWidth = width - Dims.padding.screen * 2;
  const maxTranslateX =
    slideWidth - Dims.slideButton.width - Dims.slideButton.padding * 2;

  // Demand interval effect
  useEffect(() => {
    const demandInterval = setInterval(() => {
      if (orderSimulation.orderState === "none") {
        const levels: DemandLevel[] = ["low", "medium", "high"];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        setDemandLevel(randomLevel);
      }
    }, 30000);

    return () => clearInterval(demandInterval);
  }, [orderSimulation.orderState]);

  // Panel pan responder
  const panelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        panelTranslateY.setOffset((panelTranslateY as any)._value);
        panelTranslateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentValue = (panelTranslateY as any)._offset + gestureState.dy;
        const maxTranslate = panelMaxHeight - panelMinHeight;
        const clampedValue = Math.max(-maxTranslate, Math.min(0, currentValue));
        panelTranslateY.setValue(
          clampedValue - (panelTranslateY as any)._offset
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        panelTranslateY.flattenOffset();
        const currentValue =
          (panelTranslateY as any)._value + (panelTranslateY as any)._offset;
        const maxTranslate = panelMaxHeight - panelMinHeight;
        const threshold = maxTranslate / 2;

        if (gestureState.dy < -30 || currentValue < -threshold) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(panelTranslateY, {
            toValue: -maxTranslate,
            useNativeDriver: true,
            tension: 60,
            friction: 8,
          }).start();
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(panelTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleToggleStatus = () => {
    setStatus(status === "offline" ? "online" : "offline");
  };

  const handleStartSimulation = () => {
    orderSimulation.startSimulation();
    setStatus("online");
  };

  // Fit map to show route when route coordinates change
  useEffect(() => {
    if (
      orderSimulation.orderState !== "none" &&
      orderSimulation.routeCoordinates.length > 0 &&
      mapRef.current
    ) {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        if (mapRef.current && orderSimulation.routeCoordinates.length > 0) {
          const coords = orderSimulation.routeCoordinates;
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: {
              top: 100,
              right: 50,
              bottom: 300,
              left: 50,
            },
            animated: true,
          });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderSimulation.orderState,
    orderSimulation.routeCoordinates.length,
    orderSimulation.restaurantLocation.latitude,
    orderSimulation.restaurantLocation.longitude,
    orderSimulation.customerLocation.latitude,
    orderSimulation.customerLocation.longitude,
  ]);

  const handleConfirmOrder = () => {
    orderSimulation.confirmOrder();
  };

  const handlePickupOrder = () => {
    orderSimulation.pickupOrder();
  };

  const handleDeliverOrder = () => {
    orderSimulation.deliverOrder();
    setStatus("online");
  };

  const handleRejectOrder = () => {
    orderSimulation.rejectOrder();
  };

  const getStatusMessage = () => {
    if (orderSimulation.orderState !== "none") return "";
    if (status === "offline") {
      return "გადადი ონლაინ რეჟიმში რადგან მიიღო შეკვეთები.";
    }
    return "თქვენ ხართ ონლაინ რეჟიმში დაელოდეთ შეკვეთებს.";
  };

  const demandConfig = getDemandConfig(demandLevel);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Map */}
      <View style={styles.map}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          mapType="standard"
          loadingEnabled={true}
        >
          <MapMarkers
            driverLocation={driverLocation}
            restaurantLocation={orderSimulation.restaurantLocation}
            customerLocation={orderSimulation.customerLocation}
            showRoute={orderSimulation.orderState !== "none"}
          />

          {/* Route polyline */}
          {orderSimulation.routeCoordinates.length > 1 && (
            <Polyline
              coordinates={orderSimulation.routeCoordinates}
              strokeColor={Colors.secondary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              geodesic={true}
            />
          )}
        </MapView>
      </View>

      {/* Header */}
      <Header
        status={status}
        orderState={orderSimulation.orderState}
        onMenuPress={drawer.toggle}
        onRejectOrder={handleRejectOrder}
      />

      {/* Delivery time badge */}
      {orderSimulation.orderState === "delivery" && (
        <View style={styles.deliveryTimeBadge}>
          <Text style={styles.deliveryTimeText}>მიტანა 15 წუთი</Text>
        </View>
      )}

      {/* Bottom Panel */}
      <Animated.View
        style={[
          styles.bottomPanelContainer,
          {
            transform: [{ translateY: panelTranslateY }],
          },
        ]}
        {...panelPanResponder.panHandlers}
      >
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {/* Demand Indicator */}
          {orderSimulation.orderState === "none" && (
            <View
              style={[
                styles.demandIndicator,
                { backgroundColor: demandConfig.backgroundColor },
              ]}
            >
              <Text style={styles.demandText}>{demandConfig.text}</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.panelContent}>
            {orderSimulation.orderState === "none" && (
              <>
                <View style={styles.locationRow}>
                  <Text style={styles.locationName}>Tskaltubo</Text>
                  <TouchableOpacity
                    style={styles.simulationButton}
                    onPress={handleStartSimulation}
                  >
                    <Text style={styles.simulationButtonText}>სიმულაცია</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
              </>
            )}

            {orderSimulation.orderState === "offer" && (
              <OrderOfferScreen onConfirm={handleConfirmOrder} />
            )}

            {orderSimulation.orderState === "pickup" && (
              <OrderPickupScreen
                preparationTime={orderSimulation.orderPreparationTime}
                isReady={orderSimulation.isOrderReady}
                onPickup={handlePickupOrder}
              />
            )}

            {orderSimulation.orderState === "delivery" && (
              <OrderDeliveryScreen onDeliver={handleDeliverOrder} />
            )}

            {/* Slide Button */}
            {orderSimulation.orderState === "none" && status === "offline" && (
              <SlideButton
                status={status}
                onToggle={handleToggleStatus}
                slideWidth={slideWidth}
                buttonWidth={Dims.slideButton.width}
                maxTranslateX={maxTranslateX}
              />
            )}
          </View>
        </BlurView>
      </Animated.View>

      {/* Navigation Drawer */}
      <NavigationDrawer
        translateX={drawer.translateX}
        overlayOpacity={drawer.overlayOpacity}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
    position: "relative",
  },
  deliveryTimeBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    right: Dims.padding.large,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: Dims.padding.small,
    borderRadius: Dims.borderRadius.large,
    zIndex: 11,
    elevation: 5,
  },
  deliveryTimeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  bottomPanelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "45%",
    overflow: "hidden",
  },
  blurContainer: {
    borderTopLeftRadius: Dims.borderRadius.xlarge,
    borderTopRightRadius: Dims.borderRadius.xlarge,
    overflow: "hidden",
    backgroundColor:
      Platform.OS === "ios"
        ? "rgba(255, 255, 255, 0.85)"
        : "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  demandIndicator: {
    paddingVertical: 14,
    paddingHorizontal: Dims.padding.large,
    borderTopLeftRadius: Dims.borderRadius.xlarge,
    borderTopRightRadius: Dims.borderRadius.xlarge,
  },
  demandText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  panelContent: {
    padding: Dims.padding.screen,
    paddingBottom: Platform.OS === "ios" ? 34 : Dims.padding.screen,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Dims.padding.small,
  },
  locationName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.small,
    letterSpacing: -0.5,
  },
  simulationButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: Dims.padding.small,
    borderRadius: Dims.borderRadius.large,
  },
  simulationButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  statusMessage: {
    fontSize: 15,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.screen,
    lineHeight: 22,
    fontWeight: "400",
  },
});
