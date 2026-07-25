import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/client';

const STATUS_LABELS = {
  pending: { label: '⏳ قيد الانتظار', bg: '#F3F4F6', color: '#4B5563' },
  offered: { label: '📨 تم تقديم عرض', bg: '#E8F5E9', color: '#0F6E56' },
  accepted: { label: '✅ تم القبول', bg: '#0F6E56', color: '#FFFFFF' },
  completed: { label: '🎉 مكتمل', bg: '#F3F4F6', color: '#0F6E56' },
  rejected: { label: '❌ مرفوض', bg: '#F3F4F6', color: '#6B7280' },
};

const SAMPLE_INCOMING_REQUESTS = [
  {
    id: 'sample-1',
    Service: {
      title: 'صياغة عقد بيع عقاري بالخرطوم',
      description: 'مطلوب صياغة عقد بيع عقاري ملزم للطرفين مع توثيق كافة الضمانات والشروط الجزائية في ولاية الخرطوم.',
      price: 1000000,
    },
    client: { name: 'عثمان إبراهيم', phone: '0912112233' },
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    Service: {
      title: 'تأسيس شركة خدمات وتوثيقها',
      description: 'تأسيس شركة خدمات محدودة واستخراج عقد التأسيس والنظام الأساسي وتوثيقه لدى المسجل التجاري.',
      price: 500000,
    },
    client: { name: 'مها مصطفى', phone: '0922445566' },
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export default function LawyerDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  function loadRequests() {
    api
      .get('/requests/incoming')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setRequests(res.data);
        } else {
          setRequests(SAMPLE_INCOMING_REQUESTS);
        }
      })
      .catch(() => {
        setRequests(SAMPLE_INCOMING_REQUESTS);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleSendOffer(id) {
    Alert.prompt(
      'تقديم عرض أتعاب المحامي',
      'أدخل أتعابك الخاصة للتنفيذ (بالجنيه):\nعلماً أن رسوم التوثيق الرسمية للخدمة ثابتة وتُضاف تلقائياً.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إرسال العرض',
          onPress: async (lawyerFee) => {
            const feeNum = Number(lawyerFee) || 0;
            try {
              if (String(id).startsWith('sample')) {
                setRequests((prev) =>
                  prev.map((item) => (item.id === id ? { ...item, status: 'offered', offered_price: feeNum } : item))
                );
                setSelectedRequest(null);
                Alert.alert('تم إرسال العرض', `تم تقديم عرض التنفيذ بأتعاب محامي قدرها ${feeNum} جنيه بنجاح!`);
                return;
              }

              await api.put(`/requests/${id}/offer`, {
                offered_price: feeNum,
                offer_notes: 'تقديم عرض أتعاب المحامي للتنفيذ',
              });
              setSelectedRequest(null);
              Alert.alert('تم إرسال العرض', `تم تقديم عرض التنفيذ بأتعاب محامي قدرها ${feeNum} جنيه بنجاح!`);
              loadRequests();
            } catch (err) {
              Alert.alert('خطأ', 'تعذر تقديم عرض التنفيذ');
            }
          },
        },
      ],
      'plain-text',
      '50000'
    );
  }

  const displayRequests = requests.length > 0 ? requests : SAMPLE_INCOMING_REQUESTS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header - Tailored for Lawyers */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeSubtitle}>مرحباً أستاذ ⚖️</Text>
            <Text style={styles.welcomeName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل خروج</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Navigation Cards Grid */}
        <Text style={styles.sectionTitle}>لوحة التحكم والعمليات</Text>
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.85} onPress={() => navigation.navigate('ManageServices')}>
            <Text style={styles.menuText}>خدماتي</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} activeOpacity={0.85} onPress={() => navigation.navigate('IncomingRequests')}>
            <Text style={styles.menuText}>الطلبات الواردة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} activeOpacity={0.85} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.menuText}>بروفايلي</Text>
          </TouchableOpacity>
        </View>

        {/* Summary of Recent Incoming Requests */}
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity onPress={() => navigation.navigate('IncomingRequests')}>
            <Text style={styles.seeAllLink}>عرض الكل ➔</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>🌐 الطلبات الواردة المتاحة ({displayRequests.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#0F6E56" style={{ marginVertical: 20 }} />
        ) : (
          displayRequests.map((item) => {
            const statusInfo = STATUS_LABELS[item.status] || {
              label: item.status,
              bg: '#F3F4F6',
              color: '#4B5563',
            };

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.miniCard}
                activeOpacity={0.8}
                onPress={() => setSelectedRequest(item)}
              >
                <View style={styles.miniCardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{item.Service?.title || 'طلب خدمة مخصصة'}</Text>
                    <Text style={styles.clientDetails}>
                      👤 {item.client?.name || 'عميل'} • 📞 {item.client?.phone || 'غير متاح'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {item.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.quickOfferBtn}
                    activeOpacity={0.85}
                    onPress={() => handleSendOffer(item.id)}
                  >
                    <Text style={styles.quickOfferText}>📝 تقديم عرض أتعاب التنفيذ</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Full Request Detail Modal */}
      <Modal
        visible={!!selectedRequest}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>تفاصيل الطلب الكاملة</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.detailTitle}>{selectedRequest?.Service?.title || 'طلب خدمة مخصصة'}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>👤 العميل:</Text>
                <Text style={styles.detailValue}>{selectedRequest?.client?.name || 'غير محدد'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📞 هاتف العميل:</Text>
                <Text style={styles.detailValue}>{selectedRequest?.client?.phone || 'غير متاح'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📜 رسوم التوثيق الرسمية الثابتة:</Text>
                <Text style={[styles.detailValue, { color: '#0F6E56', fontWeight: 'bold' }]}>
                  {selectedRequest?.base_official_fee || selectedRequest?.price || selectedRequest?.Service?.price || 300000} جنيه
                </Text>
              </View>

              <Text style={styles.descHeader}>📝 تفاصيل الشكوى والطلب:</Text>
              <Text style={styles.descText}>
                {selectedRequest?.Service?.description || selectedRequest?.description || 'لا توجد تفاصيل إضافية لهذا الطلب.'}
              </Text>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              {selectedRequest?.status === 'pending' && (
                <TouchableOpacity
                  style={styles.modalOfferBtn}
                  onPress={() => handleSendOffer(selectedRequest.id)}
                >
                  <Text style={styles.modalOfferText}>📝 تقديم عرض أتعاب التنفيذ</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedRequest(null)}
              >
                <Text style={styles.modalCancelText}>تجاهل والعودة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 28, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  welcomeSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'right' },
  welcomeName: { fontSize: 19, fontWeight: 'bold', color: '#0F6E56', textAlign: 'right', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  logoutText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, textAlign: 'right', color: '#111827' },
  menuGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 20 },
  menuCard: { width: '31%', backgroundColor: '#0F6E56', paddingVertical: 22, paddingHorizontal: 6, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },

  sectionHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAllLink: { color: '#0F6E56', fontSize: 13, fontWeight: '700' },
  miniCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  miniCardTopRow: {
    flexDirection: 'row-reverse',
    justify: 'space-between',
    alignItems: 'flex-start',
  },
  serviceTitle: { fontWeight: 'bold', fontSize: 14, color: '#111827', textAlign: 'right' },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, marginLeft: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  clientDetails: { fontSize: 12, color: '#6B7280', textAlign: 'right', marginTop: 4 },
  quickOfferBtn: {
    backgroundColor: '#0F6E56',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  quickOfferText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#E5E7EB' },
  modalHeaderTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8 },
  detailTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F6E56', textAlign: 'right', marginBottom: 12 },
  detailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { color: '#6B7280', fontSize: 13 },
  detailValue: { color: '#111827', fontSize: 13, fontWeight: '600' },
  descHeader: { fontSize: 13, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginTop: 10, marginBottom: 4 },
  descText: { color: '#4B5563', fontSize: 13, textAlign: 'right', lineHeight: 20, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8 },
  modalActionsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 16 },
  modalOfferBtn: { backgroundColor: '#0F6E56', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: 'center' },
  modalOfferText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  modalCancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  modalCancelText: { color: '#374151', fontSize: 13, fontWeight: 'bold' },
});
