import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Card } from '@/components/ui';
import { reportService } from '@/services/report.service';
import { formatDate } from '@/utils/formatDate';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  fileType: 'pdf' | 'excel';
  features: string[];
}

const exportOptions: ExportOption[] = [
  {
    id: '1',
    title: 'Xuất PDF',
    description: 'Báo cáo tổng hợp dạng tài liệu chuyên nghiệp',
    icon: 'document-text',
    color: '#EF4444',
    fileType: 'pdf',
    features: [
      'Tổng quan tài chính với số liệu nổi bật',
      'Biểu đồ phân tích xu hướng',
      'Bảng chi tiết giao dịch',
      'Thống kê theo danh mục',
      'Phù hợp in ấn và gửi email',
    ],
  },
  {
    id: '2',
    title: 'Xuất Excel',
    description: 'Dữ liệu chi tiết dạng bảng tính để phân tích',
    icon: 'stats-chart',
    color: '#10B981',
    fileType: 'excel',
    features: [
      'Sheet Summary: Tổng quan các chỉ số',
      'Sheet Transactions: Chi tiết từng giao dịch',
      'Sheet Category: Thống kê theo danh mục',
      'Định dạng VNĐ chuẩn, tự động tính SUM',
      'Dễ dàng chỉnh sửa và phân tích',
    ],
  },
];

type DateRangeType = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export default function ExportScreen() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<DateRangeType>('month');
  const [isExporting, setIsExporting] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());

  const getDateRange = (): { startDate: string; endDate: string } => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (selectedRange) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        start = customStartDate;
        end = customEndDate;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const getRangeName = (): string => {
    const { startDate, endDate } = getDateRange();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    switch (selectedRange) {
      case 'week':
        return '7 ngày qua';
      case 'month':
        return `Tháng ${end.getMonth() + 1}/${end.getFullYear()}`;
      case 'quarter':
        const quarter = Math.floor(end.getMonth() / 3) + 1;
        return `Quý ${quarter}/${end.getFullYear()}`;
      case 'year':
        return `Năm ${end.getFullYear()}`;
      case 'custom':
        return `${formatDate(start)} - ${formatDate(end)}`;
      default:
        return '';
    }
  };

  const handleExport = async (fileType: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      const { startDate, endDate } = getDateRange();
      
      console.log(`Exporting ${fileType.toUpperCase()}:`, { startDate, endDate });

      if (fileType === 'pdf') {
        await reportService.exportPDF({ format: fileType, startDate, endDate });
        Alert.alert(
          'Thành công',
          `Đã xuất báo cáo PDF cho kỳ: ${getRangeName()}`,
          [{ text: 'OK' }]
        );
      } else {
        await reportService.exportExcel({ format: fileType, startDate, endDate });
        Alert.alert(
          'Thành công',
          `Đã xuất báo cáo Excel cho kỳ: ${getRangeName()}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể xuất báo cáo. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xuất báo cáo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="document-text" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.infoTitle}>Báo cáo tài chính chuyên nghiệp</Text>
          <Text style={styles.infoText}>
            Xuất báo cáo chi tiết về thu chi, ngân sách và giao dịch với định dạng chuẩn
          </Text>
        </View>

        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn kỳ báo cáo</Text>
          <View style={styles.dateRangeContainer}>
            {[
              { key: 'week', label: '7 ngày', icon: 'calendar-outline' },
              { key: 'month', label: 'Tháng này', icon: 'calendar' },
              { key: 'quarter', label: 'Quý này', icon: 'calendar-number' },
              { key: 'year', label: 'Năm này', icon: 'calendar-sharp' },
            ].map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.dateRangeButton,
                  selectedRange === range.key && styles.dateRangeButtonActive,
                ]}
                onPress={() => setSelectedRange(range.key as DateRangeType)}
              >
                <Ionicons
                  name={range.icon as any}
                  size={20}
                  color={selectedRange === range.key ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.dateRangeButtonText,
                    selectedRange === range.key && styles.dateRangeButtonTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Period Display */}
          <Card style={styles.selectedPeriodCard}>
            <View style={styles.selectedPeriodRow}>
              <Ionicons name="time" size={20} color={Colors.textMuted} />
              <Text style={styles.selectedPeriodLabel}>Kỳ báo cáo:</Text>
              <Text style={styles.selectedPeriodValue}>{getRangeName()}</Text>
            </View>
          </Card>
        </View>

        {/* Export Format Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn định dạng xuất</Text>
          <View style={styles.optionsContainer}>
            {exportOptions.map((option) => (
              <Card key={option.id} style={styles.optionCard}>
                <TouchableOpacity
                  onPress={() => handleExport(option.fileType)}
                  disabled={isExporting}
                  style={styles.optionCardContent}
                >
                  <View style={styles.optionHeader}>
                    <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                      <Ionicons name={option.icon} size={32} color={option.color} />
                    </View>
                    <View style={styles.optionTitleContainer}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Colors.textMuted} />
                  </View>

                  <View style={styles.featuresList}>
                    <Text style={styles.featuresTitle}>Bao gồm:</Text>
                    {option.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="information-circle" size={24} color={Colors.info} />
            <Text style={styles.infoCardTitle}>Lưu ý</Text>
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardText}>
              • Báo cáo PDF phù hợp để in ấn và gửi qua email{'\n'}
              • Báo cáo Excel cho phép chỉnh sửa và phân tích chi tiết{'\n'}
              • File sẽ được tải xuống vào thư mục Downloads{'\n'}
              • Thời gian xuất phụ thuộc vào số lượng giao dịch
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Loading Overlay */}
      {isExporting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang xuất báo cáo...</Text>
            <Text style={styles.loadingSubtext}>Vui lòng đợi</Text>
          </View>
        </View>
      )}
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
  backButton: {
    padding: Layout.spacing.xs,
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl * 2,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    marginBottom: Layout.spacing.lg,
  },
  infoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  infoTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
  infoText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    lineHeight: 22,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Layout.spacing.xs,
  },
  dateRangeButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  dateRangeButtonText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dateRangeButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedPeriodCard: {
    padding: Layout.spacing.md,
    backgroundColor: Colors.backgroundLight,
  },
  selectedPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  selectedPeriodLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
  },
  selectedPeriodValue: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  optionsContainer: {
    gap: Layout.spacing.md,
  },
  optionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  optionCardContent: {
    padding: Layout.spacing.lg,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  featuresList: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.md,
  },
  featuresTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.xs,
  },
  featureText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  infoCard: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  infoCardTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  infoCardContent: {
    marginTop: Layout.spacing.xs,
  },
  infoCardText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: Colors.backgroundLight,
    padding: Layout.spacing.xxl,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  loadingSubtext: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
  },
});
