import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, CustomInput } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { useAppDispatch } from '@/store/hooks';
import { createCategory } from '@/store/slices/category.slice';
import { CategoryType } from '@/services/category.service';

const availableIcons = [
  'restaurant', 'car', 'cart', 'game-controller', 'medical', 'school',
  'flash', 'home', 'airplane', 'gift', 'barbell', 'book',
  'cafe', 'shirt', 'phone-portrait', 'paw', 'build', 'heart',
];

const availableColors = [
  Colors.actionRed, 
  Colors.actionGreen, 
  Colors.actionBlue, 
  Colors.actionPurple,
  Colors.actionYellow, 
  '#EC4899',  // Pink
  '#06B6D4',  // Cyan
  '#84CC16',  // Lime
  '#F97316',  // Orange
  '#6366F1',  // Indigo
];

export default function AddCategoryScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('restaurant');
  const [selectedColor, setSelectedColor] = useState(Colors.actionRed);
  const [categoryType, setCategoryType] = useState<CategoryType>(CategoryType.EXPENSE);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(createCategory({
        name: categoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: categoryType,
      })).unwrap();
      
      Alert.alert('Thành công', 'Đã tạo danh mục mới', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm danh mục</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Xem trước</Text>
          <View style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
              <Ionicons name={selectedIcon as any} size={32} color={Colors.textLight} />
            </View>
            <Text style={styles.previewText}>
              {categoryName || 'Tên danh mục'}
            </Text>
          </View>
        </View>

        {/* Category Name */}
        <View style={styles.section}>
          <CustomInput
            label="Tên danh mục"
            placeholder="Nhập tên danh mục"
            value={categoryName}
            onChangeText={setCategoryName}
            icon="create-outline"
          />
        </View>

        {/* Category Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại danh mục</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                categoryType === CategoryType.EXPENSE && styles.typeButtonActive,
              ]}
              onPress={() => setCategoryType(CategoryType.EXPENSE)}
            >
              <Text style={[
                styles.typeButtonText,
                categoryType === CategoryType.EXPENSE && styles.typeButtonTextActive,
              ]}>
                Chi tiêu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                categoryType === CategoryType.INCOME && styles.typeButtonActive,
              ]}
              onPress={() => setCategoryType(CategoryType.INCOME)}
            >
              <Text style={[
                styles.typeButtonText,
                categoryType === CategoryType.INCOME && styles.typeButtonTextActive,
              ]}>
                Thu nhập
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn biểu tượng</Text>
          <FlatList
            data={availableIcons}
            keyExtractor={(item) => item}
            numColumns={6}
            scrollEnabled={false}
            columnWrapperStyle={styles.iconRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.iconItem,
                  selectedIcon === item && styles.iconItemActive,
                ]}
                onPress={() => setSelectedIcon(item)}
              >
                <Ionicons
                  name={item as any}
                  size={24}
                  color={selectedIcon === item ? Colors.primary : Colors.text}
                />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn màu sắc</Text>
          <View style={styles.colorGrid}>
            {availableColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorItemActive,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={20} color={Colors.textLight} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <CustomButton
            title={isLoading ? "Đang lưu..." : "Lưu danh mục"}
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!categoryName.trim() || isLoading}
          />
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
  scrollView: {
    flex: 1,
  },
  previewSection: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  preview: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  previewText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.backgroundLight,
    marginTop: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  iconRow: {
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  iconItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemActive: {
    borderColor: Colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: Colors.primary,
  },
  footer: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.backgroundLight,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
});
