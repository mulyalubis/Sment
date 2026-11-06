import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import BottomBar, { TabKey } from "../components/BottomBar";
import HeroCard from "../components/HeroCard";
import StatusSummaryCard from "../components/RecentReportsCard";
import { useTheme } from "../hooks/useTheme";
import { Report } from "../types/report";


type Props = {
    userName?: string;
    reports?: Report[];
    onCreateReport?: () => void;
    onOpenHistory?: () => void;
    onOpenProfile?: () => void;
};

export default function HomeScreen({
    userName = "Warga",
    reports = [],
    onCreateReport = () => { },
    onOpenHistory = () => { },
    onOpenProfile = () => { },
}: Props) {
    const c = useTheme();
    const [tab, setTab] = useState<TabKey>("home");

    const handleTab = (key: TabKey) => {
        setTab(key);
        if (key === "history") onOpenHistory();
        if (key === "profile") onOpenProfile();
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <AppHeader userName={userName} />
                <HeroCard image={require("../../assets/images/Green-city-park.webp")} />
                <StatusSummaryCard reports={reports} onSeeAll={onOpenHistory} />
            </ScrollView>

            <BottomBar active={tab} onTab={handleTab} onCreate={onCreateReport} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 140, gap: 20 },
});