import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ route }) {
  const { role } = route.params;
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  async function handleRegister() {
    try {
      await register({ name, phone, password, role, specialty, whatsapp });
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'فشل التسجيل');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>إنشاء حساب {role === 'lawyer' ? 'محامي' : 'عميل'}</Text>

      <TextInput style={styles.input} placeholder="الاسم الكامل" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="رقم الموبايل" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />

      {role === 'lawyer' && (
        <>
          <TextInput style={styles.input} placeholder="التخصص (مثال: جنائي)" value={specialty} onChangeText={setSpecialty} />
          <TextInput style={styles.input} placeholder="رقم الواتساب" keyboardType="phone-pad" value={whatsapp} onChangeText={setWhatsapp} />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>تسجيل</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 14, textAlign: 'right' },
  button: { backgroundColor: '#0F6E56', padding: 16, borderRadius: 10, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
