import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import api from '../../api/client';

export default function ServiceDetailScreen({ route, navigation }) {
  const { service, lawyerId } = route.params;
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    try {
      await api.post('/requests', { service_id: service.id, lawyer_id: lawyerId });
      Alert.alert('تم', 'تم إرسال طلبك بنجاح، سيتواصل معك المحامي قريباً');
      navigation.navigate('MyRequests');
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'فشل إرسال الطلب');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {service.image && <Image source={{ uri: service.image }} style={styles.image} />}
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.price}>{service.price} جنيه</Text>
      <Text style={styles.description}>{service.description}</Text>

      <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'جاري الإرسال...' : 'طلب هذه الخدمة'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  image: { width: '100%', height: 180, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
  price: { fontSize: 18, color: '#0F6E56', textAlign: 'right', marginVertical: 8 },
  description: { color: '#555', textAlign: 'right', lineHeight: 22 },
  button: {
    backgroundColor: '#0F6E56',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 24,
    alignSelf: 'center',
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
