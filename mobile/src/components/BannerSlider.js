import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import api from '../api/client';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 32;

const CLIENT_BANNERS = [
  {
    id: 'c1',
    title: '📜 لائحة رسوم التوثيقات الرسمية 2026م',
    subtitle: 'نوّثق عقودك وشركاتك وسياراتك بحسب التعريفة المعتمدة أصولاً',
    badge: 'إعلان رسمي',
  },
  {
    id: 'c2',
    title: '⚖️ نخبة المحامين والموثقين بالسودان',
    subtitle: 'تواصل مباشر واستشارات قانونية موثوقة لحماية حقوقك',
    badge: 'خدمة متميزة',
  },
  {
    id: 'c3',
    title: '🏢 خدمات خاصة للمؤسسات والشركات',
    subtitle: 'صياغة كتيبات التأسيس والنظام الأساسي واعتماد مسجل الشركات',
    badge: 'قطاع الأعمال',
  },
];

const LAWYER_BANNERS = [
  {
    id: 'l1',
    title: '⚖️ ميثاق رسوم التوثيقات 2026م',
    subtitle: 'التزام تام بالحد الأدنى لرسوم التوثيق الرسمية وحماية المهنة',
    badge: 'تنبيه مهني',
  },
  {
    id: 'l2',
    title: '🌐 استقبال طلبات الشركات والأفراد',
    subtitle: 'قدّم عروض تنفيذ مخصصة للطلبات العامة المتاحة بالتطبيق فوراً',
    badge: 'فرص عمل',
  },
  {
    id: 'l3',
    title: '🛡️ عمولة منخفضة ومحفزة (5%)',
    subtitle: 'احصل على صافي مستحقاتك وأتعابك بكل سهولة وشفافية',
    badge: 'ميزة المنصة',
  },
];

export default function BannerSlider({ role = 'client' }) {
  const [dynamicBanners, setDynamicBanners] = useState(null);

  useEffect(() => {
    api.get('/admin/banners').then((res) => {
      if (res.data) {
        setDynamicBanners(res.data);
      }
    }).catch(() => {});
  }, []);

  const banners = role === 'lawyer'
    ? (dynamicBanners?.lawyer_banners || LAWYER_BANNERS)
    : (dynamicBanners?.client_banners || CLIENT_BANNERS);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [banners]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item, index) => item.id || String(index)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const contentOffset = e.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffset / SLIDER_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.bannerCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>{item.badge || 'إعلان'}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationRow}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18, marginTop: 4 },
  bannerCard: {
    width: SLIDER_WIDTH,
    borderRadius: 14,
    padding: 16,
    marginRight: 0,
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeRow: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F6E56',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  title: { color: '#0F6E56', fontSize: 15, fontWeight: 'bold', textAlign: 'right', marginBottom: 4 },
  subtitle: { color: '#374151', fontSize: 12, textAlign: 'right', lineHeight: 18, fontWeight: '500' },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  dotActive: { width: 18, backgroundColor: '#0F6E56' },
  dotInactive: { width: 6, backgroundColor: '#D1D5DB' },
});
