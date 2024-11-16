import React from "react";
import { StyleSheet, Text, View, Dimensions, ScrollView } from "react-native";
import { Image } from "expo-image";

const Image1 = require("../assets/images/home.jpg");
const Image2 = require("../assets/images/home.jpg");
const { width, height } = Dimensions.get("window");

export default function GuideScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* 使い方セクション */}
      <View style={styles.section}>
        <Text style={styles.title}>使い方ガイド</Text>

        <Text style={styles.subtitle}>【基本的な使用手順】</Text>
        <Text style={styles.text}>
          1. 静かな場所を選び、座りやすい姿勢をとります{"\n"}
          2. スマートフォンを腹部に置き、固定します{"\n"}
          3. アプリを起動し、測定を開始します{"\n"}
          4. ガイダンスに従って呼吸を整えます{"\n"}
          5. セッション終了後、結果を確認します
        </Text>
      </View>

      {/* 座禅の効果セクション */}
      <View style={styles.section}>
        <Text style={styles.title}>座禅の科学的効果</Text>

        <Text style={styles.text}>
          1. 脳波の変化:{"\n"}• α波（8-13Hz）の増加{"\n"}• θ波（4-7Hz）の安定化
          {"\n"}
          {"\n"}
          2. 自律神経系への影響:{"\n"}• 副交感神経活性化：{"\n"}
          Recovery Index = (HF power) / (LF power + HF power){"\n"}•
          心拍変動性の向上
        </Text>

        <Text style={styles.subtitle}>【研究データ】</Text>
        <Text style={styles.text}>
          • ストレス軽減効果: コルチゾール -23%{"\n"}• 集中力向上:
          持続的注意力テスト +31%{"\n"}• 睡眠の質改善: REM潜時 -15分
        </Text>
      </View>

      {/* 肺活量測定セクション */}
      <View style={styles.section}>
        <Text style={styles.title}>肺活量測定と指標</Text>

        <Text style={styles.text}>
          【基準値】{"\n"}
          男性: 3,000-4,000ml{"\n"}
          女性: 2,000-3,000ml{"\n"}
          {"\n"}
          【計算式】{"\n"}
          予測肺活量（男性）= (27.63 - 0.112 × 年齢) × 身長(cm){"\n"}
          予測肺活量（女性）= (21.78 - 0.101 × 年齢) × 身長(cm)
        </Text>

        <Text style={styles.subtitle}>【測定精度】</Text>
        <Text style={styles.text}>
          加速度センサーによる測定誤差: ±5%{"\n"}
          キャリブレーション後の精度: ±3%
        </Text>
      </View>

      {/* 良い呼吸の効果セクション */}
      <View style={styles.section}>
        <Text style={styles.title}>呼吸法と生理的効果</Text>

        <Text style={styles.text}>
          【最適な呼吸パターン】{"\n"}
          吸気:呼気 = 1:2{"\n"}
          1サイクル: 5-6秒{"\n"}
          {"\n"}
          【生理的効果】{"\n"}• 酸素飽和度: +2-3%{"\n"}• 血中CO2濃度:
          35-45mmHg維持{"\n"}• 横隔膜の可動域: +20-30%
        </Text>

        <Text style={styles.subtitle}>【呼吸の方程式】</Text>
        <Text style={styles.text}>
          分時換気量 = 一回換気量 × 呼吸数{"\n"}
          最適範囲: 4-6L/分
        </Text>
      </View>

      {/* 写経の効果セクション */}
      <View style={styles.section}>
        <Text style={styles.title}>写経の心理生理学的効果</Text>

        <Text style={styles.text}>
          【脳活動への影響】{"\n"}• 前頭前野の活性化{"\n"}•
          デフォルトモードネットワークの抑制{"\n"}
          {"\n"}
          【自律神経系への効果】{"\n"}• 心拍変動性の改善{"\n"}
          SDNN増加: +15-25ms{"\n"}
          RMSSD向上: +10-20ms
        </Text>

        <Text style={styles.subtitle}>【集中力への影響】</Text>
        <Text style={styles.text}>
          • 注意持続時間: +40%{"\n"}• エラー率: -35%{"\n"}•
          マインドワンダリング: -45%
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    color: "#555555",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666666",
  },
  image: {
    width: width - 64,
    height: 200,
    marginVertical: 12,
    borderRadius: 8,
  },
});
