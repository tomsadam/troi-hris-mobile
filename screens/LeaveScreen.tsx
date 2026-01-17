import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Platform, Modal, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type TabType = "request" | "history";

export default function LeaveScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("request");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [reason, setReason] = useState("");

  // Date picker state
  const [showPicker, setShowPicker] = useState(false);
  const [currentDateType, setCurrentDateType] = useState<"start" | "end">("start");

  // Leave Type Modal State
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const userInfo = {
    name: "Panji Laksono",
    employeeId: "2023988231",
    jobPosition: "Manager",
    status: "Full Time",
    availableLeave: 12,
    usedLeave: 8,
    gender: "Male" as "Male" | "Female", // Added gender
  };

  const getLeaveTypes = () => {
    const types = [
      "Annual Leave",
      "Sick Leave",
      "Compensation Leave",
      "Unpaid Leave",
      "Religion Leave",
    ];

    if (userInfo.gender === "Female") {
      types.push("Maternity Leave"); // Standard term for Wanita (Maternity)
    } else {
      types.push("Paternity Leave"); // Standard term for Pria (Paternity)
    }

    return types;
  };

  const leaveTypes = getLeaveTypes();

  const handleSubmit = () => {
    console.log("Leave request submitted:", {
      startDate,
      endDate,
      leaveType,
      reason,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || (currentDateType === "start" ? startDate : endDate);
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (currentDateType === "start") {
      setStartDate(currentDate);
    } else {
      setEndDate(currentDate);
    }
  };

  const showDatepicker = (type: "start" | "end") => {
    setCurrentDateType(type);
    setShowPicker(true);
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
            <Pressable
              style={[styles.dateInput, { backgroundColor: theme.backgroundDefault, borderColor: colors.border }]}
              onPress={() => showDatepicker("start")}
            >
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                {formatDate(startDate)}
              </ThemedText>
            </Pressable>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              to
            </ThemedText>
            <Pressable
              style={[styles.dateInput, { backgroundColor: theme.backgroundDefault, borderColor: colors.border }]}
              onPress={() => showDatepicker("end")}
            >
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                {formatDate(endDate)}
              </ThemedText>
            </Pressable>
          </View>

          {showPicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={currentDateType === "start" ? startDate : endDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <ThemedText type="small" style={styles.formLabel}>
            Types of leave
          </ThemedText>
          <Pressable
            style={[styles.selectInput, { backgroundColor: theme.backgroundDefault, borderColor: colors.border }]}
            onPress={() => setShowLeaveTypeModal(true)}
          >
            <ThemedText type="body">{leaveType}</ThemedText>
            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
          </Pressable>

          <Modal
            visible={showLeaveTypeModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowLeaveTypeModal(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowLeaveTypeModal(false)}
            >
              <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="h2" style={{ marginBottom: Spacing.md, textAlign: "center" }}>
                  Select Leave Type
                </ThemedText>
                <FlatList
                  data={leaveTypes}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.modalItem}
                      onPress={() => {
                        setLeaveType(item);
                        setShowLeaveTypeModal(false);
                      }}
                    >
                      <ThemedText type="body" style={{ color: theme.text }}>
                        {item}
                      </ThemedText>
                      {leaveType === item && (
                        <Feather name="check" size={20} color={colors.primary} />
                      )}
                    </Pressable>
                  )}
                />
              </View>
            </Pressable>
          </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    maxHeight: "60%",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc50", // Light border
  },
});
