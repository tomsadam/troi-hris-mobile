import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation, route }: Props) {
    const { theme, isDark } = useTheme();
    const colors = isDark ? Colors.dark : Colors.light;
    const { employee } = route.params;

    const renderInfoItem = (label: string, value: string | undefined, icon: any) => (
        <View style={styles.infoItem}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Feather name={icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
                <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: 2 }}>
                    {label}
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "500" }}>
                    {value || "-"}
                </ThemedText>
            </View>
        </View>
    );

    const formatBirthDate = (place?: string, date?: string) => {
        if (!place && !date) return "-";
        if (!place) return date;
        if (!date) return place;
        return `${place}, ${date}`;
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderBottomColor: colors.border, marginTop: insets.top }]}>
                <Feather
                    name="arrow-left"
                    size={24}
                    color={colors.text}
                    onPress={() => navigation.goBack()}
                    style={{ padding: Spacing.sm }}
                />
                <ThemedText type="h3" style={styles.headerTitle}>Edit Profile</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + Spacing.xl }}>
                <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
                    {renderInfoItem("Full Name", employee.fullName, "user")}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {renderInfoItem("TROI ID", employee.employeeNumber, "hash")}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {renderInfoItem("E-mail", employee.email, "mail")}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {renderInfoItem("Mobile Phone", employee.phoneNumber, "smartphone")}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {renderInfoItem("Birth Date", formatBirthDate(employee.placeOfBirth, employee.dateOfBirth), "calendar")}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {renderInfoItem("Gender", employee.gender, "users")}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {renderInfoItem("Religion", employee.religion, "award")}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
    },
    container: {
        padding: Spacing.md,
    },
    card: {
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: Spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    divider: {
        height: 1,
        marginLeft: 56, // Align with text start
    },
});
