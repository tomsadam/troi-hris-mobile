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
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { attendanceApi } from "@/services/api";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type CameraScreenRouteProp = RouteProp<{ Camera: { type: "clockIn" | "clockOut" } }, "Camera">;

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute<CameraScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationState, setVerificationState] = useState<"scanning" | "verifying" | "success" | "failed">("scanning");
  const clockType = route.params?.type || "clockIn";

  useEffect(() => {
    if (verificationState === "success") {
      const timer = setTimeout(() => {
        navigation.goBack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [verificationState, navigation]);

  const handleCapture = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setVerificationState("verifying");

    try {
      let response;
      if (clockType === "clockIn") {
        response = await attendanceApi.clockIn();
      } else {
        response = await attendanceApi.clockOut();
      }

      if (response.success) {
        setVerificationState("success");
        Alert.alert(
          clockType === "clockIn" ? "Clocked In" : "Clocked Out",
          `Successfully ${clockType === "clockIn" ? "clocked in" : "clocked out"} at ${response.time}`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        setVerificationState("failed");
        Alert.alert("Failed", response.message || "Face verification failed. Please try again.");
      }
    } catch (error) {
      setVerificationState("failed");
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
      if (verificationState !== "success") {
        setVerificationState("scanning");
      }
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: "#000" }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!permission.granted) {
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
        <Feather name="camera-off" size={64} color={Colors.light.primary} />
        <ThemedText type="h3" style={styles.permissionTitle}>
          Camera Access Required
        </ThemedText>
        <ThemedText type="body" style={styles.permissionText}>
          We need camera access to verify your identity for attendance tracking.
        </ThemedText>
        <Button onPress={requestPermission} style={styles.permissionButton}>
          Enable Camera
        </Button>
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <ThemedText type="body" style={{ color: Colors.light.textSecondary }}>
            Cancel
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          <View style={[styles.overlay, { paddingTop: insets.top + Spacing.xl }]}>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.instructionContainer}>
              <ThemedText type="h4" style={styles.instructionText}>
                {verificationState === "scanning"
                  ? "Please Look at the Camera and Hold Still"
                  : verificationState === "verifying"
                  ? "Verifying Your Face..."
                  : verificationState === "success"
                  ? "Verification Successful!"
                  : "Verification Failed"}
              </ThemedText>
            </View>

            <View style={styles.faceGuideContainer}>
              <View style={styles.faceGuide}>
                <View style={[styles.cornerTL, styles.corner]} />
                <View style={[styles.cornerTR, styles.corner]} />
                <View style={[styles.cornerBL, styles.corner]} />
                <View style={[styles.cornerBR, styles.corner]} />
              </View>
            </View>

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
                {clockType === "clockIn" ? "Tap to Clock In" : "Tap to Clock Out"}
              </ThemedText>
            </View>
          </View>
        </CameraView>
      ) : (
        <View
          style={[
            styles.webFallback,
            {
              paddingTop: insets.top + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <Feather name="camera" size={64} color={Colors.light.primary} />
          <ThemedText type="h3" style={styles.webTitle}>
            Camera Not Available
          </ThemedText>
          <ThemedText type="body" style={styles.webText}>
            Run this app in Expo Go on your mobile device to use the camera for face verification.
          </ThemedText>
          <Button
            onPress={() => {
              setIsProcessing(true);
              setTimeout(async () => {
                const response = clockType === "clockIn"
                  ? await attendanceApi.clockIn()
                  : await attendanceApi.clockOut();
                setIsProcessing(false);
                Alert.alert(
                  clockType === "clockIn" ? "Clocked In" : "Clocked Out",
                  `Successfully ${clockType === "clockIn" ? "clocked in" : "clocked out"} at ${response.time}`,
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
              }, 1000);
            }}
            style={styles.webButton}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : clockType === "clockIn" ? "Clock In (Demo)" : "Clock Out (Demo)"}
          </Button>
          <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <ThemedText type="body" style={{ color: Colors.light.textSecondary }}>
              Cancel
            </ThemedText>
          </Pressable>
        </View>
      )}
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
    backgroundColor: Colors.light.primary,
  },
  cancelButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  webFallback: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  webTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    textAlign: "center",
    color: Colors.light.text,
  },
  webText: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xl,
  },
  webButton: {
    width: "100%",
    backgroundColor: Colors.light.primary,
  },
});
