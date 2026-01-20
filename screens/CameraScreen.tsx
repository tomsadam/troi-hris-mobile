import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { attendanceApi } from "@/services/api";
import { Spacing, Colors } from "@/constants/theme";

type CameraScreenRouteProp = RouteProp<{ Camera: { type: "clockIn" | "clockOut" } }, "Camera">;

const formatTime = (isoString?: string | null): string => {
  if (!isoString) return "-";

  const utc = isoString.endsWith("Z") ? isoString : `${isoString}Z`;

  return new Date(utc).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute<CameraScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationState, setVerificationState] = useState<"scanning" | "verifying" | "success" | "failed">("scanning");

  const clockType = route.params?.type || "clockIn";

  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        const status = await attendanceApi.getTodayStatus();
        if (status?.checkInTime && status?.checkOutTime) {
          Alert.alert(
            "Attendance Complete",
            "Anda sudah melakukan Clock In dan Clock Out hari ini.",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Failed to check attendance status:", error);
      }
    };

    checkAttendanceStatus();
  }, []);



  const handleCapture = async () => {
    if (isProcessing) return;

    // Trigger Haptic Feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsProcessing(true);
    setVerificationState("verifying");

    try {
      // 1. Dapatkan Lokasi (Latitude dan Longitude)
      if (!locationPermission?.granted) {
        const { status } = await requestLocationPermission();
        if (status !== 'granted') {
          Alert.alert("Lokasi Diperlukan", "Akses lokasi diperlukan untuk mencatat absensi.");
          setVerificationState("scanning");
          setIsProcessing(false);
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // 2. Ambil Foto (Hanya URI, Tanpa Base64)
      if (!cameraRef.current) {
        throw new Error("Camera not initialized.");
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // Kompresi gambar
        skipProcessing: true,
        // base64: true <--- DIHAPUS: Tidak perlu base64 string
      });

      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo.");
      }

      // 3. Susun FormData (Multipart)
      const formData = new FormData();

      // Field string (sesuai field di Java Class 'AttendanceRequest')
      // Gunakan toFixed(6) untuk memastikan format angka baku (mis: "-6.200000")
      const latString = latitude.toFixed(6);
      const longString = longitude.toFixed(6);

      formData.append("latitude", latString);
      formData.append("longitude", longString);

      // Field file
      const fileName = photo.uri.split('/').pop() || "attendance.jpg";
      const fileType = fileName.split('.').pop() === 'png' ? 'image/png' : 'image/jpeg';

      formData.append("file", {
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        name: fileName,
        type: fileType,
      } as any);

      console.log("=== SENDING MULTIPART DATA (DEBUG) ===");
      console.log("Latitude:", latString);
      console.log("Longitude:", longString);
      console.log("File URI:", photo.uri);
      console.log("File Name:", fileName);
      console.log("File Type:", fileType);

      // 4. Kirim ke API
      let response;
      if (clockType === "clockIn") {
        response = await attendanceApi.clockIn(formData);
      } else {
        response = await attendanceApi.clockOut(formData);
      }

      // 5. Tanggapan API
      if (response.status === "VERIFIED") {
        setVerificationState("success");

        const timeWIB = formatTime(response.checkInTime);

        Alert.alert(
          clockType === "clockIn" ? "Clocked In" : "Clocked Out",
          `Berhasil ${clockType === "clockIn" ? "masuk" : "keluar"} pada ${timeWIB}`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setVerificationState("failed");
        Alert.alert("Gagal", response.status || "Verifikasi gagal.");
      }

    } catch (error: any) {
      console.error("Attendance Capture Error:", error);
      setVerificationState("failed");
      const errorMessage = error.message || "Terjadi kesalahan saat mengirim data.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsProcessing(false);
      // Jika gagal, kembali ke status scanning agar bisa coba lagi.
      if (verificationState !== "success") {
        setVerificationState("scanning");
      }
    }
  };

  // Loading State saat cek izin
  if (!cameraPermission || !locationPermission) {
    return (
      <View style={[styles.container, { backgroundColor: "#000" }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Tampilkan UI Permintaan Izin (Jika belum granted)
  if (!cameraPermission.granted || !locationPermission.granted) {
    return (
      <View
        style={[
          styles.permissionContainer,
          {
            backgroundColor: Colors.light.backgroundRoot,
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Feather name="alert-triangle" size={64} color={Colors.light.primary} />
        <ThemedText type="h3" style={styles.permissionTitle}>
          Izin Kamera dan Lokasi Diperlukan
        </ThemedText>
        <ThemedText type="body" style={styles.permissionText}>
          Kami memerlukan akses kamera untuk verifikasi wajah dan lokasi untuk pencatatan absensi.
        </ThemedText>
        <Pressable
          onPress={async () => {
            await requestCameraPermission();
            await requestLocationPermission();
          }}
          style={[styles.permissionButton, { backgroundColor: Colors.light.primary, padding: 12, borderRadius: 8 }]}
        >
          <ThemedText type="body" style={{ color: "#FFF", textAlign: 'center' }}>Aktifkan Izin</ThemedText>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <ThemedText type="body" style={{ color: Colors.light.textSecondary }}>
            Batal
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  // UI Utama (Kamera)
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        <View style={[styles.overlay, { paddingTop: insets.top + Spacing.xl }]}>

          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Instruksi Status */}
          <View style={styles.instructionContainer}>
            <ThemedText type="h4" style={styles.instructionText}>
              {verificationState === "scanning"
                ? "Arahkan Wajah ke Bingkai dan Ambil Foto"
                : verificationState === "verifying"
                  ? "Memverifikasi Wajah..."
                  : verificationState === "success"
                    ? "Verifikasi Berhasil!"
                    : "Verifikasi Gagal"}
            </ThemedText>
          </View>

          {/* Bingkai Wajah */}
          <View style={styles.faceGuideContainer}>
            <View style={styles.faceGuide}>
              <View style={[styles.cornerTL, styles.corner]} />
              <View style={[styles.cornerTR, styles.corner]} />
              <View style={[styles.cornerBL, styles.corner]} />
              <View style={[styles.cornerBR, styles.corner]} />
            </View>
          </View>

          {/* Bottom Bar / Tombol Capture */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.xl }]}>
            <Pressable
              onPress={handleCapture}
              disabled={isProcessing}
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled,
              ]}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </Pressable>
            <ThemedText type="small" style={styles.captureHint}>
              {clockType === "clockIn" ? "Tap untuk Clock In" : "Tap untuk Clock Out"}
            </ThemedText>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: Spacing.xl,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionContainer: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
  instructionText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  faceGuideContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  faceGuide: {
    width: 250,
    height: 320,
    borderRadius: 125,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 60,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 60,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 60,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 60,
  },
  bottomBar: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
  },
  captureHint: {
    color: "#FFFFFF",
    marginTop: Spacing.md,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  permissionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    width: "100%",
  },
  cancelButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
});