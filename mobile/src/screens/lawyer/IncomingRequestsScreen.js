import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking, Modal, ScrollView, TextInput } from 'react-native';
import api from '../../api/client';

const STATUS_LABELS = {
  pending: { label: '⏳ قيد الانتظار', color: '#4B5563', bg: '#F3F4F6' },
  offered: { label: '📨 تم تقديم عرض', color: '#0F6E56', bg: '#E8F5E9' },
  accepted: { label: '✅ قيد التنفيذ والمتابعة', color: '#FFFFFF', bg: '#0F6E56' },
  rejected: { label: '❌ مرفوض', color: '#6B7280', bg: '#F3F4F6' },
  completed: { label: '🎉 مكتمل', color: '#0F6E56', bg: '#F3F4F6' },
};

const SAMPLE_INCOMING_REQUESTS = [
  {
    id: 'sample-1',
    Service: {
      title: 'صياغة عقد بيع وشراء عقاري بالخرطوم',
      description: 'مطلوب صياغة عقد بيع عقاري ملزم للطرفين مع توثيق كافة الضمانات والشروط الجزائية في ولاية الخرطوم.',
      price: 1000000,
    },
    client: { name: 'عثمان إبراهيم', phone: '0912112233' },
    status: 'accepted',
    base_official_fee: 1000000,
    current_step_status: 'جاري مراجعة الأوراق وتوثيق العقد',
    current_location: 'مكتب التوثيقات - الخرطوم',
    lawyer_notes: 'يرجى إرسال صورة الهوية الوطنية للطرف الثاني عبر الواتساب',
  },
  {
    id: 'sample-2',
    Service: {
      title: 'تأسيس شركة خدمات وتوثيقها لدى المسجل التجاري',
      description: 'تأسيس شركة خدمات محدودة واستخراج عقد التأسيس والنظام الأساسي وتوثيقه لدى المسجل التجاري.',
      price: 500000,
    },
    client: { name: 'مها مصطفى', phone: '0922445566' },
    status: 'pending',
    base_official_fee: 500000,
  },
];

export default function IncomingRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Progress & Requirements Update Modal State
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [progressItem, setProgressItem] = useState(null);
  const [stepStatus, setStepStatus] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);

  function load() {
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
    load();
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
              load();
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

  function handleOpenProgressModal(item) {
    setProgressItem(item);
    setStepStatus(item.current_step_status || 'جاري الصياغة والتوثيق');
    setLocationName(item.current_location || 'المسجل التجاري / مجمع التوثيقات');
    setLawyerNotes(item.lawyer_notes || '');
    setProgressModalVisible(true);
  }

  async function handleSaveProgress() {
    setSavingProgress(true);
    try {
      if (String(progressItem.id).startsWith('sample')) {
        setRequests((prev) =>
          prev.map((item) =>
            item.id === progressItem.id
              ? {
                  ...item,
                  current_step_status: stepStatus,
                  current_location: locationName,
                  lawyer_notes: lawyerNotes,
                }
              : item
          )
        );
        Alert.alert('تم التحديث 🟢', 'تم تحديث حالة وتفاصيل وإشعار الإجراء بنجاح!');
        setProgressModalVisible(false);
        return;
      }

      await api.put(`/requests/${progressItem.id}/progress`, {
        current_step_status: stepStatus,
        current_location: locationName,
        lawyer_notes: lawyerNotes,
      });

      Alert.alert('تم التحديث 🟢', 'تم تحديث حالة الإجراء وإرسال الإشعار للعميل بنجاح!');
      setProgressModalVisible(false);
      load();
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحديث بيانات الإجراء');
    } finally {
      setSavingProgress(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0F6E56" />;

  const displayList = requests.length > 0 ? requests : SAMPLE_INCOMING_REQUESTS;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🌐 طلبات الخدمة العامة والمتابعة ({displayList.length})</Text>

      <FlatList
        data={displayList}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد طلبات واردة بعد</Text>}
        renderItem={({ item }) => {
          const statusInfo = STATUS_LABELS[item.status] || {
            label: item.status,
            color: '#374151',
            bg: '#F3F4F6',
          };
          const baseOfficialFee = Number(item.base_official_fee || item.price || item.Service?.price || 0);

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => setSelectedRequest(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.serviceTitle}>{item.Service?.title || 'طلب خدمة مخصصة'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.clientName}>
                👤 العميل: {item.client?.name || 'عميل'} • 📞 {item.client?.phone || 'غير متاح'}
              </Text>

              <Text style={styles.officialFeeNotice}>
                📜 رسوم التوثيق الرسمية الثابتة: {baseOfficialFee} جنيه
              </Text>

              {item.status === 'accepted' && (
                <View style={styles.progressInfoBox}>
                  <Text style={styles.progressStepText}>📍 المرحلة: {item.current_step_status || 'قيد المعالجة'}</Text>
                  <Text style={styles.progressLocText}>🏛️ الجهة: {item.current_location || 'مكتب المحامي'}</Text>
                </View>
              )}

              {item.status === 'pending' ? (
                <TouchableOpacity
                  style={styles.offerBtn}
                  activeOpacity={0.85}
                  onPress={() => handleSendOffer(item.id)}
                >
                  <Text style={styles.offerBtnText}>📝 تقديم عرض أتعاب التنفيذ</Text>
                </TouchableOpacity>
              ) : item.status === 'accepted' ? (
                <View style={styles.acceptedActionsRow}>
                  <TouchableOpacity
                    style={styles.updateProgressBtn}
                    onPress={() => handleOpenProgressModal(item)}
                  >
                    <Text style={styles.updateProgressText}>🔄 تحديث الإجراء والموقع والإشعار</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.whatsappBtn}
                    onPress={() => Linking.openURL(`https://wa.me/249${item.client?.phone?.replace(/^0/, '')}`)}
                  >
                    <Text style={styles.whatsappText}>💬 الواتساب</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      {/* Progress & Requirement Update Modal */}
      <Modal
        visible={progressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>🔄 تحديث حالة الإجراء وإرسال إشعار للعميل</Text>

            <ScrollView style={{ maxHeight: 320 }}>
              <Text style={styles.inputLabel}>حالة ومرحلة الإجراء الحالية:</Text>
              <TextInput
                style={styles.input}
                placeholder="مثلاً: جاري الصياغة والتوثيق / تم إيداع المطبوعات"
                placeholderTextColor="#9CA3AF"
                value={stepStatus}
                onChangeText={setStepStatus}
              />

              <Text style={styles.inputLabel}>موقع الإجراء / اسم الجهة الرسمية:</Text>
              <TextInput
                style={styles.input}
                placeholder="مثلاً: المسجل التجاري بالخرطوم / مجمع المحاكم"
                placeholderTextColor="#9CA3AF"
                value={locationName}
                onChangeText={setLocationName}
              />

              <Text style={styles.inputLabel}>تنبيه ومتطلبات موجهة للعميل (إشعار):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="اكتب ملاحظاتك أو الأوراق المطلوب من العميل رفعها..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={lawyerNotes}
                onChangeText={setLawyerNotes}
              />
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.saveProgressBtn}
                activeOpacity={0.85}
                onPress={handleSaveProgress}
                disabled={savingProgress}
              >
                <Text style={styles.saveProgressBtnText}>
                  {savingProgress ? 'جاري الإرسال...' : '💾 إرسال التحديث والإشعار'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setProgressModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF', fontSize: 15 },
  card: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceTitle: { fontWeight: 'bold', fontSize: 15, textAlign: 'right', color: '#111827', flex: 1, marginLeft: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  clientName: { color: '#4B5563', textAlign: 'right', marginTop: 4, fontSize: 13, fontWeight: '600' },
  officialFeeNotice: { color: '#0F6E56', textAlign: 'right', marginTop: 6, fontSize: 13, fontWeight: 'bold' },
  progressInfoBox: { backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  progressStepText: { color: '#0F6E56', fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
  progressLocText: { color: '#4B5563', fontSize: 12, textAlign: 'right', marginTop: 2 },
  offerBtn: { backgroundColor: '#0F6E56', paddingVertical: 12, borderRadius: 10, marginTop: 14, alignItems: 'center' },
  offerBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  acceptedActionsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 12 },
  updateProgressBtn: { backgroundColor: '#0F6E56', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, flex: 1, marginLeft: 6, alignItems: 'center' },
  updateProgressText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  whatsappBtn: { backgroundColor: '#25D366', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  whatsappText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#E5E7EB' },
  modalHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 11, marginBottom: 12, textAlign: 'right', backgroundColor: '#F9FAFB', fontSize: 13, color: '#111827' },
  textArea: { height: 75, textAlignVertical: 'top' },
  modalActionsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 14 },
  saveProgressBtn: { backgroundColor: '#0F6E56', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: 'center' },
  saveProgressBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  modalCancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  modalCancelText: { color: '#374151', fontSize: 13, fontWeight: 'bold' },
});
