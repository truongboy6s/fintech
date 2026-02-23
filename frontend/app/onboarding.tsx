import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Quản lý thu chi',
    description: 'Ghi chép mọi khoản thu nhập và chi tiêu một cách dễ dàng, nhanh chóng',
    icon: 'wallet',
    color: Colors.primary,
    gradient: [Colors.primaryGradientStart, Colors.primaryGradientEnd],
  },
  {
    id: '2',
    title: 'Ngân sách thông minh',
    description: 'Đặt ngân sách cho từng hạng mục và theo dõi chi tiêu hiệu quả',
    icon: 'pie-chart',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    id: '3',
    title: 'Báo cáo chi tiết',
    description: 'Phân tích xu hướng chi tiêu với biểu đồ và báo cáo trực quan',
    icon: 'bar-chart',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    id: '4',
    title: 'Bắt đầu ngay',
    description: 'Kiểm soát tài chính của bạn một cách chuyên nghiệp và hiệu quả',
    icon: 'rocket',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/welcome');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleSkip();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <LinearGradient
          colors={item.gradient}
          style={styles.slideGradient}
        >
          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <View style={[styles.iconInnerCircle, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <Ionicons name={item.icon} size={100} color={Colors.textLight} />
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Decorative elements */}
          <View style={styles.decorativeTopLeft}>
            <Ionicons name="ellipse" size={80} color="rgba(255, 255, 255, 0.1)" />
          </View>
          <View style={styles.decorativeBottomRight}>
            <Ionicons name="ellipse" size={120} color="rgba(255, 255, 255, 0.1)" />
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderPagination()}

        {/* Next/Start Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          {currentIndex === slides.length - 1 ? (
            <View style={styles.startButtonContent}>
              <Text style={styles.nextButtonText}>Bắt đầu</Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.textLight} />
            </View>
          ) : (
            <View style={styles.nextButtonContent}>
              <Text style={styles.nextButtonText}>Tiếp theo</Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.textLight} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: Layout.spacing.lg,
    zIndex: 10,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  skipText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textLight,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  iconContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconInnerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: Layout.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: Layout.spacing.md,
  },
  decorativeTopLeft: {
    position: 'absolute',
    top: 100,
    left: -20,
  },
  decorativeBottomRight: {
    position: 'absolute',
    bottom: 150,
    right: -30,
  },
  bottomSection: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: Layout.spacing.xxl + 20,
    backgroundColor: 'transparent',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    height: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textLight,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.textLight,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  nextButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
});
