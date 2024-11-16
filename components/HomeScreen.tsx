// components/screens/HomeScreen.tsx
import React from 'react';

import { Image } from "expo-image";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
interface HomeScreenProps {
  onStartSession: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

const PlaceholderImage = require("../assets/images/home2.jpg");
const { width, height } = Dimensions.get("window");


const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartSession,
  onOpenSettings,
  onOpenGuide
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container2}>
        <View style={styles.imageContainer}>
          <Image source={PlaceholderImage} style={styles.image} />
        </View>
      </View>

      <Text style={[styles.title, styles.textBackground]}>Digital Zen Master</Text>
      {/* <Text style={[styles.subtitle, styles.textBackground]}>デジタル座禅アシスタント</Text> */}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onStartSession}
      >
        <Feather name="play" size={24} color="white" />
        <Text style={styles.primaryButtonText}>セッション開始</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onOpenSettings}
        >
          <Feather name="settings" size={24} color="#475569" />
          <Text style={styles.secondaryButtonText}>設定</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onOpenGuide}
        >
          <Feather name="info" size={24} color="#475569" />
          <Text style={styles.secondaryButtonText}>ガイド</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container2: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: width, // スクリーンの幅に合わせる
    height: height, // スクリーンの高さに合わせる
    resizeMode: "cover", // 画像を全体にカバーさせる
    borderRadius: 18,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#f1f5f9",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: "#cbd5e1",
    borderRadius: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: "NotoSansJP-Bold",
    color: "white",
    // marginBottom: 5,
    marginBottom: 500,
  },
  // subtitle: {
  //   fontSize: 16,
  //   fontFamily: "NotoSansJP-Regular",
  //   color: "#64748b",
  //   marginBottom: 500,
  // },
  textBackground: {
    backgroundColor: "black",
    paddingHorizontal: 1, // 横方向の余白
    paddingVertical: 1, // 縦方向の余白
    borderRadius: 5, // 角を丸くする（オプション）
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "NotoSansJP-Medium",
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    bottom: 8
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 16,
    fontFamily: "NotoSansJP-Medium",
    marginLeft: 8,
  },
});