import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحباً بك</Text>
      <Text style={styles.subtitle}>سجل الدخول باعتبارك:</Text>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#0F6E56' }]}
        onPress={() => navigation.navigate('Login', { role: 'client' })}
      >
        <Text style={styles.cardText}>عميل - أبحث عن محامي</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#C9952C' }]}
        onPress={() => navigation.navigate('Login', { role: 'lawyer' })}
      >
        <Text style={styles.cardText}>محامي - أقدم خدماتي</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#555' },
  card: { padding: 20, borderRadius: 14, marginBottom: 16 },
  cardText: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: '600' },
});
