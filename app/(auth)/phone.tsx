import { getApiInfo } from '@/utils/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCourierAuth } from '../../hooks/useCourierAuth';
import { apiService } from '../../utils/api';

const countries = [
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
];

export default function PhoneNumberScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [courierId, setCourierId] = useState('');
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const router = useRouter();
  const { saveCourierData } = useCourierAuth();

  const handleContinue = async () => {
    // If courier ID is provided, save it and go to home
    if (courierId.trim().length > 0) {
      await saveCourierData(courierId.trim(), phoneNumber || '');
      router.replace('/(app)/home');
      return;
    }

    // If phone number is provided, try to find or create courier
    if (phoneNumber.length >= 9) {
      // If name input is shown, send OTP for registration
      if (showNameInput) {
        if (!name.trim()) {
          Alert.alert('შეცდომა', 'გთხოვთ შეიყვანოთ თქვენი სახელი');
          return;
        }
        await handleSendOTP();
        return;
      }
      // Otherwise, try to find courier
      await handlePhoneNumberLogin();
      return;
    }

    Alert.alert('შეცდომა', 'გთხოვთ შეიყვანოთ ტელეფონის ნომერი ან კურიერის ID');
  };

  const handlePhoneNumberLogin = async () => {
    try {
      setLoading(true);
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;

      console.log('🔍 Searching for courier with phone:', fullPhoneNumber);
      console.log('📱 Device info:', { platform: Platform.OS });
      
      // Test backend connectivity first
      try {
        const apiInfo = getApiInfo();
        console.log('🔧 API Config:', apiInfo);
        
        // Try health check with AbortController (React Native compatible)
        const healthUrl = `${apiInfo.url}/health`;
        console.log('🏥 Testing backend connection:', healthUrl);
        
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 1000);
        
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          signal: healthController.signal,
        });
        clearTimeout(healthTimeout);
        
        const healthData = await healthResponse.json();
        console.log('✅ Backend is reachable:', healthData);
      } catch (healthError: any) {
        console.error('❌ Backend health check failed:', healthError.message);
        Alert.alert(
          'Backend Connection Error',
          `Backend-თან კავშირი ვერ დამყარდა.\n\n` +
          `URL: ${getApiInfo().url}\n\n` +
          `გთხოვთ დარწმუნდეთ რომ:\n` +
          `1. Backend გაშვებულია\n` +
          `2. Device და computer ერთსა და იმავე WiFi-ზე არიან\n` +
          `3. Firewall არ ბლოკავს port 3001-ს`
        );
        return;
      }

      // Try to find courier by phone number (with timeout handling)
      const findResponse = await apiService.findCourierByPhone(fullPhoneNumber);

      // Only process if request was successful (not timeout or network error)
      if (findResponse.success && findResponse.data) {
        // Backend returns: { data: Courier[], total, page, limit }
        // API service returns: { success: true, data: { data: Courier[], total, page, limit } }
        let couriers: any[] = [];
        
        if (Array.isArray(findResponse.data)) {
          // Direct array
          couriers = findResponse.data;
        } else if (findResponse.data.data && Array.isArray(findResponse.data.data)) {
          // Nested structure: { data: { data: [...] } }
          couriers = findResponse.data.data;
        } else if (findResponse.data.data && !Array.isArray(findResponse.data.data)) {
          // Single courier object
          couriers = [findResponse.data.data];
        }

        console.log('👤 Found couriers:', couriers.length);

        if (couriers.length > 0) {
          // Courier exists, save ID and go to home
          const courier = couriers[0];
          const id = courier._id || courier.id;
          console.log('✅ Courier found, ID:', id);
          await saveCourierData(id, fullPhoneNumber);
          router.replace('/(app)/home');
          return;
        }
      }
      
      // If courier not found or timeout/error, show name input for registration
      if (!findResponse.success) {
        console.log('ℹ️ Courier search result:', findResponse.error?.code === 'TIMEOUT' ? 'timeout (will try registration)' : findResponse.error?.details);
      }

      // Courier doesn't exist, show name input for registration
      console.log('📱 Courier not found, showing name input for registration...');
      setShowNameInput(true);
      return;
    } catch (error: any) {
      console.error('❌ Error in phone login:', error);
      const errorMessage = error.message || 'უცნობი შეცდომა';
      Alert.alert('შეცდომა', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;

      console.log('📱 Sending OTP code for registration...');
      
      const otpResponse = await apiService.sendVerificationCode(fullPhoneNumber, selectedCountry.code);
      
      if (otpResponse.success) {
        console.log('✅ OTP code sent');
        // Navigate to OTP screen with name
        router.push({
          pathname: '/(auth)/otp',
          params: { 
            phoneNumber: fullPhoneNumber,
            name: name.trim(),
          },
        });
      } else {
        const errorMessage = otpResponse.error?.details || 'OTP კოდის გაგზავნა ვერ მოხერხდა';
        console.error('❌ Send OTP failed:', errorMessage);
        Alert.alert('შეცდომა', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      const errorMessage = error.message || 'უცნობი შეცდომა';
      Alert.alert('შეცდომა', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(app)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>გამოტოვება</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="location" size={40} color="#4CAF50" />
                <Ionicons
                  name="flash"
                  size={20}
                  color="#FFC107"
                  style={styles.lightningIcon}
                />
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.logoText}>
                  <Text style={styles.greenText}>Green</Text>
                  <Text style={styles.yellowText}>Go</Text>
                </Text>
                <Text style={styles.tagline}>Delivery</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.courierIdInput,
                  courierId.length > 0 && styles.courierIdInputFilled,
                ]}
                placeholder="კურიერის ID (თუ გაქვთ)"
                placeholderTextColor="#999"
                value={courierId}
                onChangeText={setCourierId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {courierId.length === 0 && (
              <>
                {showNameInput && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.nameInput,
                        name.length > 0 && styles.nameInputFilled,
                      ]}
                      placeholder="სახელი (რეგისტრაციისთვის)"
                      placeholderTextColor="#999"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Pressable
                    style={styles.countryCodeContainer}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </Pressable>

                  <TextInput
                    style={[
                      styles.phoneInput,
                      phoneNumber.length >= 9 && styles.phoneInputFilled,
                    ]}
                    placeholder="ტელეფონის ნომერი"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (courierId.length > 0 || (phoneNumber.length >= 9 && (!showNameInput || name.length > 0))) &&
                styles.continueButtonActive,
              loading && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={
              loading || (courierId.length === 0 && (phoneNumber.length < 9 || (showNameInput && name.length === 0)))
            }
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>გაგრძელება</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          visible={showCountryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCountryPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>აირჩიეთ ქვეყანა</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === country.code &&
                      styles.countryItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.flagText}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryCodeText}>{country.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  lightningIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  greenText: {
    color: '#4CAF50',
  },
  yellowText: {
    color: '#FFC107',
  },
  tagline: {
    fontSize: 16,
    color: '#999',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'center',
    marginBottom: 16,
  },
  courierIdInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  courierIdInputFilled: {
    borderColor: '#4CAF50',
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  nameInputFilled: {
    borderColor: '#4CAF50',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
    minWidth: 100,
  },
  flagText: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  phoneInputFilled: {
    borderColor: '#4CAF50',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#4CAF50',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

