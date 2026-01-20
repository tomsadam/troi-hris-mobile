export interface Holiday {
    id: string;
    name: string;
    date: string; // ISO format or just YYYY-MM-DD
    type: "National Holiday" | "Joint Holiday";
}

export const HOLIDAYS_2026: Holiday[] = [
    {
        id: "1",
        name: "New Year's Day",
        date: "2026-01-01",
        type: "National Holiday",
    },
    {
        id: "2",
        name: "(ID) Ascension of the Prophet Muhammad",
        date: "2026-01-16",
        type: "National Holiday",
    },
    {
        id: "3",
        name: "Chinese New Year Joint",
        date: "2026-02-16",
        type: "Joint Holiday",
    },
    {
        id: "4",
        name: "Chinese New Year's Day",
        date: "2026-02-17",
        type: "National Holiday",
    },
    {
        id: "5",
        name: "Joint Holiday for Bali's Day of Silence and Hindu New Year",
        date: "2026-03-18",
        type: "Joint Holiday",
    },
    {
        id: "6",
        name: "Bali's Day of Silence and Hindu New Year",
        date: "2026-03-19",
        type: "National Holiday",
    },
    {
        id: "7",
        name: "Idul Fitri Joint",
        date: "2026-03-20",
        type: "Joint Holiday",
    },
    {
        id: "8",
        name: "Idul Fitri",
        date: "2026-03-21",
        type: "National Holiday",
    },
    {
        id: "9",
        name: "Idul Fitri Joint (Second Observance)",
        date: "2026-03-23",
        type: "Joint Holiday",
    },
    {
        id: "10",
        name: "Good Friday",
        date: "2026-04-03",
        type: "National Holiday",
    },
    {
        id: "11",
        name: "Labor Day",
        date: "2026-05-01",
        type: "National Holiday",
    },
    {
        id: "12",
        name: "Ascension Day of Jesus Christ",
        date: "2026-05-14",
        type: "National Holiday",
    },
    {
        id: "13",
        name: "Waisak Day",
        date: "2026-05-31",
        type: "National Holiday",
    },
    {
        id: "14",
        name: "Pancasila Day",
        date: "2026-06-01",
        type: "National Holiday",
    },
    {
        id: "15",
        name: "Idul Adha",
        date: "2026-05-27", // Approximate, needs verification if strict but using placeholder for now based on typical lunar calendar
        type: "National Holiday",
    },
    {
        id: "16",
        name: "Islamic New Year",
        date: "2026-06-16", // Approximate
        type: "National Holiday",
    },
    {
        id: "17",
        name: "Independence Day",
        date: "2026-08-17",
        type: "National Holiday",
    },
    {
        id: "18",
        name: "Prophet Muhammad's Birthday",
        date: "2026-08-25", // Approximate
        type: "National Holiday",
    },
    {
        id: "19",
        name: "Christmas Day",
        date: "2026-12-25",
        type: "National Holiday",
    },
];

export const getUpcomingHolidays = (count: number = 3): Holiday[] => {
    const today = new Date();
    // Reset time to start of day for comparison
    today.setHours(0, 0, 0, 0);

    return HOLIDAYS_2026
        .filter((holiday) => new Date(holiday.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, count);
};
