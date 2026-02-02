import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Card } from '@/components/ui';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  fileType: 'pdf' | 'excel';
}

const exportOptions: ExportOption[] = [
  {
    id: '1',
    title: 'Xuất PDF',
    description: 'Tạo báo cáo dạng PDF với đầy đủ thông tin và biểu đồ',
    icon: 'document-text',
    color: '#EF4444',
    fileType: 'pdf',
  },
  {
    id: '2',
    title: 'Xuất Excel',
    description: 'Xuất dữ liệu dạng bảng tính để phân tích chi tiết',
    icon: 'stats-chart',
    color: '#10B981',
    fileType: 'excel',
  },
];

export default function ExportScreen() {
  const router = useRouter();

  const handleExport = (fileType: 'pdf' | 'excel') => {
    // Implement export logic
    console.log('Exporting as:', fileType);
    alert(`Đang xuất file ${fileType.toUpperCase()}...`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xuất báo cáo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={48} color={Colors.primary} />
          <Text style={styles.infoTitle}>Xuất báo cáo tài chính</Text>
          <Text style={styles.infoText}>
            Chọn định dạng file để xuất báo cáo chi tiết về thu chi, ngân sách và giao dịch của bạn
          </Text>
        </View>

        <View style={styles.optionsSection}>
          {exportOptions.map((option) => (
            <Card
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleExport(option.fileType)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <Ionicons name={option.icon} size={40} color={Colors.textLight} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textMuted} />
            </Card>
          ))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Nội dung báo cáo bao gồm:</Text>
          {[
            'Tổng quan thu chi theo thời gian',
            'Chi tiết giao dịch theo danh mục',
            'Biểu đồ phân tích xu hướng',
            'Tình hình ngân sách',
            'Thống kê chi tiết theo kỳ',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl + 10,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  infoTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.md,
  },
  infoText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    lineHeight: 22,
  },
  optionsSection: {
    gap: Layout.spacing.md,
    marginVertical: Layout.spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  optionIcon: {
    width: 72,
    height: 72,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  optionDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  featuresSection: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
  },
  featuresTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  featureText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
  },
});
