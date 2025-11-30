import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function AnalyticsScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ScreenScrollView>
      <View style={styles.placeholderContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Feather name="bar-chart-2" size={48} color={colors.primary} />
        </View>
        <ThemedText type="h3" style={styles.title}>
          Analytics Coming Soon
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: colors.textSecondary }]}>
          We're working on bringing you detailed attendance analytics and insights. Stay tuned!
        </ThemedText>
      </View>

      <View style={styles.previewSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Preview Features
        </ThemedText>

        <View style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="trending-up" size={20} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Attendance Trends
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              View your attendance patterns over time
            </ThemedText>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="clock" size={20} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Working Hours
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Track your daily and weekly working hours
            </ThemedText>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="calendar" size={20} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Leave Balance
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Monitor your leave usage and remaining days
            </ThemedText>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="pie-chart" size={20} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Performance Metrics
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              View punctuality and attendance scores
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={{ height: Spacing["3xl"] }} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  previewSection: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
});
