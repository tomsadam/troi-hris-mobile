import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, RefreshControl, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceApi, AttendanceResponse, AttendanceStats } from "@/services/api";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todayStatus, setTodayStatus] = useState<AttendanceResponse>();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentHistory, setRecentHistory] = useState<AttendanceResponse[]>([]);

  const colors = isDark ? Colors.dark : Colors.light;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  };

  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  };

  const loadData = async () => {
    try {
      const [statusRes, statsRes, historyRes] = await Promise.all([
        attendanceApi.getTodayStatus(),
        attendanceApi.getStats(),
        attendanceApi.getHistory(),
      ]);
      setTodayStatus(statusRes);
      setStats(statsRes);
      setRecentHistory(historyRes.slice(0, 3));
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatHistoryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <ThemedText type="body" style={{ color: colors.textSecondary }}>
            {getGreeting()}
          </ThemedText>
          <ThemedText type="h3" style={styles.userName}>
            {user?.name || "User"}
          </ThemedText>
        </View>
        <Pressable
          style={[styles.notificationButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => Alert.alert("Notifications", "No new notifications")}
        >
          <Feather name="bell" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.dateLocationRow}>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          {formatDate()}
        </ThemedText>
        <View style={[styles.locationBadge, { backgroundColor: colors.primary }]}>
          <Feather name="map-pin" size={12} color="#FFFFFF" />
          <ThemedText type="small" style={styles.locationText}>
            West Jakarta, Indonesia
          </ThemedText>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="log-in" size={16} color={colors.primary} />
            </View>
            <View>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                Check In
              </ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 12 }}>
                {todayStatus?.checkInTime ? "On Time" : "Not Yet"}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="h2" style={[styles.statusTime, { color: colors.primary }]}>
            {formatTime(todayStatus?.checkInTime) || "--:--"}
          </ThemedText>
        </View>

        <View style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="log-out" size={16} color={colors.primary} />
            </View>
            <View>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                Check Out
              </ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 12 }}>
                {todayStatus?.checkOutTime ? "Completed" : "Not Yet"}
              </ThemedText>
            </View>
          </View>
          <ThemedText
            type="h2"
            style={[styles.statusTime, { color: todayStatus?.checkOutTime ? colors.primary : colors.textSecondary }]}
          >
            {formatTime(todayStatus?.checkOutTime) || "--:--"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.statsIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="arrow-up-circle" size={18} color={colors.primary} />
          </View>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            Absence
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
            {stats?.monthYear}
          </ThemedText>
          <View style={styles.statsValueRow}>
            <ThemedText type="h2">{stats?.daysAbsent || 0}</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 4 }}>
              Day
            </ThemedText>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.statsIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="refresh-cw" size={18} color={colors.primary} />
          </View>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            Total Attended
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
            {stats?.monthYear}
          </ThemedText>
          <View style={styles.statsValueRow}>
            <ThemedText type="h2">{stats?.daysPresent || 0}</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 4 }}>
              Day
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <ThemedText type="h4">Attendance History</ThemedText>
        <Pressable onPress={() => navigation.navigate("History")}>
          <ThemedText type="small" style={{ color: colors.primary }}>
            See More
          </ThemedText>
        </Pressable>
      </View>

      {recentHistory.map((record) => {
        const { day, weekday } = formatHistoryDate(record.date);
        return (
          <View
            key={record.id}
            style={[styles.historyCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={[styles.historyDateBadge, { backgroundColor: colors.primary }]}>
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
                {day}
              </ThemedText>
              <ThemedText type="small" style={{ color: "#FFFFFF", fontSize: 11 }}>
                {weekday}
              </ThemedText>
            </View>
            <View style={styles.historyDetails}>
              <View style={styles.historyTimesRow}>
                <View style={styles.historyTimeItem}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {formatTime(record.checkInTime)}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Check In
                  </ThemedText>
                </View>
                <View style={styles.historyTimeItem}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {formatTime(record.checkOutTime)}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Check out
                  </ThemedText>
                </View>
                <View style={styles.historyTimeItem}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {record.totalHours}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Total Hours
                  </ThemedText>
                </View>
              </View>
              <View style={styles.historyLocation}>
                <Feather name="map-pin" size={12} color={colors.primary} />
                <ThemedText
                  type="small"
                  style={{ color: colors.textSecondary, marginLeft: 4, fontSize: 11 }}
                >
                  {record.location}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      <View style={{ height: Spacing["3xl"] }} />
    </ScreenScrollView>
  );
}

const formatTime = (isoString?: string | null): string => {
  if (!isoString) return "-";

  const utc = isoString.endsWith("Z") ? isoString : `${isoString}Z`;

  return new Date(utc).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
};





const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  greetingSection: {
    flex: 1,
  },
  userName: {
    marginTop: Spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dateLocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTime: {
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statsValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: Spacing.sm,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  historyCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  historyDateBadge: {
    width: 60,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  historyDetails: {
    flex: 1,
    padding: Spacing.md,
  },
  historyTimesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  historyTimeItem: {
    alignItems: "center",
    flex: 1,
  },
  historyLocation: {
    flexDirection: "row",
    alignItems: "center",
  },
});
