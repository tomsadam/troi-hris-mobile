import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import CompanyHolidaysScreen from "@/screens/CompanyHolidaysScreen";


export type HomeStackParamList = {
  Home: undefined;
  History: undefined;
  CompanyHolidays: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Attendance" />,
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: "Attendance History" }}
      />
      <Stack.Screen
        name="CompanyHolidays"
        component={require("@/screens/CompanyHolidaysScreen").default}
        options={{ headerTitle: "Company Holidays" }}
      />
    </Stack.Navigator>
  );
}

