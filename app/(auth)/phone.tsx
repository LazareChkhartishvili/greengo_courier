import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (phoneNumber.length >= 9) {
      router.push({
        pathname: '/(auth)/otp',
        params: { phoneNumber: `${selectedCountry.code}${phoneNumber}` },
      });
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
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              phoneNumber.length >= 9 && styles.continueButtonActive,
            ]}
            onPress={handleContinue}
            disabled={phoneNumber.length < 9}
          >
            <Text style={styles.continueButtonText}>გაგრძელება</Text>
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

