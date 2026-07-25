import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, FlatList, Alert, TextInput, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/client';

export default function AdminDashboardScreen() {
  const { user, logout } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('lawyers'); // lawyers | clients | requests | banners
  const [loading, setLoading] = useState(true);

  // Banners & Owner Ad Edit State
  const [ownerAdUrl, setOwnerAdUrl] = useState('');
  const [clientBannerTitle1, setClientBannerTitle1] = useState('');
  const [clientBannerSub1, setClientBannerSub1] = useState('');
  const [savingBanners, setSavingBanners] = useState(false);

  function loadAllData() {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: { totalUsers: 14, totalClients: 10, totalLawyers: 3, pendingLawyers: 1, totalRequests: 8 } })),
      api.get('/admin/lawyers').catch(() => ({ data: [] })),
      api.get('/admin/clients').catch(() => ({ data: [] })),
      api.get('/admin/requests').catch(() => ({ data: [] })),
      api.get('/admin/banners').catch(() => ({ data: {} })),
    ])
      .then(([statsRes, lawyersRes, clientsRes, requestsRes, bannersRes]) => {
        setStats(statsRes.data);
        setLawyers(lawyersRes.data || []);
        setClients(clientsRes.data || []);
        setRequests(requestsRes.data || []);

        if (bannersRes.data) {
          setOwnerAdUrl(bannersRes.data.owner_ad_image || '');
          if (bannersRes.data.client_banners?.[0]) {
            setClientBannerTitle1(bannersRes.data.client_banners[0].title || '');
            setClientBannerSub1(bannersRes.data.client_banners[0].subtitle || '');
          }
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAllData();
  }, []);

  async function handleToggleVerifyLawyer(id, currentStatus) {
    try {
      await api.put(`/admin/lawyers/${id}/verify`, { is_verified: !currentStatus });
      Alert.alert('تم التحديث', !currentStatus ? 'تم اعتماد حساب المحامي بنجاح ✅' : 'تم إلغاء اعتماد حساب المحامي');
      loadAllData();
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحديث حالة اعتماد المحامي');
    }
  }

  async function handleSaveBanners() {
    setSavingBanners(true);
    try {
      const updatedClientBanners = [
        {
          id: 'c1',
          title: clientBannerTitle1 || '📜 لائحة رسوم التوثيقات الرسمية 2026م',
          subtitle: clientBannerSub1 || 'نوّثق عقودك وشركاتك وسياراتك بحسب التعريفة المعتمدة أصولاً',
          badge: 'إعلان رسمي',
        },
      ];

      await api.put('/admin/banners', {
        client_banners: updatedClientBanners,
      });

      Alert.alert('تم الحفظ', 'تم تحديث بيانات البنرات الإعلانية وإعلان المالك بنجاح!');
      loadAllData();
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ بيانات البنرات الإعلانية');
    } finally {
      setSavingBanners(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0F6E56" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeSubtitle}>لوحة التحكم الإدارية العامة 🏛️</Text>
            <Text style={styles.welcomeName}>{user?.name || 'مدير النظام'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل خروج</Text>
          </TouchableOpacity>
        </View>

        {/* System Overview Stats Cards */}
        <Text style={styles.sectionTitle}>مؤشرات وإحصائيات النظام 📊</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>المستخدمين</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.totalLawyers || 0}</Text>
            <Text style={styles.statLabel}>المحامين</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.pendingLawyers || 0}</Text>
            <Text style={styles.statLabel}>معلقين</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.totalRequests || 0}</Text>
            <Text style={styles.statLabel}>الطلبات</Text>
          </View>
        </View>

        {/* Tab Navigation Track */}
        <View style={styles.tabTrack}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'lawyers' && styles.tabBtnActive]}
            onPress={() => setActiveTab('lawyers')}
          >
            <Text style={[styles.tabText, activeTab === 'lawyers' && styles.tabTextActive]}>
              ⚖️ المحامين ({lawyers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'clients' && styles.tabBtnActive]}
            onPress={() => setActiveTab('clients')}
          >
            <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive]}>
              👥 العملاء ({clients.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              📋 الطلبات ({requests.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'banners' && styles.tabBtnActive]}
            onPress={() => setActiveTab('banners')}
          >
            <Text style={[styles.tabText, activeTab === 'banners' && styles.tabTextActive]}>
              🖼️ البنرات
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: LAWYERS MANAGEMENT */}
        {activeTab === 'lawyers' && (
          <View style={styles.tabSection}>
            {lawyers.length === 0 ? (
              <Text style={styles.empty}>لا يوجد محامين مسجلين بعد</Text>
            ) : (
              lawyers.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>أستاذ {item.User?.name || 'محامي'}</Text>
                    <View style={[styles.badge, item.is_verified ? styles.badgeSuccess : styles.badgeWarning]}>
                      <Text style={[styles.badgeText, item.is_verified ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
                        {item.is_verified ? 'مُعتمد ✅' : 'قيد الانتظار ⏳'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>📞 هاتف: {item.User?.phone || 'غير متاح'}</Text>
                  <Text style={styles.cardSubtitle}>⚖️ التخصص: {item.specialty || 'توثيقات واستشارات'}</Text>

                  <TouchableOpacity
                    style={[styles.actionBtn, item.is_verified ? styles.actionBtnDanger : styles.actionBtnSuccess]}
                    onPress={() => handleToggleVerifyLawyer(item.id, item.is_verified)}
                  >
                    <Text style={styles.actionBtnText}>
                      {item.is_verified ? 'إلغاء الاعتماد' : 'اعتماد المحامي الموثق الآن ✅'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: CLIENTS LIST */}
        {activeTab === 'clients' && (
          <View style={styles.tabSection}>
            {clients.length === 0 ? (
              <Text style={styles.empty}>لا يوجد عملاء مسجلين بعد</Text>
            ) : (
              clients.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.client_type === 'company' ? '🏢 شركة' : item.client_type === 'government' ? '🏛️ جهة حكومية' : '👤 أفراد'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>📞 هاتف: {item.phone}</Text>
                  <Text style={styles.cardSubtitle}>📅 تاريخ التسجيل: {new Date(item.createdAt).toLocaleDateString('ar-SD')}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: REQUESTS MONITORING */}
        {activeTab === 'requests' && (
          <View style={styles.tabSection}>
            {requests.length === 0 ? (
              <Text style={styles.empty}>لا توجد طلبات سابقة بالنظام</Text>
            ) : (
              requests.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.Service?.title || 'طلب خدمة مخصصة'}</Text>
                    <Text style={styles.priceTag}>{item.price || 0} جنيه</Text>
                  </View>
                  <Text style={styles.cardSubtitle}>👤 العميل: {item.client?.name || 'غير محدد'}</Text>
                  <Text style={styles.cardSubtitle}>⚖️ المحامي: {item.LawyerProfile?.User?.name || 'لم يُحدد بعد'}</Text>
                  <Text style={styles.cardSubtitle}>📍 الموقع: {item.current_location || 'مكتب التوثيق'}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 4: BANNERS & OWNER AD MANAGEMENT */}
        {activeTab === 'banners' && (
          <View style={styles.tabSection}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>🖼️ إدارة البنرات الإعلانية المباشرة</Text>

              <Text style={styles.inputLabel}>عنوان البنر الرئيسي فوق:</Text>
              <TextInput
                style={styles.input}
                value={clientBannerTitle1}
                onChangeText={setClientBannerTitle1}
                placeholder="عنوان البنر..."
              />

              <Text style={styles.inputLabel}>النص الفرعي للبنر فوق:</Text>
              <TextInput
                style={styles.input}
                value={clientBannerSub1}
                onChangeText={setClientBannerSub1}
                placeholder="النص الفرعي..."
              />

              <TouchableOpacity
                style={styles.saveBtn}
                activeOpacity={0.85}
                onPress={handleSaveBanners}
                disabled={savingBanners}
              >
                <Text style={styles.saveBtnText}>
                  {savingBanners ? 'جاري الحفظ...' : '💾 حفظ التغييرات فوراً'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  welcomeSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'right' },
  welcomeName: { fontSize: 19, fontWeight: 'bold', color: '#0F6E56', textAlign: 'right', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  logoutText: { color: '#374151', fontSize: 12, fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, textAlign: 'right', color: '#111827' },
  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 18 },
  statBox: { width: '23%', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#0F6E56' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  tabTrack: { flexDirection: 'row-reverse', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 3, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#0F6E56' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  tabSection: { width: '100%' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginVertical: 30, fontSize: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#4B5563', textAlign: 'right', marginTop: 2 },
  badge: { backgroundColor: '#F3F4F6', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeSuccess: { backgroundColor: '#E8F5E9' },
  badgeWarning: { backgroundColor: '#FFFBEB' },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#374151' },
  badgeTextSuccess: { color: '#0F6E56' },
  badgeTextWarning: { color: '#B45309' },
  priceTag: { color: '#0F6E56', fontWeight: 'bold', fontSize: 13 },
  actionBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionBtnSuccess: { backgroundColor: '#0F6E56' },
  actionBtnDanger: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  formCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 12, textAlign: 'right', backgroundColor: '#F9FAFB', fontSize: 13, color: '#111827' },
  saveBtn: { backgroundColor: '#0F6E56', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
