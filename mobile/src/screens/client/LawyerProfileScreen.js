import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import api from '../../api/client';

export default function LawyerProfileScreen({ route, navigation }) {
  const { id } = route.params;
  const [lawyer, setLawyer] = useState(null);

  useEffect(() => {
    api.get(`/lawyers/${id}`).then((res) => setLawyer(res.data));
  }, []);

  if (!lawyer) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0F6E56" />;

  const avatarPath = lawyer.avatar || lawyer.User?.avatar;
  const avatarUrl = avatarPath
    ? (avatarPath.startsWith('http') || avatarPath.startsWith('file')
        ? avatarPath
        : `${api.defaults.baseURL.replace('/api', '')}${avatarPath}`)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>⚖️</Text>
          </View>
        )}
        <Text style={styles.name}>{lawyer.User?.name || 'أستاذ محامي'}</Text>
        <Text style={styles.specialty}>{lawyer.specialty || 'محامي مستشار وموثق'}</Text>
        <Text style={styles.bio}>{lawyer.bio || 'محامي ومستشار معتمد لدى المحاكم السودانية'}</Text>

        <TouchableOpacity
          style={styles.whatsappBtn}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(`https://wa.me/${lawyer.whatsapp}`)}
        >
          <Text style={styles.whatsappText}>💬 تواصل مباشر عبر الواتساب</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>خدماتي القانونية ({lawyer.Services?.length || 0})</Text>
      <FlatList
        data={lawyer.Services || []}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد خدمات متاحة لهذا المحامي حالياً</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.serviceCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ServiceDetail', { service: item, lawyerId: lawyer.id })}
          >
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.servicePrice}>{item.price} جنيه</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  header: { alignItems: 'center', marginBottom: 20, backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#0F6E56' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0F6E56' },
  avatarIcon: { fontSize: 36 },
  name: { fontSize: 19, fontWeight: 'bold', marginTop: 10, color: '#111827' },
  specialty: { color: '#0F6E56', marginTop: 4, fontWeight: '700', fontSize: 14 },
  bio: { textAlign: 'center', color: '#6B7280', marginTop: 8, fontSize: 13, lineHeight: 19 },
  whatsappBtn: { backgroundColor: '#0F6E56', paddingVertical: 12, borderRadius: 10, marginTop: 14, width: '100%', alignItems: 'center' },
  whatsappText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', marginBottom: 10, color: '#111827' },
  empty: { textAlign: 'center', marginTop: 20, color: '#9CA3AF' },
  serviceCard: { padding: 14, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  serviceTitle: { fontWeight: 'bold', fontSize: 14, color: '#111827' },
  servicePrice: { color: '#0F6E56', fontWeight: 'bold', fontSize: 14 },
});
