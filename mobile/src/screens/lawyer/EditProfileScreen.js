import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

export default function EditProfileScreen() {
  const [specialty, setSpecialty] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current profile
    api.get('/auth/me').then((res) => {
      if (res.data?.profile) {
        setSpecialty(res.data.profile.specialty || '');
        setWhatsapp(res.data.profile.whatsapp || '');
        setBio(res.data.profile.bio || '');
        setAvatar(res.data.profile.avatar || res.data.avatar || null);
      }
    }).catch((err) => console.log(err));
  }, []);

  async function pickAvatar() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert('تنبيه', 'يرجى السماح بالوصول لمعرض الصور لاختيار صورة البروفايل');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      setSelectedAvatarFile({
        uri: asset.uri,
        name: filename || 'avatar.jpg',
        type: type,
      });
      setAvatar(asset.uri);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const form = new FormData();
      if (specialty) form.append('specialty', specialty);
      if (whatsapp) form.append('whatsapp', whatsapp);
      if (bio) form.append('bio', bio);

      if (selectedAvatarFile) {
        form.append('avatar', {
          uri: selectedAvatarFile.uri,
          name: selectedAvatarFile.name,
          type: selectedAvatarFile.type,
        });
      }

      await api.put('/lawyers/me', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('تم التحديث بنجاح 🟢', 'تم حفظ بيانات البروفايل وصورة الحساب بنجاح');
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error || 'فشل تحديث البروفايل');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture Picker */}
      <View style={styles.avatarSection}>
        <TouchableOpacity activeOpacity={0.8} onPress={pickAvatar} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar.startsWith('http') || avatar.startsWith('file') ? avatar : `${api.defaults.baseURL.replace('/api', '')}${avatar}` }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>⚖️</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Text style={styles.cameraBadgeText}>📷</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickAvatar}>
          <Text style={styles.changeAvatarText}>تغيير صورة البروفايل</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>التخصص القانوني:</Text>
      <TextInput
        style={styles.input}
        placeholder="مثلاً: قانون تجاري، عقود، أحوال شخصية"
        placeholderTextColor="#9CA3AF"
        value={specialty}
        onChangeText={setSpecialty}
      />

      <Text style={styles.label}>رقم الواتساب للتواصل:</Text>
      <TextInput
        style={styles.input}
        placeholder="249912345678"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        value={whatsapp}
        onChangeText={setWhatsapp}
      />

      <Text style={styles.label}>نبذة تعريفية وسيرة قانونية:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: { position: 'relative', width: 90, height: 90, borderRadius: 45, marginBottom: 8 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#0F6E56' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0F6E56' },
  avatarIcon: { fontSize: 36 },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0F6E56', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  cameraBadgeText: { fontSize: 12 },
  changeAvatarText: { color: '#0F6E56', fontSize: 13, fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'right', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 14, textAlign: 'right', backgroundColor: '#F9FAFB', fontSize: 14, color: '#111827' },
  textArea: { height: 90, textAlignVertical: 'top' },
  button: { backgroundColor: '#0F6E56', paddingVertical: 14, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
