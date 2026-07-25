import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

export default function ManageServicesScreen() {
  const [services, setServices] = useState([]);

  // Add New Service Form State
  const [addTitle, setAddTitle] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addFile, setAddFile] = useState(null);
  const [adding, setAdding] = useState(false);

  // Dedicated Edit Service Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  function loadServices() {
    api.get('/services/mine').then((res) => setServices(res.data));
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function pickDocumentOrImage(setFileState) {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert('تنبيه', 'يرجى السماح بالوصول لمعرض الصور والمستندات لرفع ملف الخدمة');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      setFileState({
        uri: asset.uri,
        name: filename || 'service_doc.jpg',
        type: type,
      });
    }
  }

  // Open Dedicated Edit Modal for a Specific Service
  function handleOpenEditModal(item) {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditPrice(String(item.price || ''));
    setEditDescription(item.description || '');
    setEditFile(null);
    setEditModalVisible(true);
  }

  function handleCloseEditModal() {
    setEditModalVisible(false);
    setEditingItem(null);
    setEditTitle('');
    setEditPrice('');
    setEditDescription('');
    setEditFile(null);
  }

  function handleOptionsPress(item) {
    Alert.alert(
      `خيارات: ${item.title}`,
      'اختر الإجراء المطلوب للخدمة:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: '✏️ تعديل هذه الخدمة ورفع المستند',
          onPress: () => handleOpenEditModal(item),
        },
        {
          text: '🗑️ حذف الخدمة',
          style: 'destructive',
          onPress: () => handleDelete(item.id),
        },
      ]
    );
  }

  // Add New Service Handler
  async function handleAddNewService() {
    if (!addTitle.trim() || !addPrice) {
      return Alert.alert('تنبيه', 'الرجاء إدخال اسم الخدمة والسعر');
    }

    setAdding(true);
    try {
      const form = new FormData();
      form.append('title', addTitle.trim());
      form.append('description', addDescription.trim());
      form.append('price', addPrice);

      if (addFile) {
        form.append('image', {
          uri: addFile.uri,
          name: addFile.name,
          type: addFile.type,
        });
      }

      await api.post('/services', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('تمت الإضافة بنجاح', 'تمت إضافة الخدمة الجديدة لقائمتك');
      setAddTitle('');
      setAddPrice('');
      setAddDescription('');
      setAddFile(null);
      loadServices();
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'فشل إضافة الخدمة');
    } finally {
      setAdding(false);
    }
  }

  // Save Specific Service Edit Handler
  async function handleSaveServiceEdit() {
    if (!editTitle.trim() || !editPrice) {
      return Alert.alert('تنبيه', 'الرجاء إدخال اسم الخدمة والسعر');
    }

    setSavingEdit(true);
    try {
      const form = new FormData();
      form.append('title', editTitle.trim());
      form.append('description', editDescription.trim());
      form.append('price', editPrice);

      if (editFile) {
        form.append('image', {
          uri: editFile.uri,
          name: editFile.name,
          type: editFile.type,
        });
      }

      await api.put(`/services/${editingItem.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('تم التعديل بنجاح', 'تم حفظ تعديلات الخدمة والمستند بنجاح');
      handleCloseEditModal();
      loadServices();
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'فشل حفظ تعديلات الخدمة');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id) {
    Alert.alert('حذف الخدمة', 'هل أنت تأكد من حذف هذه الخدمة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تأكيد الحذف',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/services/${id}`);
          if (editingItem?.id === id) handleCloseEditModal();
          loadServices();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* ➕ Add New Service Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>➕ إضافة خدمة جديدة</Text>

        <TextInput
          style={styles.input}
          placeholder="اسم الخدمة (مثلاً: صياغة عقد بيع)"
          placeholderTextColor="#9CA3AF"
          value={addTitle}
          onChangeText={setAddTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="السعر (بالجنيه)"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={addPrice}
          onChangeText={setAddPrice}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="تفاصيل وشروط الخدمة..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          value={addDescription}
          onChangeText={setAddDescription}
        />

        {/* Upload Document / Image Button for New Service */}
        <TouchableOpacity
          style={styles.uploadBtn}
          activeOpacity={0.8}
          onPress={() => pickDocumentOrImage(setAddFile)}
        >
          <Text style={styles.uploadBtnText}>
            {addFile ? `📄 تم اختيار: ${addFile.name}` : '📎 ارفع مستند / صورة مرفقة للخدمة'}
          </Text>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleAddNewService}
          disabled={adding}
        >
          <Text style={styles.saveBtnText}>
            {adding ? 'جاري الإضافة...' : 'إضافة الخدمة الآن'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <Text style={styles.listHeader}>خدماتي المضافة ({services.length})</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد خدمات مضافة حالياً</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleOptionsPress(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.servicePrice}>{item.price} جنيه</Text>
              {item.image && <Text style={styles.hasDoc}>📎 يحتوي على مستند/مرفق</Text>}
            </View>

            {/* 3-Dots Options Button */}
            <TouchableOpacity
              style={styles.moreBtn}
              activeOpacity={0.7}
              onPress={() => handleOptionsPress(item)}
            >
              <Text style={styles.moreIcon}>⋮</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Dedicated Edit Service Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>✏️ تعديل بيانات الخدمة</Text>

            <ScrollView style={{ maxHeight: 350 }}>
              <Text style={styles.inputLabel}>اسم الخدمة:</Text>
              <TextInput
                style={styles.input}
                placeholder="اسم الخدمة"
                placeholderTextColor="#9CA3AF"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={styles.inputLabel}>السعر (بالجنيه):</Text>
              <TextInput
                style={styles.input}
                placeholder="السعر (بالجنيه)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={editPrice}
                onChangeText={setEditPrice}
              />

              <Text style={styles.inputLabel}>التفاصيل والوصف:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="تفاصيل وشروط الخدمة..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={editDescription}
                onChangeText={setEditDescription}
              />

              {/* Upload Document Button for Editing */}
              <TouchableOpacity
                style={styles.uploadBtn}
                activeOpacity={0.8}
                onPress={() => pickDocumentOrImage(setEditFile)}
              >
                <Text style={styles.uploadBtnText}>
                  {editFile ? `📄 تم اختيار: ${editFile.name}` : '📎 تحديث المستند / الصورة المرفقة'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.saveEditBtn}
                activeOpacity={0.85}
                onPress={handleSaveServiceEdit}
                disabled={savingEdit}
              >
                <Text style={styles.saveEditBtnText}>
                  {savingEdit ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={handleCloseEditModal}
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
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  form: { marginBottom: 20, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 10, textAlign: 'right', backgroundColor: '#FFFFFF', fontSize: 14, color: '#111827' },
  textArea: { height: 75, textAlignVertical: 'top' },
  uploadBtn: { backgroundColor: '#E8F5E9', borderColor: '#A7F3D0', borderWidth: 1, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  uploadBtnText: { color: '#0F6E56', fontSize: 13, fontWeight: '600' },
  saveBtn: { backgroundColor: '#0F6E56', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  listHeader: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 30, color: '#9CA3AF' },
  card: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  serviceTitle: { fontWeight: 'bold', fontSize: 15, textAlign: 'right', color: '#111827' },
  servicePrice: { color: '#0F6E56', textAlign: 'right', marginTop: 2, fontWeight: '700', fontSize: 13 },
  hasDoc: { color: '#6B7280', fontSize: 12, textAlign: 'right', marginTop: 4 },
  moreBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  moreIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  // Dedicated Edit Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#E5E7EB' },
  modalHeaderTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', textAlign: 'right', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'right', marginBottom: 4 },
  modalActionsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 16 },
  saveEditBtn: { backgroundColor: '#0F6E56', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: 'center' },
  saveEditBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  modalCancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  modalCancelText: { color: '#374151', fontSize: 14, fontWeight: 'bold' },
});
