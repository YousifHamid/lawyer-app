import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import BannerSlider from '../../components/BannerSlider';
import api from '../../api/client';

const CATEGORIES = ['جنائي', 'تسجيل شركات', 'أسماء تجارية', 'عقود', 'أحوال شخصية'];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerAdImage, setOwnerAdImage] = useState('/uploads/owner_ad_banner.png');

  useEffect(() => {
    api.get('/admin/banners').then((res) => {
      if (res.data?.owner_ad_image) {
        setOwnerAdImage(res.data.owner_ad_image);
      }
    }).catch(() => {});
  }, []);

  function handleQuickSearch() {
    if (!searchQuery.trim()) return;
    navigation.navigate('LawyersList', { searchQuery: searchQuery.trim() });
  }

  const imageUrl = ownerAdImage.startsWith('http') || ownerAdImage.startsWith('file')
    ? ownerAdImage
    : `${api.defaults.baseURL.replace('/api', '')}${ownerAdImage}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>أهلاً، {user?.name}</Text>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل خروج</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Centered Quick Search Bar */}
        <View style={styles.quickSearchRow}>
          <TextInput
            style={styles.quickSearchInput}
            placeholder="🔍 ابحث باسم المحامي أو المنطقة..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleQuickSearch}
          />
          <TouchableOpacity style={styles.quickSearchBtn} activeOpacity={0.85} onPress={handleQuickSearch}>
            <Text style={styles.quickSearchBtnText}>بحث</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Ad Banner Slider */}
        <BannerSlider role="client" />

        <Text style={styles.sectionTitle}>اختر نوع الخدمة</Text>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.categoryCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LawyersList', { specialty: item })}
            >
              <Text style={styles.categoryText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pure Owner Custom Ad Image (صورة ديناميكية تتغير من الأدمن داشبورد - تحت خيار أحوال شخصية) */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.ownerAdWrapper}
          onPress={() => navigation.navigate('LawyersList', { specialty: 'أحوال شخصية' })}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.ownerAdImagePure}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.myRequestsBtn} activeOpacity={0.85} onPress={() => navigation.navigate('MyRequests')}>
          <Text style={styles.myRequestsText}>📋 سجل طلباتي ومتابعة الإجراءات</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  welcome: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  logoutText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  quickSearchRow: {
    flexDirection: 'row-reverse',
    alignSelf: 'center',
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
  },
  quickSearchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'right',
    fontSize: 13,
    color: '#1F2937',
  },
  quickSearchBtn: {
    backgroundColor: '#0F6E56',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9,
    justify: 'center',
    alignItems: 'center',
  },
  quickSearchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, textAlign: 'right', color: '#111827' },
  categoriesGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  categoryCard: { width: '48%', backgroundColor: '#0F6E56', marginBottom: 8, paddingVertical: 18, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },

  // Pure Owner Ad Space Styles (صورة فقط بارتفاع 210)
  ownerAdWrapper: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  ownerAdImagePure: {
    width: '100%',
    height: '100%',
  },

  myRequestsBtn: { marginTop: 4, paddingVertical: 13, backgroundColor: '#0F6E56', borderRadius: 10, alignItems: 'center' },
  myRequestsText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
});
