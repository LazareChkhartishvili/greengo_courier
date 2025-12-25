import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header } from "../../components/Header";
import { MapMarkers } from "../../components/MapMarkers";
import { NavigationDrawer } from "../../components/NavigationDrawer";
import { OrderDeliveryScreen } from "../../components/OrderDeliveryScreen";
import { OrderOfferScreen } from "../../components/OrderOfferScreen";
import { OrderPickupScreen } from "../../components/OrderPickupScreen";
import { SlideButton } from "../../components/SlideButton";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";
import { useCourierAuth } from "../../hooks/useCourierAuth";
import { useCourierLocation } from "../../hooks/useCourierLocation";
import { useCourierOrders } from "../../hooks/useCourierOrders";
import { useDrawer } from "../../hooks/useDrawer";
import { useLocation } from "../../hooks/useLocation";
import { DemandLevel, Location, Status } from "../../types";
import { apiService } from "../../utils/api";
import { getDemandConfig } from "../../utils/demand";
import { generateSmoothRoute, getDistance, generateRandomNearbyLocation } from "../../utils/location";

type OrderState = "none" | "offer" | "pickup" | "delivery";

// Simulation order interface
interface SimulationOrder {
  _id: string;
  restaurantId: {
    name: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
      city: string;
    };
  };
  userId: {
    name: string;
    phoneNumber: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    instructions: string;
    coordinates: { lat: number; lng: number };
  };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryFee: number;
  tip: number;
  paymentMethod: string;
  status: string;
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("offline");
  const [demandLevel, setDemandLevel] = useState<DemandLevel>("low");
  const [panelTranslateY] = useState(new Animated.Value(0));
  const [orderState, setOrderState] = useState<OrderState>("none");
  const [preparationTime, setPreparationTime] = useState(0);
  const [isOrderReady, setIsOrderReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mapRef = useRef<MapView>(null);
  
  // Simulation mode state
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulationOrder, setSimulationOrder] = useState<SimulationOrder | null>(null);
  const [simRestaurantLocation, setSimRestaurantLocation] = useState<Location | null>(null);
  const [simCustomerLocation, setSimCustomerLocation] = useState<Location | null>(null);
  const [deliveryTimeMinutes, setDeliveryTimeMinutes] = useState(15);

  // Custom hooks
  const { driverLocation, mapRegion, location, isLoading: locationLoading } = useLocation();
  const drawer = useDrawer();
  const { courierId, isLoading: authLoading } = useCourierAuth();
  
  const isOnline = status === "online";
  const hasLocation = location !== null; // Check if location permission is granted
  
  // Update courier location when online and location is available
  useCourierLocation({
    courierId,
    driverLocation,
    isOnline: isOnline && hasLocation, // Only update location if permission granted
  });

  // Fetch orders from backend (only if location is available)
  const {
    availableOrders,
    currentOrder,
    loading: ordersLoading,
    acceptOrder: acceptOrderApi,
    updateOrderStatus,
    completeOrder: completeOrderApi,
  } = useCourierOrders({
    courierId,
    driverLocation,
    isOnline: isOnline && hasLocation, // Only fetch orders if location is available
  });

  // Determine current order state based on order status
  // IMPORTANT: Only update orderState when order is first assigned or status changes
  // Don't automatically change to delivery - courier must click "pickup" button first
  useEffect(() => {
    if (!currentOrder) {
      setOrderState((prev) => {
        if (prev !== "none") return "none";
        return prev;
      });
      setIsOrderReady(false);
      setPreparationTime(0);
      return;
    }

    const status = currentOrder.status;
    
    // If status is 'ready' or 'confirmed', we're in pickup phase
    // Don't automatically change orderState if it's already 'pickup' - let courier control it
    if (status === "ready" || status === "confirmed") {
      // Only set to pickup if we're not already in pickup or delivery state
      // This prevents automatic state changes when admin changes status
      setOrderState((prev) => {
        if (prev === "none" || prev === "offer") {
          return "pickup";
        }
        return prev; // Keep current state if already in pickup or delivery
      });
      
      // If status is 'ready', order is ready immediately (admin marked it as ready)
      if (status === "ready") {
        setIsOrderReady(true);
        setPreparationTime(0);
      } else {
        // If status is 'confirmed', check preparation time
        const orderDate = new Date(currentOrder.orderDate);
        const now = new Date();
        const minutesSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / 60000);
        // Assume order is ready after 5 minutes
        if (minutesSinceOrder >= 5) {
          setIsOrderReady(true);
          setPreparationTime(0);
        } else {
          setIsOrderReady(false);
          setPreparationTime(5 - minutesSinceOrder);
        }
      }
    } else if (status === "delivering") {
      // Only set to delivery if we're already in pickup state
      // This ensures courier clicked "pickup" button first
      setOrderState((prev) => {
        if (prev === "pickup") {
          return "delivery";
        }
        return prev; // Keep current state if not in pickup
      });
      setIsOrderReady(false);
      setPreparationTime(0);
    } else {
      setOrderState((prev) => {
        if (prev !== "none") return "none";
        return prev;
      });
    }
  }, [currentOrder]);

  // Show first available order as offer when online and no current order
  useEffect(() => {
    if (isOnline && !currentOrder && availableOrders.length > 0 && orderState === "none") {
      setOrderState("offer");
    }
  }, [isOnline, currentOrder, availableOrders, orderState]);

  // Simulation functions
  const startSimulation = useCallback(() => {
    if (!driverLocation) return;
    
    // Generate random nearby locations
    const restaurant = generateRandomNearbyLocation(driverLocation, 1.5);
    const customer = generateRandomNearbyLocation(restaurant, 2);
    
    setSimRestaurantLocation(restaurant);
    setSimCustomerLocation(customer);
    
    // Create simulation order
    const order: SimulationOrder = {
      _id: `sim_${Date.now()}`,
      restaurantId: {
        name: "რესტორანი მაგნოლია",
        location: {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          address: "გალაქტიონ ტაბიძის 5",
          city: "თბილისი",
        },
      },
      userId: {
        name: "Davit Avaliani",
        phoneNumber: "+995 555 123 456",
      },
      deliveryAddress: {
        street: "შანიძის 4ა",
        city: "თბილისი",
        instructions: "კორპუსში არ მუშაობს ლიფტი",
        coordinates: { lat: customer.latitude, lng: customer.longitude },
      },
      items: [
        { name: "მარგარიტა პიცა", quantity: 1, price: 18.50 },
        { name: "კოკა-კოლა 0.5ლ", quantity: 2, price: 3.00 },
      ],
      totalAmount: 24.50,
      deliveryFee: 12.25,
      tip: 2.00,
      paymentMethod: "card",
      status: "pending",
    };
    
    setSimulationOrder(order);
    setIsSimulationMode(true);
    setStatus("online");
    setOrderState("offer");
    setDeliveryTimeMinutes(15);
  }, [driverLocation]);

  const handleSimConfirmOrder = useCallback(() => {
    setOrderState("pickup");
    setIsOrderReady(false);
    setPreparationTime(3);
    
    // Quick timer for simulation (3 seconds instead of minutes)
    let timeLeft = 3;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setPreparationTime(timeLeft);
      if (timeLeft <= 0) {
        setIsOrderReady(true);
        clearInterval(timer);
      }
    }, 1000);
  }, []);

  const handleSimPickupOrder = useCallback(() => {
    if (!isOrderReady) return;
    setOrderState("delivery");
    setIsOrderReady(false);
    setPreparationTime(0);
  }, [isOrderReady]);

  const handleSimDeliverOrder = useCallback(() => {
    setOrderState("none");
    setIsSimulationMode(false);
    setSimulationOrder(null);
    setSimRestaurantLocation(null);
    setSimCustomerLocation(null);
    setIsOrderReady(false);
    setPreparationTime(0);
  }, []);

  const handleSimRejectOrder = useCallback(() => {
    setOrderState("none");
    setIsSimulationMode(false);
    setSimulationOrder(null);
    setSimRestaurantLocation(null);
    setSimCustomerLocation(null);
    setIsOrderReady(false);
    setPreparationTime(0);
  }, []);

  // Calculate locations for map
  const restaurantLocation = useMemo<Location>(() => {
    // Use simulation location if in simulation mode
    if (isSimulationMode && simRestaurantLocation) {
      return simRestaurantLocation;
    }
    if (currentOrder?.restaurantId?.location) {
      return {
        latitude: currentOrder.restaurantId.location.latitude,
        longitude: currentOrder.restaurantId.location.longitude,
      };
    }
    // Default location
    return { latitude: 41.7201, longitude: 44.7831 };
  }, [currentOrder, isSimulationMode, simRestaurantLocation]);

  const customerLocation = useMemo<Location>(() => {
    // Use simulation location if in simulation mode
    if (isSimulationMode && simCustomerLocation) {
      return simCustomerLocation;
    }
    if (currentOrder?.deliveryAddress?.coordinates) {
      return {
        latitude: currentOrder.deliveryAddress.coordinates.lat,
        longitude: currentOrder.deliveryAddress.coordinates.lng,
      };
    }
    // Default location
    return { latitude: 41.7101, longitude: 44.7931 };
  }, [currentOrder, isSimulationMode, simCustomerLocation]);

  // Calculate route coordinates based on order state
  const routeCoordinates = useMemo(() => {
    if (orderState === "none") return [];
    
    // For offer state, show full route: driver -> restaurant -> customer
    if (orderState === "offer") {
      return generateSmoothRoute([driverLocation, restaurantLocation, customerLocation]);
    }
    
    // During pickup: show route from driver to restaurant
    if (orderState === "pickup") {
      return generateSmoothRoute([driverLocation, restaurantLocation]);
    }
    
    // During delivery: show route from driver (current location) to customer
    if (orderState === "delivery") {
      return generateSmoothRoute([driverLocation, customerLocation]);
    }
    
    return [];
  }, [orderState, driverLocation, restaurantLocation, customerLocation]);

  // Calculate distance for offer screen
  const offerDistance = useMemo(() => {
    if (orderState !== "offer") return undefined;
    
    // Simulation mode distance calculation
    if (isSimulationMode && simRestaurantLocation && simCustomerLocation) {
      const driverToRestaurant = getDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        simRestaurantLocation.latitude,
        simRestaurantLocation.longitude
      );
      const restaurantToCustomer = getDistance(
        simRestaurantLocation.latitude,
        simRestaurantLocation.longitude,
        simCustomerLocation.latitude,
        simCustomerLocation.longitude
      );
      return driverToRestaurant + restaurantToCustomer;
    }
    
    if (!availableOrders[0]) return undefined;
    const order = availableOrders[0];
    if (order.restaurantId?.location && order.deliveryAddress?.coordinates) {
      return getDistance(
        order.restaurantId.location.latitude,
        order.restaurantId.location.longitude,
        order.deliveryAddress.coordinates.lat,
        order.deliveryAddress.coordinates.lng
      );
    }
    return undefined;
  }, [orderState, availableOrders, isSimulationMode, simRestaurantLocation, simCustomerLocation, driverLocation]);

  // Panel dimensions
  const panelMaxHeight = height * Dims.panel.maxHeight;
  const panelMinHeight = Dims.panel.minHeight;
  
  // Calculate center location button position (above bottom panel)
  const centerButtonBottom = useMemo(() => {
    return panelMaxHeight + Dims.padding.large;
  }, [panelMaxHeight]);

  // Slide button dimensions
  const slideWidth = width - Dims.padding.screen * 2;
  const maxTranslateX =
    slideWidth - Dims.slideButton.width - Dims.slideButton.padding * 2;

  // Demand interval effect
  useEffect(() => {
    if (orderState !== "none") return;
    
    const demandInterval = setInterval(() => {
      const levels: DemandLevel[] = ["low", "medium", "high"];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      setDemandLevel(randomLevel);
    }, 30000);

    return () => clearInterval(demandInterval);
  }, [orderState]);

  // Preparation timer
  useEffect(() => {
    if (orderState === "pickup" && !isOrderReady && preparationTime > 0) {
      const timer = setInterval(() => {
        setPreparationTime((prev) => {
          if (prev <= 1) {
            setIsOrderReady(true);
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute

      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [orderState, isOrderReady, preparationTime]);

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

  // Update courier status when toggling
  const handleToggleStatus = async () => {
    const newStatus = status === "offline" ? "online" : "offline";
    setStatus(newStatus);

    if (courierId) {
      try {
        await apiService.updateCourierStatus(
          courierId,
          newStatus === "online" ? "available" : "offline",
          newStatus === "online"
        );
      } catch (error) {
        console.error("Error updating courier status:", error);
      }
    }
  };

  // Fit map to show route when route coordinates change
  useEffect(() => {
    if (orderState !== "none" && routeCoordinates.length > 0 && mapRef.current) {
      const timer = setTimeout(() => {
        if (mapRef.current && routeCoordinates.length > 0) {
          mapRef.current.fitToCoordinates(routeCoordinates, {
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
  }, [orderState, routeCoordinates]);

  const handleConfirmOrder = async () => {
    if (!courierId || !availableOrders[0] || isProcessing) return;

    setIsProcessing(true);
    try {
      const order = availableOrders[0];
      const success = await acceptOrderApi(order._id);
      
      if (success) {
        setOrderState("pickup");
        // Start preparation timer
        setIsOrderReady(false);
        setPreparationTime(5);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickupOrder = async () => {
    if (!currentOrder || !isOrderReady || isProcessing) return;

    setIsProcessing(true);
    try {
      const success = await updateOrderStatus(currentOrder._id, "delivering");
      if (success) {
        setOrderState("delivery");
        setIsOrderReady(false);
        setPreparationTime(0);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeliverOrder = async () => {
    if (!currentOrder || !courierId || isProcessing) return;

    setIsProcessing(true);
    try {
      const success = await completeOrderApi(currentOrder._id);
      if (success) {
        setOrderState("none");
        setStatus("online");
        setIsOrderReady(false);
        setPreparationTime(0);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOrder = () => {
    if (isSimulationMode) {
      handleSimRejectOrder();
    } else {
      setOrderState("none");
    }
  };

  const handleCenterOnLocation = () => {
    if (mapRef.current && driverLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        if (mapRef.current && camera.center) {
          const currentZoom = camera.zoom || 15;
          const newZoom = Math.min(currentZoom + 1, 20);
          const delta = 0.01 / Math.pow(2, newZoom - 15);
          
          mapRef.current.animateToRegion(
            {
              latitude: camera.center.latitude,
              longitude: camera.center.longitude,
              latitudeDelta: delta,
              longitudeDelta: delta,
            },
            300
          );
        }
      }).catch(() => {
        // Fallback: use current map region
        if (mapRef.current) {
          const currentDelta = mapRegion.latitudeDelta || 0.01;
          const newDelta = currentDelta * 0.7; // Zoom in by reducing delta
          
          mapRef.current.animateToRegion(
            {
              latitude: mapRegion.latitude,
              longitude: mapRegion.longitude,
              latitudeDelta: Math.max(newDelta, 0.001),
              longitudeDelta: Math.max(newDelta, 0.001),
            },
            300
          );
        }
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        if (mapRef.current && camera.center) {
          const currentZoom = camera.zoom || 15;
          const newZoom = Math.max(currentZoom - 1, 3);
          const delta = 0.01 * Math.pow(2, 15 - newZoom);
          
          mapRef.current.animateToRegion(
            {
              latitude: camera.center.latitude,
              longitude: camera.center.longitude,
              latitudeDelta: Math.min(delta, 180),
              longitudeDelta: Math.min(delta, 360),
            },
            300
          );
        }
      }).catch(() => {
        // Fallback: use current map region
        if (mapRef.current) {
          const currentDelta = mapRegion.latitudeDelta || 0.01;
          const newDelta = currentDelta * 1.4; // Zoom out by increasing delta
          
          mapRef.current.animateToRegion(
            {
              latitude: mapRegion.latitude,
              longitude: mapRegion.longitude,
              latitudeDelta: Math.min(newDelta, 180),
              longitudeDelta: Math.min(newDelta, 360),
            },
            300
          );
        }
      });
    }
  };

  const getStatusMessage = () => {
    if (orderState !== "none") return "";
    if (status === "offline") {
      return "გადადი ონლაინ რეჟიმში რადგან მიიღო შეკვეთები.";
    }
    if (availableOrders.length === 0) {
      return "თქვენ ხართ ონლაინ რეჟიმში. ახლა შეკვეთები არ არის.";
    }
    return "თქვენ ხართ ონლაინ რეჟიმში დაელოდეთ შეკვეთებს.";
  };

  const demandConfig = getDemandConfig(demandLevel);

  // Redirect to auth if no courier ID
  useEffect(() => {
    if (!authLoading && !courierId) {
      router.replace("/(auth)/phone");
    }
  }, [authLoading, courierId, router]);

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>იტვირთება...</Text>
      </View>
    );
  }

  // Show loading while redirecting
  if (!courierId) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>გადამისამართება...</Text>
      </View>
    );
  }

  // Show location permission request if location is not available
  if (locationLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>ლოკაციის მიღება...</Text>
      </View>
    );
  }

  if (!hasLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>
          გთხოვთ, მიუთითოთ ლოკაციის წვდომა
        </Text>
        <Text style={styles.errorSubtext}>
          აპლიკაციის მუშაობისთვის საჭიროა თქვენი ლოკაცია
        </Text>
      </View>
    );
  }

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
            restaurantLocation={restaurantLocation}
            customerLocation={customerLocation}
            showRoute={orderState !== "none"}
            orderState={orderState}
          />

          {/* Route polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={Colors.secondary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              geodesic={true}
            />
          )}
        </MapView>

        {/* Center on location button */}
        <TouchableOpacity
          style={[styles.centerLocationButton, { bottom: centerButtonBottom }]}
          onPress={handleCenterOnLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Zoom controls */}
        <View style={[styles.zoomControls, { bottom: centerButtonBottom + 60 }]}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <Header
        status={status}
        orderState={orderState}
        onMenuPress={drawer.toggle}
        onRejectOrder={handleRejectOrder}
      />

      {/* Delivery time badge */}
      {orderState === "delivery" && (currentOrder || isSimulationMode) && (
        <View style={styles.deliveryTimeBadge}>
          <Text style={styles.deliveryTimeText}>მიტანა {deliveryTimeMinutes} წუთი</Text>
        </View>
      )}

      {/* Simulation Test Button */}
      {orderState === "none" && status === "online" && !isSimulationMode && (
        <TouchableOpacity
          style={styles.simulationButton}
          onPress={startSimulation}
          activeOpacity={0.8}
        >
          <Ionicons name="flask" size={20} color={Colors.white} />
          <Text style={styles.simulationButtonText}>ტესტი</Text>
        </TouchableOpacity>
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
          {orderState === "none" && (
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
            {orderState === "none" && (
              <>
                <View style={styles.locationRow}>
                  <Text style={styles.locationName}>კურიერი</Text>
                  {ordersLoading && (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  )}
                </View>
                <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
              </>
            )}

            {orderState === "offer" && (
              <OrderOfferScreen
                order={isSimulationMode ? simulationOrder : (availableOrders[0] || null)}
                distance={offerDistance}
                onConfirm={isSimulationMode ? handleSimConfirmOrder : handleConfirmOrder}
                isLoading={isProcessing}
              />
            )}

            {orderState === "pickup" && (
              <OrderPickupScreen
                order={isSimulationMode ? simulationOrder : currentOrder}
                preparationTime={preparationTime}
                isReady={isOrderReady}
                onPickup={isSimulationMode ? handleSimPickupOrder : handlePickupOrder}
              />
            )}

            {orderState === "delivery" && (
              <OrderDeliveryScreen
                order={isSimulationMode ? simulationOrder : currentOrder}
                onDeliver={isSimulationMode ? handleSimDeliverOrder : handleDeliverOrder}
                isLoading={isProcessing}
                deliveryTimeMinutes={deliveryTimeMinutes}
              />
            )}

            {/* Slide Button */}
            {orderState === "none" && status === "offline" && (
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray.medium,
  },
  errorText: {
    fontSize: 18,
    color: Colors.black,
    textAlign: "center",
    padding: 20,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.gray.medium,
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 8,
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
    maxHeight: "65%",
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
  statusMessage: {
    fontSize: 15,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.screen,
    lineHeight: 22,
    fontWeight: "400",
  },
  centerLocationButton: {
    position: "absolute",
    right: Dims.padding.large,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    zIndex: 10,
  },
  zoomControls: {
    position: "absolute",
    right: Dims.padding.large,
    width: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    zIndex: 10,
    overflow: "hidden",
  },
  zoomButton: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.gray.light,
  },
  simulationButton: {
    position: "absolute",
    left: Dims.padding.large,
    bottom: "45%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
    gap: 6,
  },
  simulationButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
