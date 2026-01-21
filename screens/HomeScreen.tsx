import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, RefreshControl, Alert, Modal, Image, ScrollView, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceApi, AttendanceResponse, AttendanceStats } from "@/services/api";
import * as ExpoLocation from "expo-location";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getUpcomingHolidays } from "@/constants/holidays";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todayStatus, setTodayStatus] = useState<AttendanceResponse>();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentHistory, setRecentHistory] = useState<AttendanceResponse[]>([]);
  const [locationName, setLocationName] = useState("Menemukan lokasi...");

  // Photo Modal State
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");

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

  const getLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName("Izin Lokasi Ditolak");
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      const address = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (address && address.length > 0) {
        const { city, region, country } = address[0];
        // Fallback jika salah satu data undefined
        const cityName = city || region || "";
        const countryName = country || "Indonesia";
        setLocationName(`${cityName}, ${countryName}`);
      } else {
        setLocationName("Lokasi tidak dikenali");
      }

    } catch (error) {
      console.error("Error getting location:", error);
      setLocationName("Gagal memuat lokasi");
    }
  };

  const loadData = async () => {
    try {
      // Panggil location secara paralel agar tidak blocking lama
      getLocation();

      const [statusRes, statsRes, historyRes] = await Promise.all([
        attendanceApi.getTodayStatus(),
        attendanceApi.getStats(),
        attendanceApi.getHistory(),
      ]);

      console.log("DEBUG: todayStatus response:", JSON.stringify(statusRes, null, 2)); // <--- LOG INI

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

  const handleViewPhoto = (type: "checkIn" | "checkOut") => {
    if (!todayStatus) return;

    // Ambil URL foto dari respon API
    const photoUrl = type === "checkIn" ? todayStatus.checkInPhotoUrl : todayStatus.checkOutPhotoUrl;

    if (photoUrl) {
      setSelectedPhoto(photoUrl);
      setPhotoTitle(type === "checkIn" ? "Foto Clock In" : "Foto Clock Out");
      setPhotoModalVisible(true);
    } else {
      Alert.alert("Info", `Belum ada foto ${type === "checkIn" ? "masuk" : "keluar"} yang tersimpan.`);
    }
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
            {locationName}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Pressable
          style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => handleViewPhoto("checkIn")}
        >
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
        </Pressable>

        <Pressable
          style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => handleViewPhoto("checkOut")}
        >
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
        </Pressable>
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

      <View style={styles.sectionHeader}>
        <Pressable
          onPress={() => navigation.navigate("CompanyHolidays")}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Feather name="gift" size={20} color={colors.primary} />
          <ThemedText type="h4" style={{ color: colors.primary }}>Holidays</ThemedText>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.holidaysList}>
        {getUpcomingHolidays(3).map((holiday, index) => {
          const date = new Date(holiday.date);
          const dateString = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });

          return (
            <View key={holiday.id}>
              <Pressable
                style={[styles.holidayCard, { backgroundColor: theme.backgroundDefault }]}
                onPress={() => navigation.navigate("CompanyHolidays")}
              >
                <View style={[styles.holidayIcon, { backgroundColor: theme.backgroundRoot }]}>
                  <Feather name="gift" size={20} color={colors.primary} />
                  {/* Using gift icon as placeholder for confetti/streamer icon shown in image if not available */}
                </View>
                <View style={styles.holidayContent}>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>{holiday.name}</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>{dateString}</ThemedText>
                </View>
              </Pressable>
              {index < 2 && <View style={[styles.separator, { backgroundColor: theme.backgroundRoot }]} />}
            </View>
          );
        })}
      </View>

      <View style={[styles.historyHeader, { marginTop: Spacing.xl }]}>
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

      {/* MODAL PHOTO VIEWER */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">{photoTitle}</ThemedText>
              <Pressable onPress={() => setPhotoModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.imageContainer}>
              {selectedPhoto ? (
                <Image
                  source={{ uri: selectedPhoto }}
                  style={styles.evidenceImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.noImagePlaceholder, { backgroundColor: theme.backgroundRoot }]}>
                  <Feather name="image" size={48} color={colors.textSecondary} />
                  <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
                    Tidak ada gambar
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidaysList: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  holidayCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  holidayIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  holidayContent: {
    flex: 1,
  },
  separator: {
    height: 1,
    width: "100%",
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
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4, // Rasio foto portrait umum
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  evidenceImage: {
    width: "100%",
    height: "100%",
  },
  noImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
