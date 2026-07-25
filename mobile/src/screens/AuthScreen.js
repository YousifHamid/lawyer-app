import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const CLIENT_TYPES = [
  { id: 'company', label: 'مؤسسة / شركة تجارية' },
  { id: 'individual', label: 'أفراد (حساب شخصي)' },
  { id: 'government', label: 'جهة / هيئة حكومية' },
];

export default function AuthScreen() {
  const { login, register } = useContext(AuthContext);

  const [role, setRole] = useState('client'); // client | lawyer
  const [mode, setMode] = useState('login'); // login | register

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [clientType, setClientType] = useState('company'); // company | individual | government
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedClientTypeObj = CLIENT_TYPES.find((item) => item.id === clientType) || CLIENT_TYPES[0];

  async function handleSubmit() {
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(phone, password, role);
      } else {
        await register({ name, phone, password, role, client_type: clientType, specialty, whatsapp });
      }
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Circle Logo Badge */}
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>⚖️</Text>
      </View>

      <Text style={styles.appName}>تطبيق محاميك</Text>
      <Text style={styles.subtitle}>المنصة الأولى للخدمات والاستشارات القانونية في السودان</Text>

      {/* Account Type Selector: Client vs Lawyer */}
      <View style={styles.segmentTrack}>
        <TouchableOpacity
          style={[styles.segmentTab, role === 'client' && styles.segmentTabActive]}
          activeOpacity={0.85}
          onPress={() => setRole('client')}
        >
          <Text style={[styles.segmentText, role === 'client' && styles.segmentTextActive]}>
            👤 حساب عميل
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentTab, role === 'lawyer' && styles.segmentTabActive]}
          activeOpacity={0.85}
          onPress={() => setRole('lawyer')}
        >
          <Text style={[styles.segmentText, role === 'lawyer' && styles.segmentTextActive]}>
            ⚖️ حساب محامي
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sleek Internal Dropdown Menu for Client Category */}
      {mode === 'register' && role === 'client' && (
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>صفة الحساب / نوع العميل:</Text>

          <TouchableOpacity
            style={styles.dropdownHeader}
            activeOpacity={0.85}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownHeaderIcon}>{dropdownOpen ? '▲' : '▼'}</Text>
            <Text style={styles.dropdownHeaderText}>{selectedClientTypeObj.label}</Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {CLIENT_TYPES.map((typeObj) => (
                <TouchableOpacity
                  key={typeObj.id}
                  style={[
                    styles.dropdownItem,
                    clientType === typeObj.id && styles.dropdownItemActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setClientType(typeObj.id);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      clientType === typeObj.id && styles.dropdownItemTextActive,
                    ]}
                  >
                    {typeObj.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Input Fields */}
      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder={role === 'client' && clientType === 'company' ? 'اسم المؤسسة / الشركة' : role === 'client' && clientType === 'government' ? 'اسم الجهة الحكومية' : 'الاسم الكامل'}
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="رقم الموبايل"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {mode === 'register' && role === 'lawyer' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="التخصص القانوني (مثال: جنائي، تجاري)"
            placeholderTextColor="#9CA3AF"
            value={specialty}
            onChangeText={setSpecialty}
          />
          <TextInput
            style={styles.input}
            placeholder="رقم الواتساب للتواصل"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={whatsapp}
            onChangeText={setWhatsapp}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'جاري التنفيذ...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب الآن'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
        </Text>
      </TouchableOpacity>

      {/* Vestra Technology Footer Link */}
      <TouchableOpacity
        style={styles.footerLink}
        activeOpacity={0.7}
        onPress={() => Linking.openURL('https://vestra-tech.com')}
      >
        <Text style={styles.footerText}>صُمم بواسطة فيسترا تكنولوجي • vestra-tech.com</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  logoBadge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E8F5E9',
    alignSelf: 'center',
    alignItems: 'center',
    justify: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  logoIcon: {
    fontSize: 52,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 60,
    includeFontPadding: false,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
  },
  appName: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#0F6E56' },
  subtitle: { fontSize: 12, textAlign: 'center', marginTop: 6, marginBottom: 24, color: '#6B7280' },
  segmentTrack: {
    flexDirection: 'row-reverse',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justify: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  segmentText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#0F6E56',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 9999,
  },
  dropdownLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 6 },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
  },
  dropdownHeaderText: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  dropdownHeaderIcon: { color: '#0F6E56', fontSize: 12, fontWeight: 'bold' },
  dropdownList: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    zIndex: 99999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemActive: {
    backgroundColor: '#E8F5E9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'right',
  },
  dropdownItemTextActive: {
    color: '#0F6E56',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    textAlign: 'right',
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#111827',
  },
  button: { backgroundColor: '#0F6E56', paddingVertical: 15, borderRadius: 10, marginTop: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 18, color: '#0F6E56', fontWeight: 'bold' },
  footerLink: { marginTop: 28, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});
