import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type TabType = "request" | "history";

export default function LeaveScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("request");
  const [startDate, setStartDate] = useState("27/11/2023");
  const [endDate, setEndDate] = useState("30/11/2023");
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [reason, setReason] = useState("");

  const colors = isDark ? Colors.dark : Colors.light;

  const userInfo = {
    name: "Akhmad Maariz",
    employeeId: "2023988231",
    jobPosition: "UI/UX Designer",
    status: "Full Time",
    availableLeave: 12,
    usedLeave: 8,
  };

  const handleSubmit = () => {
    console.log("Leave request submitted:", {
      startDate,
      endDate,
      leaveType,
      reason,
    });
  };

  return (
    <ScreenScrollView>
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfoRow}>
          <View style={styles.userInfoItem}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Employee Name
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {userInfo.name}
            </ThemedText>
          </View>
          <View style={styles.userInfoItem}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Employee ID
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {userInfo.employeeId}
            </ThemedText>
          </View>
        </View>
        <View style={styles.userInfoRow}>
          <View style={styles.userInfoItem}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Job Position
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {userInfo.jobPosition}
            </ThemedText>
          </View>
          <View style={styles.userInfoItem}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Status
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {userInfo.status}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.leaveStatsRow}>
        <View style={[styles.leaveStatCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: colors.primary }}>
            {userInfo.availableLeave}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Day
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
            Available Leave
          </ThemedText>
        </View>
        <View style={[styles.leaveStatCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: colors.primary }}>
            {userInfo.usedLeave}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Day
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
            Used Leave
          </ThemedText>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab("request")}
          style={[
            styles.tab,
            activeTab === "request" && { borderBottomColor: colors.primary },
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              activeTab === "request" && { color: colors.primary, fontWeight: "600" },
            ]}
          >
            Leave Request
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("history")}
          style={[
            styles.tab,
            activeTab === "history" && { borderBottomColor: colors.primary },
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              activeTab === "history" && { color: colors.primary, fontWeight: "600" },
            ]}
          >
            Leave History
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === "request" ? (
        <View style={styles.formContainer}>
          <ThemedText type="small" style={styles.formLabel}>
            Duration
          </ThemedText>
          <View style={styles.dateRow}>
            <View style={[styles.dateInput, { backgroundColor: theme.backgroundDefault, borderColor: colors.border }]}>
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                {startDate}
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              to
            </ThemedText>
            <View style={[styles.dateInput, { backgroundColor: theme.backgroundDefault, borderColor: colors.border }]}>
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                {endDate}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="small" style={styles.formLabel}>
            Types of leave
          </ThemedText>
          <View style={[styles.selectInput, { backgroundColor: theme.backgroundDefault, borderColor: colors.border }]}>
            <ThemedText type="body">{leaveType}</ThemedText>
            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
          </View>

          <ThemedText type="small" style={styles.formLabel}>
            Reason (Optional)
          </ThemedText>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Write description here..."
            placeholderTextColor={colors.textSecondary}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Button
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            Submit Request
          </Button>
        </View>
      ) : (
        <View style={styles.historyContainer}>
          <View style={[styles.historyItem, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.historyHeader}>
              <View>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Annual Leave
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Nov 15 - Nov 17, 2023
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                <ThemedText type="small" style={{ color: colors.success, fontWeight: "500" }}>
                  Approved
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={[styles.historyItem, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.historyHeader}>
              <View>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Sick Leave
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Oct 5, 2023
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                <ThemedText type="small" style={{ color: colors.success, fontWeight: "500" }}>
                  Approved
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={[styles.historyItem, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.historyHeader}>
              <View>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Personal Leave
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Sep 20, 2023
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.warning + "20" }]}>
                <ThemedText type="small" style={{ color: colors.warning, fontWeight: "500" }}>
                  Pending
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: Spacing["3xl"] }} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  userInfoContainer: {
    marginBottom: Spacing.xl,
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  userInfoItem: {
    flex: 1,
  },
  leaveStatsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  leaveStatCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    color: Colors.light.textSecondary,
  },
  formContainer: {
    flex: 1,
  },
  formLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  historyContainer: {
    flex: 1,
  },
  historyItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
});
