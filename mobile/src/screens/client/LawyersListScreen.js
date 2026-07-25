import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../api/client';

const SPECIALTY_SUMMARIES = {
  'تسجيل شركات': '⚖️ طبقاً لقانون الشركات السوداني لسنة 2015م:\nإتمام كافة إجراءات تأسيس الشركات المحدودة والمساهمة وإعداد عقود التأسيس.\nاعتماد وإيداع الأوراق الرسمية لدى مسجل عام الشركات التجارية بالخرطوم.',
  'أسماء تجارية': '⚖️ طبقاً لقانون الأسماء التجارية السوداني لسنة 1931م وقانون العلامات:\nاستخراج شهادات التسجيل الرسمية وحماية الاسم التجاري من التقليد والتعدي.\nمتابعة إجراءات التجديد والتنازل والنزاعات التجارية أمام الجهات المختصة.',
  'جنائي': '⚖️ طبقاً للقانون الجنائي السوداني 1991م وقانون الإجراءات الجنائية:\nتمثيل والترافع أمام النيابات والمحاكم الجنائية في كافة الدعاوى والبلاغات.\nمتابعة إجراءات الضمانة، الطعن، والاستئناف أمام المحاكم الأعلى.',
  'عقود': '⚖️ طبقاً لقانون المعاملات المدنية السوداني لسنة 1984م:\nصياغة ومراجعة العقود الاتفاقية والتجارية وعقود البيع والإيجار بحرفية.\nتوثيق العقود وتضمين الشروط الجزائية وضمان حقوق أطراف التعاقد.',
  'أحوال شخصية': '⚖️ طبقاً لقانون الأحوال الشخصية للمسلمين السوداني لسنة 1991م:\nالترافع في قضايا الزواج، الطلاق، النفقة، الحضانة، والمنازعات الأسرية.\nاستخراج إشهادات الوراثة وتوزيع التركات والحصر الشرعي أمام المحاكم.',
  'استشارات': '⚖️ طبقاً للتشريعات واللوائح والقوانين السودانية النافذة:\nتقديم الرأي والاستشارة القانونية الشاملة لحماية حقوقك ومصالحك.\nتوجيه العميل للإجراء القانوني الأنسب وتفادي المخاطر والنزاعات القضائية.',
};

export default function LawyersListScreen({ route, navigation }) {
  const { specialty, region_id, searchQuery } = route.params || {};
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const summary = SPECIALTY_SUMMARIES[specialty] || SPECIALTY_SUMMARIES['استشارات'];

  useEffect(() => {
    const params = {};
    if (specialty) params.specialty = specialty;
    if (region_id) params.region_id = region_id;

    api
      .get('/lawyers', { params })
      .then((res) => {
        let list = res.data;
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          list = list.filter(
            (l) =>
              (l.User?.name && l.User.name.toLowerCase().includes(q)) ||
              (l.specialty && l.specialty.toLowerCase().includes(q)) ||
              (l.Region?.name && l.Region.name.toLowerCase().includes(q))
          );
        }
        setLawyers(list);
      })
      .finally(() => setLoading(false));
  }, [specialty, region_id, searchQuery]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0F6E56" />;

  return (
    <View style={styles.container}>
      {/* Full Legal Summary Card */}
      {specialty && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            {summary}
          </Text>
        </View>
      )}

      <FlatList
        data={lawyers}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد محامون متاحون بهذا البحث حالياً</Text>}
        renderItem={({ item }) => {
          const avatarPath = item.avatar || item.User?.avatar;
          const avatarUrl = avatarPath
            ? (avatarPath.startsWith('http') || avatarPath.startsWith('file')
                ? avatarPath
                : `${api.defaults.baseURL.replace('/api', '')}${avatarPath}`)
            : null;

          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate('LawyerProfile', { id: item.id })}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarIcon}>⚖️</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.User?.name || 'محامي مستشار'}</Text>
                <Text style={styles.specialty}>{item.specialty || 'قانون عام وتوثيقات'}</Text>
                <Text style={styles.region}>📍 {item.Region?.name || 'الخرطوم'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, backgroundColor: '#F9FAFB' },
  summaryBox: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryText: {
    color: '#0F6E56',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 21,
  },
  empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF', fontSize: 15 },
  card: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 56, height: 56, borderRadius: 28, marginLeft: 12, borderWidth: 1.5, borderColor: '#0F6E56' },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, marginLeft: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#0F6E56' },
  avatarIcon: { fontSize: 24 },
  name: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', color: '#111827' },
  specialty: { fontSize: 13, color: '#0F6E56', textAlign: 'right', marginTop: 2, fontWeight: '600' },
  region: { color: '#6B7280', textAlign: 'right', fontSize: 12, marginTop: 2 },
});
