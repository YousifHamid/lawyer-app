import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const timer = setTimeout(() => onFinish(), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>⚖️</Text>
        </View>
        <Text style={styles.appName}>محاميك</Text>
        <Text style={styles.tagline}>محاميك في أي مكان</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F6E56', justifyContent: 'center', alignItems: 'center' },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff22',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoIcon: { fontSize: 50 },
  appName: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 14, color: '#C9952C', marginTop: 8 },
});
