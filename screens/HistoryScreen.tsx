import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { attendanceApi, AttendanceResponse } from "@/services/api";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HistoryScreen() {
  const { theme, isDark } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<AttendanceResponse[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendedDates, setAttendedDates] = useState<Set<string>>(new Set());

  const colors = isDark ? Colors.dark : Colors.light;

  const loadData = async (date: Date) => {
    try {
      // Calculate start and end of the selected month
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const historyRes = await attendanceApi.getHistory(start, end);
      setHistory(historyRes);

      const dates = new Set(
        historyRes
          .filter((r) => r.checkInTime)
          .map((r) => r.date) // Store full date string "YYYY-MM-DD"
      );
      setAttendedDates(dates);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(currentDate);
    }, [currentDate])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentDate);
    setIsRefreshing(false);
  };

  const getMonthYear = () => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const changeMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const formatHistoryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  const today = new Date().getDate();
  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

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
      <View style={[styles.calendarContainer, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.arrowButton}>
            <Feather name="chevron-left" size={20} color={colors.primary} />
          </Pressable>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {getMonthYear()}
          </ThemedText>
          <Pressable onPress={() => changeMonth(1)} style={styles.arrowButton}>
            <Feather name="chevron-right" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                {day}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {getDaysInMonth().map((day, index) => {
            const isToday = isCurrentMonth && day === today;

            // Format day as YYYY-MM-DD for matching
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
            const dayStr = day ? day.toString().padStart(2, "0") : "00";
            const dateStr = `${year}-${month}-${dayStr}`;

            const isAttended = day ? attendedDates.has(dateStr) : false;

            return (
              <View key={index} style={styles.dayCell}>
                {day !== null ? (
                  <View
                    style={[
                      styles.dayInner,
                      isToday && { backgroundColor: colors.primary },
                    ]}
                  >
                    <ThemedText
                      type="body"
                      style={[
                        styles.dayText,
                        isToday && { color: "#FFFFFF" },
                        !isToday && isAttended && { color: colors.primary },
                      ]}
                    >
                      {day}
                    </ThemedText>
                    {isAttended && !isToday ? (
                      <View style={[styles.attendedDot, { backgroundColor: colors.primary }]} />
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Your Attendance
      </ThemedText>

      {history.map((record) => {
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
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const styles = StyleSheet.create({
  calendarContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  arrowButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
  },
  attendedDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
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
