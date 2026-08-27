import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { countUnlocked, getAchievements, type Achievement } from "@/lib/game/achievements";
import type { DailyStreak } from "@/lib/game/daily";
import { accuracy, type PlayerStats } from "@/lib/game/stats";

type StatsViewProps = {
  stats: PlayerStats;
  onBack: () => void;
  onAchievements: () => void;
};

type AchievementsViewProps = {
  stats: PlayerStats;
  dailyStreak: DailyStreak;
  onBack: () => void;
};

function WideButton({ label, onPress, quiet = false }: { label: string; onPress: () => void; quiet?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.button, quiet && styles.buttonQuiet, pressed && styles.buttonPressed]}><Text style={[styles.buttonText, quiet && styles.buttonTextQuiet]}>{label}</Text></Pressable>;
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <View style={[styles.metric, accent && styles.metricAccent]}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, accent && styles.metricValueAccent]}>{value}</Text></View>;
}

export function StatsView({ stats, onBack, onAchievements }: StatsViewProps) {
  const playerAccuracy = accuracy(stats);
  return <View style={styles.screen}>
    <Text style={styles.eyebrow}>VOTRE RYTHME</Text>
    <Text style={styles.title}>Précision</Text>
    <View style={styles.accuracyCircle}><Text style={styles.accuracyValue}>{playerAccuracy}%</Text><Text style={styles.accuracyLabel}>DE RÉUSSITE</Text></View>
    <View style={styles.metricGrid}><Metric label="TOUCHES" value={String(stats.totalTaps)} /><Metric label="RÉUSSITES" value={String(stats.totalHits)} accent /><Metric label="PARFAITS" value={String(stats.perfectHits)} /><Metric label="MEILLEURE SÉRIE" value={`× ${stats.maxCombo}`} accent /></View>
    <View style={styles.note}><Text style={styles.noteText}>La précision est calculée sur toutes vos touches. Ces données restent uniquement sur cet appareil.</Text></View>
    <View style={styles.footer}><WideButton label="VOIR LES SUCCÈS" onPress={onAchievements} /><WideButton label="RETOUR" onPress={onBack} quiet /></View>
  </View>;
}

function AchievementRow({ item }: { item: Achievement }) {
  const percentage = Math.min(100, (item.current / item.target) * 100);
  return <View style={[styles.achievement, item.unlocked && styles.achievementUnlocked]}><View style={[styles.glyph, item.unlocked && styles.glyphUnlocked]}><Text style={styles.glyphText}>{item.unlocked ? "✦" : "·"}</Text></View><View style={styles.achievementCopy}><Text style={styles.achievementTitle}>{item.title}</Text><Text style={styles.achievementDescription}>{item.description}</Text><View style={styles.track}><View style={[styles.fill, { width: `${percentage}%` }]} /></View></View><Text style={[styles.counter, item.unlocked && styles.counterUnlocked]}>{item.current}/{item.target}</Text></View>;
}

export function AchievementsView({ stats, dailyStreak, onBack }: AchievementsViewProps) {
  const achievements = getAchievements({ stats, dailyStreak });
  const unlocked = countUnlocked(achievements);
  return <FlatList
    data={achievements}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.list}
    ListHeaderComponent={<View><Text style={styles.eyebrow}>VOTRE CONSTELLATION</Text><Text style={styles.title}>Succès</Text><Text style={styles.subtitle}>Chaque objectif révèle une autre façon de maîtriser la boucle.</Text><View style={styles.summary}><Text style={styles.summaryLabel}>DÉBLOQUÉS</Text><Text style={styles.summaryValue}>{unlocked} / {achievements.length}</Text></View><Text style={styles.section}>OBJECTIFS</Text></View>}
    renderItem={({ item }) => <AchievementRow item={item} />}
    ListFooterComponent={<View style={styles.listFooter}><WideButton label="RETOUR" onPress={onBack} quiet /></View>}
    showsVerticalScrollIndicator={false}
  />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 28, paddingTop: 38, paddingBottom: 22 },
  eyebrow: { color: "#43F3C5", fontSize: 11, fontWeight: "900", letterSpacing: 2.7 }, title: { color: "#F4F7FF", fontSize: 38, fontWeight: "800", letterSpacing: -1, marginTop: 8 }, subtitle: { color: "#AAA7C7", fontSize: 15, lineHeight: 22, marginTop: 9, maxWidth: 310 },
  accuracyCircle: { width: 156, height: 156, borderRadius: 78, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#141733", borderWidth: 3, borderColor: "#43F3C5", marginTop: 26, shadowColor: "#43F3C5", shadowOpacity: 0.26, shadowRadius: 20, elevation: 5 }, accuracyValue: { color: "#F4F7FF", fontSize: 44, fontWeight: "900", letterSpacing: -1 }, accuracyLabel: { color: "#43F3C5", fontSize: 9, fontWeight: "900", letterSpacing: 1.7, marginTop: 2 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 26 }, metric: { width: "48.4%", minHeight: 76, borderRadius: 17, justifyContent: "center", paddingHorizontal: 14, backgroundColor: "#141733", borderWidth: 1, borderColor: "#342F52" }, metricAccent: { borderColor: "#3E7970", backgroundColor: "#112927" }, metricLabel: { color: "#AAA7C7", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 }, metricValue: { color: "#F4F7FF", fontSize: 25, fontWeight: "900", marginTop: 3 }, metricValueAccent: { color: "#43F3C5" },
  note: { borderLeftWidth: 2, borderLeftColor: "#8B5CF6", paddingLeft: 12, marginTop: 20 }, noteText: { color: "#817C9C", fontSize: 12, lineHeight: 18 }, footer: { width: "100%", gap: 10, marginTop: "auto" }, button: { width: "100%", minHeight: 56, borderRadius: 28, backgroundColor: "#43F3C5", alignItems: "center", justifyContent: "center" }, buttonQuiet: { backgroundColor: "#1A1D3C", borderWidth: 1, borderColor: "#3B365E" }, buttonText: { color: "#09211F", fontSize: 14, fontWeight: "900", letterSpacing: 1.8 }, buttonTextQuiet: { color: "#D7D4EC" }, buttonPressed: { opacity: 0.85, transform: [{ scale: 0.975 }] },
  list: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 26 }, summary: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderRadius: 18, backgroundColor: "#141733", borderWidth: 1, borderColor: "#342F52", paddingHorizontal: 16, paddingVertical: 14, marginTop: 22 }, summaryLabel: { color: "#AAA7C7", fontSize: 10, letterSpacing: 1.8, fontWeight: "900" }, summaryValue: { color: "#FFD166", fontSize: 28, fontWeight: "900" }, section: { color: "#817C9C", fontSize: 10, letterSpacing: 2, fontWeight: "900", marginTop: 26, marginBottom: 10 },
  achievement: { minHeight: 90, borderRadius: 18, borderWidth: 1, borderColor: "#342F52", backgroundColor: "#141733", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 10 }, achievementUnlocked: { borderColor: "#7460C4", backgroundColor: "#1B1939" }, glyph: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#28233F" }, glyphUnlocked: { backgroundColor: "#5B45AC" }, glyphText: { color: "#F4F7FF", fontSize: 17, fontWeight: "900" }, achievementCopy: { flex: 1, paddingLeft: 10 }, achievementTitle: { color: "#F4F7FF", fontSize: 14, fontWeight: "800" }, achievementDescription: { color: "#AAA7C7", fontSize: 10, lineHeight: 14, marginTop: 2 }, track: { height: 4, borderRadius: 2, backgroundColor: "#302B4B", marginTop: 8, overflow: "hidden" }, fill: { height: "100%", borderRadius: 2, backgroundColor: "#8B5CF6" }, counter: { color: "#AAA7C7", fontSize: 10, fontWeight: "900", paddingLeft: 7 }, counterUnlocked: { color: "#43F3C5" }, listFooter: { marginTop: 9 },
});
