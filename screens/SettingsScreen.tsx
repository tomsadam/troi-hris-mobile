import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi, ProfileDetailResponseDTO } from "@/services/api";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<ProfileDetailResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const settingsItems = [
    { icon: "user", label: "Edit Profile", onPress: () => Alert.alert("Coming Soon", "Edit profile feature is coming soon.") },
    { icon: "bell", label: "Notifications", onPress: () => Alert.alert("Coming Soon", "Notification settings coming soon.") },
    { icon: "lock", label: "Privacy & Security", onPress: () => Alert.alert("Coming Soon", "Privacy settings coming soon.") },
    { icon: "help-circle", label: "Help & Support", onPress: () => Alert.alert("Coming Soon", "Help & Support coming soon.") },
    { icon: "info", label: "About", onPress: () => Alert.alert("Attendance App", "Version 1.0.0\nBuilt with Expo") },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenScrollView>
      <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Feather name="user" size={40} color={colors.primary} />
        </View>
        <ThemedText type="h3" style={styles.profileName}>
          {profile?.employee.fullName || user?.name || "User"}
        </ThemedText>
        <ThemedText type="body" style={{ color: colors.textSecondary }}>
          {profile?.employee.employeeNumber || "Employee"}
        </ThemedText>
      </View>

      <View style={styles.infoSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Profile Information
        </ThemedText>

        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Employee ID
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "500" }}>
              {profile?.employee.employeeNumber || "-"}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Department
            </ThemedText>
            {/* <ThemedText type="body" style={{ fontWeight: "500" }}>
              {profile?.department || "-"}
            </ThemedText> */}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Status
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "500" }}>
              {profile?.employee.active || "-"}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Location
            </ThemedText>
            {/* <ThemedText type="body" style={{ fontWeight: "500" }}>
              {profile?.location || "-"}
            </ThemedText> */}
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Settings
        </ThemedText>

        <View style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
          {settingsItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.settingsRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.settingsLeft}>
                  <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                    <Feather name={item.icon as any} size={18} color={colors.primary} />
                  </View>
                  <ThemedText type="body">{item.label}</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </Pressable>
              {index < settingsItems.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              ) : null}
            </React.Fragment>
          ))}
        </View>
      </View>

      <Button
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
      >
        Logout
      </Button>

      <View style={{ height: Spacing["3xl"] }} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  profileName: {
    marginBottom: Spacing.xs,
  },
  infoSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  settingsSection: {
    marginBottom: Spacing.xl,
  },
  settingsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    marginTop: Spacing.md,
  },
});
