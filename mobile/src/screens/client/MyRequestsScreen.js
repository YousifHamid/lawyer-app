import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../../api/client';

const STATUS_CONFIG = {
  pending: { label: '⏳ قيد الانتظار', bg: '#F3F4F6', color: '#4B5563' },
  offered: { label: '📨 وصلك عرض تنفيذ', bg: '#E8F5E9', color: '#0F6E56' },
  accepted: { label: '✅ قيد التنفيذ والمتابعة', bg: '#0F6E56', color: '#FFFFFF' },
  completed: { label: '🎉 مكتمل وبنسبة 100%', bg: '#F3F4F6', color: '#0F6E56' },
  rejected: { label: '❌ مرفوض', bg: '#F3F4F6', color: '#6B7280' },
};

export default function MyRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function loadRequests() {
    api
      .get('/requests/mine')
      .then((res) => setRequests(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleCreateRequest() {
    if (!title.trim()) {
      return Alert.alert('تنبيه', 'الرجاء كتابة عنوان الخدمة أو موضوع الطلب');
    }

    setSubmitting(true);
    try {
      await api.post('/requests', {
        title: title.trim(),
        description: description.trim() || 'طلب خدمة مخصصة',
      });

      Alert.alert('تم بنجاح', 'تم تقديم طلبك بنجاح وسيتواصل معك المحامي قريباً');
      setTitle('');
      setDescription('');
      setShowForm(false);
      loadRequests();
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'فشل إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClientDecision(id, decision) {
    try {
      await api.put(`/requests/${id}/decision`, { decision });
      Alert.alert('تم', decision === 'accepted' ? 'تم قبول العرض بنجاح وبدء التعامل' : 'تم رفض العرض');
      loadRequests();
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ القرار');
    }
  }

  async function handleDeleteRequest(id) {
    Alert.alert('إلغاء وحذف الطلب', 'هل أنت تأكد من إلغاء وحذف هذا الطلب؟', [
      { text: 'رجوع', style: 'cancel' },
      {
        text: 'تأكيد الحذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/requests/${id}`);
            Alert.alert('تم', 'تم إلغاء وحذف الطلب بنجاح');
            loadRequests();
          } catch (err) {
            Alert.alert('خطأ', 'تعذر حذف الطلب');
          }
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0F6E56" />;

  return (
    <View style={styles.container}>
      {/* New Request Button */}
      <TouchableOpacity
        style={styles.toggleBtn}
        activeOpacity={0.85}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.toggleBtnText}>
          ➕ تقديم طلب خدمة جديدة
        </Text>
      </TouchableOpacity>

      {/* New Request Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>تقديم طلب خدمة مخصصة</Text>

          <TextInput
            style={styles.input}
            placeholder="موضوع الطلب (مثلاً: صياغة عقد، تسجيل شركة...)"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="تفاصيل الخدمة أو الاستشارة المطلوبة..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleCreateRequest}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'جاري الإرسال...' : 'إرسال الطلب الآن'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Requests List */}
      <Text style={styles.sectionHeader}>سجل طلباتي ومتابعة الإجراءات ({requests.length})</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد طلبات سابقة</Text>}
        renderItem={({ item }) => {
          const statusInfo = STATUS_CONFIG[item.status] || {
            label: item.status,
            bg: '#F3F4F6',
            color: '#4B5563',
          };
          const baseFee = Number(item.base_official_fee || item.price || 0);
          const lawyerFee = Number(item.offered_price || 0);
          const totalFee = baseFee + lawyerFee;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.serviceTitle}>{item.Service?.title || 'طلب خدمة مخصصة'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.lawyerName}>
                👤 {item.LawyerProfile?.User?.name ? `المحامي: ${item.LawyerProfile.User.name}` : 'طلب عام موجه لجميع المحامين المعتمدين'}
              </Text>

              {/* Live Request Tracking & Location Card */}
              <View style={styles.trackingCard}>
                <Text style={styles.trackingTitle}>📍 متابعة الإجراءات الحالية:</Text>
                <Text style={styles.trackingStep}>
                  ⏱️ مرحلة التنفيذ: {item.current_step_status || 'قيد المراجعة وإعداد الملف'}
                </Text>
                <Text style={styles.trackingLocation}>
                  🏛️ الموقع/الجهة: {item.current_location || 'مكتب المحامي الموثق'}
                </Text>

                {/* Lawyer Requirement / Notification Alert */}
                {item.lawyer_notes ? (
                  <View style={styles.requirementNoticeBox}>
                    <Text style={styles.requirementTitle}>🔔 متطلبات وإشعار من المحامي:</Text>
                    <Text style={styles.requirementText}>{item.lawyer_notes}</Text>
                  </View>
                ) : null}
              </View>

              {/* Detailed Fee Breakdown */}
              <View style={styles.feeBreakdownBox}>
                <Text style={styles.feeLine}>📜 رسوم التوثيق الرسمية الثابتة: {baseFee} جنيه</Text>
                {lawyerFee > 0 && (
                  <Text style={styles.feeLine}>⚖️ أتعاب المحامي للتنفيذ: {lawyerFee} جنيه</Text>
                )}
                <Text style={styles.totalFeeLine}>💰 إجمالي التكلفة الكلية: {totalFee} جنيه</Text>
              </View>

              {/* Offer Decision Box */}
              {item.status === 'offered' && (
                <View style={styles.offerBox}>
                  <Text style={styles.offerNotice}>قدّم المحامي عرض تنفيذ لهذا الطلب</Text>
                  
                  <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() => {
                      if (item.LawyerProfile?.id || item.lawyer_id) {
                        navigation.navigate('LawyerProfile', { id: item.LawyerProfile?.id || item.lawyer_id });
                      } else {
                        Alert.alert('تنبيه', 'يمكنك الاطلاع على تفاصيل المحامي عند اكتمال الربط');
                      }
                    }}
                  >
                    <Text style={styles.viewProfileText}>👤 تصفح بروفايل المحامي</Text>
                  </TouchableOpacity>

                  <View style={styles.decisionActionsRow}>
                    <TouchableOpacity
                      style={styles.acceptOfferBtn}
                      onPress={() => handleClientDecision(item.id, 'accepted')}
                    >
                      <Text style={styles.acceptOfferText}>✅ قبول العرض</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectOfferBtn}
                      onPress={() => handleClientDecision(item.id, 'rejected')}
                    >
                      <Text style={styles.rejectOfferText}>❌ رفض العرض</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.cancelRequestBtn}
                  onPress={() => handleDeleteRequest(item.id)}
                >
                  <Text style={styles.cancelRequestText}>🗑️ إلغاء وحذف الطلب</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#F9FAFB' },
  toggleBtn: {
    backgroundColor: '#0F6E56',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toggleBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 12 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    textAlign: 'right',
    fontSize: 14,
    color: '#111827',
    width: '100%',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#0F6E56',
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF', fontSize: 15 },
  card: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceTitle: { fontWeight: 'bold', fontSize: 15, textAlign: 'right', color: '#111827', flex: 1, marginLeft: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  lawyerName: { color: '#4B5563', textAlign: 'right', fontSize: 13, marginBottom: 8 },

  // Tracking Card
  trackingCard: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  trackingTitle: { color: '#0F6E56', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginBottom: 4 },
  trackingStep: { color: '#111827', fontSize: 12, fontWeight: '600', textAlign: 'right', marginBottom: 2 },
  trackingLocation: { color: '#374151', fontSize: 12, textAlign: 'right' },
  requirementNoticeBox: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D', borderWidth: 1, padding: 8, borderRadius: 8, marginTop: 8 },
  requirementTitle: { color: '#B45309', fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
  requirementText: { color: '#92400E', fontSize: 12, textAlign: 'right', marginTop: 2 },

  feeBreakdownBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  feeLine: { color: '#4B5563', fontSize: 12, textAlign: 'right', marginBottom: 2 },
  totalFeeLine: { color: '#0F6E56', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginTop: 4 },
  offerBox: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  offerNotice: { color: '#0F6E56', fontWeight: 'bold', fontSize: 13, textAlign: 'right', marginBottom: 8 },
  viewProfileBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  viewProfileText: { color: '#0F6E56', fontSize: 12, fontWeight: 'bold' },
  decisionActionsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  acceptOfferBtn: { backgroundColor: '#0F6E56', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, flex: 1, marginLeft: 6, alignItems: 'center' },
  acceptOfferText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  rejectOfferBtn: { backgroundColor: '#E5E7EB', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, flex: 1, alignItems: 'center' },
  rejectOfferText: { color: '#374151', fontSize: 12, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  cancelRequestBtn: { backgroundColor: '#F3F4F6', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  cancelRequestText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
});
