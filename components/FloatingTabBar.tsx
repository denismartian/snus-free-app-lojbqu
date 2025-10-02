
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, darkColors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 32,
  borderRadius = 25,
  bottomMargin = 34,
}: FloatingTabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = isDark ? darkColors : colors;
  
  const activeIndex = useSharedValue(0);

  // Find the active tab index
  React.useEffect(() => {
    const currentIndex = tabs.findIndex(tab => {
      if (tab.name === '(home)') {
        return pathname === '/' || pathname.startsWith('/(tabs)/(home)');
      }
      return pathname.includes(tab.name);
    });
    
    if (currentIndex !== -1) {
      activeIndex.value = withSpring(currentIndex, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [pathname, tabs]);

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / tabs.length;
    const translateX = interpolate(
      activeIndex.value,
      [0, tabs.length - 1],
      [0, (tabs.length - 1) * tabWidth]
    );

    return {
      transform: [{ translateX }],
      width: tabWidth,
    };
  });

  return (
    <SafeAreaView style={[styles.safeArea, { bottom: bottomMargin }]} edges={['bottom']}>
      <View style={[styles.container, { width: containerWidth }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 100 : 0}
          style={[
            styles.tabBar,
            {
              borderRadius,
              backgroundColor: Platform.OS === 'ios' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : currentColors.card,
            },
          ]}
        >
          {/* Animated indicator */}
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: currentColors.primary,
                borderRadius: borderRadius - 4,
              },
              animatedIndicatorStyle,
            ]}
          />

          {/* Tab buttons */}
          {tabs.map((tab, index) => {
            const isActive = pathname === '/' ? tab.name === '(home)' : pathname.includes(tab.name);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabButton}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={tab.icon}
                  size={24}
                  color={isActive ? currentColors.card : currentColors.text}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? currentColors.card : currentColors.text,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  container: {
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  indicator: {
    position: 'absolute',
    height: '80%',
    top: '10%',
    left: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});
