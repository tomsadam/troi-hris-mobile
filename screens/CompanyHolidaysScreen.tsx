import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { HOLIDAYS_2026, Holiday } from "@/constants/holidays";
import { Feather } from "@expo/vector-icons";

export default function CompanyHolidaysScreen() {
    const { isDark, theme } = useTheme();
    const colors = isDark ? Colors.dark : Colors.light;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <ScreenScrollView
            style={{ backgroundColor: theme.backgroundDefault }}
            stickyHeaderIndices={[0]}
        >
            <View style={[styles.headerSection, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="h4" style={{ color: colors.primary }}>
                    2026
                </ThemedText>
            </View>

            <View style={styles.listContainer}>
                {HOLIDAYS_2026.map((holiday, index) => (
                    <View key={holiday.id}>
                        <View style={styles.holidayItem}>
                            <View style={styles.itemContent}>
                                <ThemedText type="h4" style={styles.holidayName}>
                                    {holiday.name}
                                </ThemedText>
                                <ThemedText
                                    type="small"
                                    style={{ color: colors.textSecondary, marginTop: 4 }}
                                >
                                    {formatDate(holiday.date)}
                                </ThemedText>
                            </View>
                        </View>
                        {index < HOLIDAYS_2026.length - 1 && (
                            <View
                                style={[
                                    styles.separator,
                                    { backgroundColor: isDark ? "#333" : "#EEEEEE" },
                                ]}
                            />
                        )}
                    </View>
                ))}
            </View>
            <View style={{ height: Spacing["3xl"] }} />
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingVertical: Spacing.sm, // Reduced from lg to sm
        paddingHorizontal: Spacing.lg, // Added horizontal padding here since it's outside listContainer
        paddingBottom: Spacing.sm,
    },
    listContainer: {
        // Horizontal padding handled by ScreenScrollView
    },
    holidayItem: {
        paddingVertical: Spacing.lg,
    },
    itemContent: {
        flex: 1,
    },
    holidayName: {
        fontSize: 16,
        fontWeight: "600",
    },
    separator: {
        height: 1,
        width: "100%",
    },
});
