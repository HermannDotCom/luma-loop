import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useLocalSearchParams } from "expo-router";

import { AchievementsView, StatsView } from "@/components/activity-views";
import { AdConsentModal, LegalNoticeModal, ResetDataModal } from "@/components/privacy-controls";
import { getOrbitTheme, isOrbitThemeUnlocked, ORBIT_THEMES } from "@/lib/game/catalog";
import { advanceDailyProgress, advanceDailyStreak, ensureDailyProgress, getDailyChallenge, getDateKey, getStreakCalendar } from "@/lib/game/daily";
import { createInitialState, getDifficulty, normalizeAngle, resolveTap } from "@/lib/game/engine";
import { gameHaptics } from "@/lib/game/haptics";
import { clearProfile, DEFAULT_PROFILE, loadProfile, saveProfile } from "@/lib/game/profile";
import { countUnlocked, getAchievements } from "@/lib/game/achievements";
import { accuracy, recordRunStart, recordTap } from "@/lib/game/stats";
import type { GameMode, GameState, PlayerProfile, RunStatus } from "@/lib/game/types";

const AMBIENT_AUDIO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663253463242/vrBHtdJuieNHcUuN.mp3";
const THEME_EFFECTS = {
  "orbit-iris": { orbitWidth: 2, dash: "", halo: 18, particleAngles: [] as number[] },
  "orbit-daybreak": { orbitWidth: 3, dash: "5 5", halo: 23, particleAngles: [0.38, 1.95, 4.4] },
  "orbit-aurora": { orbitWidth: 3, dash: "11 7", halo: 26, particleAngles: [0.22, 2.3, 4.5] },
  "orbit-comet": { orbitWidth: 2.5, dash: "16 5", halo: 30, particleAngles: [0.54, 3.05] },
  "orbit-opal": { orbitWidth: 3.5, dash: "3 6", halo: 24, particleAngles: [0.5, 1.8, 3.1, 4.4, 5.7] },
  "orbit-supernova": { orbitWidth: 4, dash: "18 4", halo: 35, particleAngles: [0.2, 1.24, 2.3, 3.36, 4.4, 5.45] },
};

type Burst = "idle" | "hit" | "miss";

function scoreLabel(score: number) {
  return String(score).padStart(2, "0");
}

function MiniPetal({ active }: { active: boolean }) {
  return <View style={[styles.petal, active ? styles.petalActive : styles.petalLost]} />;
}

function PrimaryButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, secondary && styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      <Text style={[styles.primaryButtonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function LumaLoopGame() {
  const { capture: captureParam } = useLocalSearchParams<{ capture?: string }>();
  const capture = __DEV__ && typeof captureParam === "string" ? captureParam : undefined;
  const ambientPlayer = useAudioPlayer(AMBIENT_AUDIO_URL);
  const [status, setStatus] = useState<RunStatus>("home");
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [game, setGame] = useState<GameState>(() => createInitialState(Date.now() % 997));
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [playfieldSize, setPlayfieldSize] = useState(320);
  const [burst, setBurst] = useState<Burst>("idle");
  const [levelFlash, setLevelFlash] = useState<string | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [legalNoticeVisible, setLegalNoticeVisible] = useState(false);
  const [adConsentVisible, setAdConsentVisible] = useState(false);
  const [resetStep, setResetStep] = useState<"warning" | "confirm" | null>(null);
  const orbitAngleRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const timestampRef = useRef<number | null>(null);
  const gameRef = useRef(game);
  const profileRef = useRef(profile);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (capture) return;
    void loadProfile().then((loaded) => {
      const challenge = getDailyChallenge();
      const dailyProgress = ensureDailyProgress(loaded.dailyProgress, challenge);
      const normalized = { ...loaded, dailyProgress };
      setProfile(normalized);
      if (loaded.dailyProgress !== dailyProgress) void saveProfile(normalized);
    });
  }, [capture]);

  useEffect(() => {
    if (!capture) return;
    const challenge = getDailyChallenge();
    const baseGame = createInitialState(418, capture === "training" ? "training" : "classic");
    const stagedGame = capture === "rhythm"
      ? { ...baseGame, score: 82, combo: 6, hits: 18, direction: -1 as const, gateAngle: Math.PI * 1.42, lastResult: "perfect" as const }
      : capture === "training"
        ? { ...baseGame, score: 34, combo: 4, hits: 8, gateAngle: Math.PI * 1.37, lastResult: "hit" as const }
        : { ...baseGame, score: 27, combo: 4, hits: 7, gateAngle: Math.PI * 1.42, lastResult: "perfect" as const };
    setProfile({
      ...DEFAULT_PROFILE,
      bestScore: 104,
      equippedOrbitId: capture === "themes" ? "orbit-supernova" : "orbit-aurora",
      unlockedThemeIds: ORBIT_THEMES.map((theme) => theme.id),
      dailyProgress: { dateKey: getDateKey(), challengeId: challenge.id, value: Math.max(1, challenge.target - 1), completed: false },
      dailyStreak: { current: 5, best: 9, lastCompletedDate: getDateKey() },
      stats: { totalRuns: 48, trainingRuns: 9, totalTaps: 382, totalHits: 298, perfectHits: 96, maxCombo: 18, dailyChallengesCompleted: 11 },
      hasSeenOnboarding: true,
    });
    setGame(stagedGame);
    orbitAngleRef.current = stagedGame.gateAngle - 0.018;
    setOrbitAngle(orbitAngleRef.current);
    setStatus(capture === "daily" ? "daily" : capture === "themes" ? "collection" : capture === "stats" ? "stats" : "playing");
  }, [capture]);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
    ambientPlayer.volume = 0.14;
    ambientPlayer.loop = true;
  }, [ambientPlayer]);

  useEffect(() => {
    if ((status === "playing" || status === "tutorial") && profile.soundEnabled) {
      ambientPlayer.play();
      return;
    }
    ambientPlayer.pause();
  }, [ambientPlayer, profile.soundEnabled, status]);

  useEffect(() => {
    if (burst === "idle") return;
    const timer = setTimeout(() => setBurst("idle"), 300);
    return () => clearTimeout(timer);
  }, [burst]);

  useEffect(() => {
    if (!levelFlash) return;
    const timer = setTimeout(() => setLevelFlash(null), 1150);
    return () => clearTimeout(timer);
  }, [levelFlash]);

  useEffect(() => {
    if (status !== "playing" && status !== "tutorial") {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      timestampRef.current = null;
      return;
    }
    if (capture) return;

    const tick = (timestamp: number) => {
      const previous = timestampRef.current ?? timestamp;
      const delta = Math.min(42, timestamp - previous) / 1000;
      timestampRef.current = timestamp;
      orbitAngleRef.current = normalizeAngle(
        orbitAngleRef.current + getDifficulty(gameRef.current.hits).radiansPerSecond * gameRef.current.direction * delta,
      );
      setOrbitAngle(orbitAngleRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [capture, status]);

  const updateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      void saveProfile(next);
      return next;
    });
  }, []);

  const resetLocalData = useCallback(() => {
    void clearProfile().then(() => {
      profileRef.current = DEFAULT_PROFILE;
      setProfile(DEFAULT_PROFILE);
      setGame(createInitialState(Date.now() % 997));
      setOrbitAngle(0);
      orbitAngleRef.current = 0;
      setBurst("idle");
      setLevelFlash(null);
      setResetStep(null);
      setStatus("home");
    });
  }, []);

  const startGame = useCallback((mode: GameMode = "classic") => {
    gameHaptics.tap(profileRef.current.hapticsEnabled);
    setProfile((current) => {
      const next = { ...current, stats: recordRunStart(current.stats, mode) };
      void saveProfile(next);
      return next;
    });
    orbitAngleRef.current = 0;
    setOrbitAngle(0);
    setBurst("idle");
    setLevelFlash(null);
    setGame(createInitialState(Date.now() % 997, mode));
    setStatus(mode === "tutorial" ? "tutorial" : "playing");
  }, []);

  const handleTap = useCallback(() => {
    if (status !== "playing" && status !== "tutorial") return;
    const outcome = resolveTap(gameRef.current, orbitAngleRef.current);
    setGame(outcome.state);
    setBurst(profileRef.current.reduceMotion ? "idle" : outcome.hit ? "hit" : "miss");
    if (outcome.levelUp && !profileRef.current.reduceMotion) setLevelFlash(`NIVEAU ${outcome.nextDifficulty.level}`);
    setProfile((current) => {
      const nextStats = recordTap(current.stats, outcome);
      if (outcome.hit) {
        const challenge = getDailyChallenge();
        const progress = ensureDailyProgress(current.dailyProgress, challenge);
        const increment = challenge.kind === "perfect" ? (outcome.perfect ? 1 : 0) : 1;
        const dailyProgress = advanceDailyProgress(progress, challenge, increment);
        const justCompleted = !progress.completed && dailyProgress.completed;
        const unlockedThemeIds = dailyProgress.completed && !current.unlockedThemeIds.includes("orbit-daybreak")
          ? [...current.unlockedThemeIds, "orbit-daybreak"]
          : current.unlockedThemeIds;
        const dailyStreak = justCompleted
          ? advanceDailyStreak(current.dailyStreak, dailyProgress.dateKey)
          : current.dailyStreak;
        const stats = { ...nextStats, dailyChallengesCompleted: nextStats.dailyChallengesCompleted + (justCompleted ? 1 : 0) };
        const next = { ...current, dailyProgress, unlockedThemeIds, dailyStreak, stats };
        void saveProfile(next);
        return next;
      }
      const next = { ...current, stats: nextStats };
      void saveProfile(next);
      return next;
    });
    if (outcome.hit) {
      gameHaptics.hit(profileRef.current.hapticsEnabled);
      if (gameRef.current.mode === "tutorial") {
        updateProfile({ hasSeenOnboarding: true });
        setStatus("playing");
      }
    } else {
      gameHaptics.miss(profileRef.current.hapticsEnabled);
    }

    if (outcome.finished) {
      const newBest = Math.max(profileRef.current.bestScore, outcome.state.score);
      if (newBest !== profileRef.current.bestScore) updateProfile({ bestScore: newBest });
      setStatus("gameover");
    }
  }, [status, updateProfile]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setPlayfieldSize(Math.min(360, Math.max(260, event.nativeEvent.layout.width - 28)));
  };

  const difficulty = getDifficulty(game.hits);
  const activeTheme = getOrbitTheme(profile.equippedOrbitId);
  const themeEffect = THEME_EFFECTS[activeTheme.id as keyof typeof THEME_EFFECTS] ?? THEME_EFFECTS["orbit-iris"];
  const dailyChallenge = getDailyChallenge();
  const dailyProgress = ensureDailyProgress(profile.dailyProgress, dailyChallenge);
  const dailyRemaining = Math.max(0, dailyChallenge.target - dailyProgress.value);
  const streakCalendar = getStreakCalendar(profile.dailyStreak);
  const playerAccuracy = accuracy(profile.stats);
  const achievements = getAchievements({ stats: profile.stats, dailyStreak: profile.dailyStreak });
  const unlockedAchievementCount = countUnlocked(achievements);
  const gateScreenRadius = playfieldSize * 0.34;
  const gateStart = {
    x: playfieldSize / 2 + Math.cos(game.gateAngle - difficulty.gateHalfWidth) * gateScreenRadius,
    y: playfieldSize / 2 + Math.sin(game.gateAngle - difficulty.gateHalfWidth) * gateScreenRadius,
  };
  const gateEnd = {
    x: playfieldSize / 2 + Math.cos(game.gateAngle + difficulty.gateHalfWidth) * gateScreenRadius,
    y: playfieldSize / 2 + Math.sin(game.gateAngle + difficulty.gateHalfWidth) * gateScreenRadius,
  };
  const gatePath = `M ${gateStart.x} ${gateStart.y} A ${gateScreenRadius} ${gateScreenRadius} 0 0 1 ${gateEnd.x} ${gateEnd.y}`;

  const playfield = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toucher pour synchroniser la luciole avec la porte"
      onPress={handleTap}
      onLayout={handleLayout}
      style={({ pressed }) => [styles.playfieldTouch, pressed && status === "playing" && styles.playfieldPressed]}
    >
      <View style={[styles.playfield, { width: playfieldSize, height: playfieldSize }, profile.highContrast && styles.playfieldContrast]}>
        <Svg width={playfieldSize} height={playfieldSize} viewBox={`0 0 ${playfieldSize} ${playfieldSize}`}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#6A55EC" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#090B1A" stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="orbit" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.35" />
              <Stop offset="0.5" stopColor="#43F3C5" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#8B5CF6" stopOpacity="0.35" />
            </LinearGradient>
            <RadialGradient id="core" cx="35%" cy="30%" r="70%">
              <Stop offset="0" stopColor="#F4F7FF" />
              <Stop offset="0.35" stopColor="#A78BFA" />
              <Stop offset="1" stopColor="#4C1D95" />
            </RadialGradient>
          </Defs>
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.49} fill="url(#glow)" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={gateScreenRadius} fill="none" stroke={activeTheme.palette.primary} strokeOpacity="0.42" strokeWidth={themeEffect.orbitWidth} strokeDasharray={themeEffect.dash} />
          <Path d={gatePath} fill="none" stroke="#FFD166" strokeWidth="11" strokeLinecap="round" />
          <Path d={gatePath} fill="none" stroke="#FFF2B7" strokeWidth="3" strokeLinecap="round" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.16} fill="#111431" stroke="#8B5CF6" strokeWidth="2" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.12} fill="url(#core)" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.055} fill="#F4F7FF" fillOpacity="0.96" />
          {burst === "hit" && <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.27} fill="none" stroke={activeTheme.palette.primary} strokeOpacity="0.8" strokeWidth="2" />}
          {burst === "miss" && <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.24} fill="none" stroke="#FF6B8A" strokeOpacity="0.7" strokeWidth="3" />}
          <G>
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius} r={themeEffect.halo} fill={activeTheme.palette.primary} fillOpacity="0.16" />
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius} r={9} fill={activeTheme.palette.secondary} fillOpacity="0.42" />
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius} r={5} fill={activeTheme.palette.highlight} />
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius - 1.8} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius - 1.8} r={2.4} fill={activeTheme.palette.primary} />
            {!profile.reduceMotion && themeEffect.particleAngles.map((offset, index) => <Circle key={`${activeTheme.id}-${offset}`} cx={playfieldSize / 2 + Math.cos(orbitAngle + offset) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle + offset) * gateScreenRadius} r={index % 2 === 0 ? 2.3 : 1.4} fill={activeTheme.palette.secondary} fillOpacity={0.45 + index * 0.06} />)}
          </G>
        </Svg>
        {levelFlash ? <View pointerEvents="none" style={styles.levelFlash}><Text style={styles.levelFlashTop}>NOUVEAU RYTHME</Text><Text style={styles.levelFlashText}>{levelFlash}</Text><Text style={styles.levelFlashName}>{difficulty.name.toUpperCase()}</Text></View> : null}
      </View>
    </Pressable>
  );

  if (status === "home") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.home}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}><View style={styles.brandOrbit} /><View style={styles.brandSpark} /></View>
            <Text style={styles.brandName}>LUMA LOOP</Text>
            <Text style={styles.brandTagline}>Touchez quand la lumière rencontre la porte.</Text>
            {!profile.hasSeenOnboarding ? <View style={styles.onboardingHint}><Text style={styles.onboardingHintText}>PREMIÈRE PARTIE GUIDÉE · AUCUNE ERREUR COMPTÉE</Text></View> : null}
          </View>
          <View style={styles.homeOrbitalPreview}>{playfield}</View>
          <View style={styles.homeFooter}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voir le défi du jour" onPress={() => setStatus("daily")} style={({ pressed }) => [styles.dailyCard, dailyProgress.completed && styles.dailyComplete, pressed && styles.settingsPressed]}>
              <View style={styles.dailyOrb}><Text style={styles.dailyOrbText}>{dailyProgress.completed ? "✓" : `${dailyProgress.value}/${dailyChallenge.target}`}</Text></View>
              <View style={styles.dailyCopy}><Text style={styles.dailyEyebrow}>DÉFI DU JOUR · {profile.dailyStreak.current} J DE SÉRIE</Text><Text style={styles.dailyTitle}>{dailyProgress.completed ? "Défi complété" : dailyChallenge.title}</Text><Text style={styles.dailySubtitle}>{dailyProgress.completed ? "Revenez demain pour prolonger la série." : dailyChallenge.description}</Text></View>
              <Text style={styles.dailyArrow}>›</Text>
            </Pressable>
            <Text style={styles.bestCaption}>MEILLEUR ÉLAN</Text>
            <Text style={styles.bestScore}>{scoreLabel(profile.bestScore)}</Text>
            <PrimaryButton label={profile.hasSeenOnboarding ? "JOUER" : "DÉCOUVRIR LA BOUCLE"} onPress={() => startGame(profile.hasSeenOnboarding ? "classic" : "tutorial")} />
            <View style={styles.homeLinks}><Pressable accessibilityRole="button" accessibilityLabel="Démarrer le mode entraînement" onPress={() => startGame("training")} style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}><Text style={styles.settingsText}>Entraînement</Text></Pressable><View style={styles.linkDivider}/><Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les thèmes" onPress={() => setStatus("collection")} style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}><Text style={styles.settingsText}>Thèmes</Text></Pressable><View style={styles.linkDivider}/><Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les réglages" onPress={() => setStatus("settings")} style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}><Text style={styles.settingsText}>Réglages</Text></Pressable></View>
            <View style={styles.activityLinks}><Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les statistiques" onPress={() => setStatus("stats")} style={({ pressed }) => [styles.activityLink, pressed && styles.settingsPressed]}><Text style={styles.activityLinkLabel}>PRÉCISION</Text><Text style={styles.activityLinkValue}>{playerAccuracy}%</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les succès" onPress={() => setStatus("achievements")} style={({ pressed }) => [styles.activityLink, pressed && styles.settingsPressed]}><Text style={styles.activityLinkLabel}>SUCCÈS</Text><Text style={styles.activityLinkValue}>{unlockedAchievementCount}/{achievements.length}</Text></Pressable></View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "settings") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.settingsScreen}>
          <Text style={styles.eyebrow}>CONFORT</Text>
          <Text style={styles.settingsTitle}>Réglages</Text>
          <Text style={styles.settingsSubtitle}>Choisissez ce qui vous aide à suivre la lumière.</Text>
          <View style={styles.settingsCard}>
            <SettingRow label="Vibrations" value={profile.hapticsEnabled} onChange={(value) => updateProfile({ hapticsEnabled: value })} />
            <View style={styles.divider} />
            <SettingRow label="Sons" value={profile.soundEnabled} onChange={(value) => updateProfile({ soundEnabled: value })} />
            <View style={styles.divider} />
            <SettingRow label="Contraste renforcé" value={profile.highContrast} onChange={(value) => updateProfile({ highContrast: value })} />
            <View style={styles.divider} />
            <SettingRow label="Animations réduites" value={profile.reduceMotion} onChange={(value) => updateProfile({ reduceMotion: value })} />
          </View>
          <View style={styles.settingsActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les préférences publicitaires" onPress={() => setAdConsentVisible(true)} style={({ pressed }) => [styles.settingsActionCard, pressed && styles.settingsPressed]}><View><Text style={styles.settingsActionTitle}>Publicité future</Text><Text style={styles.settingsActionText}>{profile.adConsentPreference === "ask_later" ? "Vous serez consulté avant toute diffusion." : profile.adConsentPreference === "non_personalized" ? "Préférence : annonces non personnalisées." : "Préférence : personnalisation demandée."}</Text></View><Text style={styles.settingsActionArrow}>›</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Réinitialiser toutes les données locales" onPress={() => setResetStep("warning")} style={({ pressed }) => [styles.resetActionCard, pressed && styles.settingsPressed]}><View><Text style={styles.resetActionTitle}>Réinitialiser les données</Text><Text style={styles.settingsActionText}>Efface scores, thèmes, défis et préférences.</Text></View><Text style={styles.settingsActionArrow}>›</Text></Pressable>
          </View>
          <View style={styles.settingsSpacer} />
          <PrimaryButton label="RETOUR" onPress={() => setStatus("home")} secondary />
          <View style={styles.legalLinks}><Pressable accessibilityRole="button" accessibilityLabel="Lire la politique de confidentialité" onPress={() => setPrivacyVisible(true)} style={({ pressed }) => [styles.privacyLink, pressed && styles.settingsPressed]}><Text style={styles.privacyLinkText}>Confidentialité</Text></Pressable><View style={styles.legalDivider}/><Pressable accessibilityRole="button" accessibilityLabel="Lire les mentions légales" onPress={() => setLegalNoticeVisible(true)} style={({ pressed }) => [styles.privacyLink, pressed && styles.settingsPressed]}><Text style={styles.privacyLinkText}>Mentions légales</Text></Pressable></View>
          <Modal animationType="slide" transparent visible={privacyVisible} onRequestClose={() => setPrivacyVisible(false)} statusBarTranslucent>
            <View style={styles.modalScrim}>
              <View style={styles.privacySheet}>
                <View style={styles.privacyHeader}><View><Text style={styles.privacyKicker}>LUMA LOOP</Text><Text style={styles.privacyTitle}>Confidentialité</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fermer la politique de confidentialité" onPress={() => setPrivacyVisible(false)} style={({ pressed }) => [styles.modalClose, pressed && styles.settingsPressed]}><Text style={styles.modalCloseText}>×</Text></Pressable></View>
                <ScrollView contentContainerStyle={styles.privacyContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.privacyDate}>Dernière mise à jour : 27 août 2026</Text>
                  <Text style={styles.privacyParagraph}>Luma Loop est un jeu de synchronisation jouable sans compte. Cette version ne contient ni publicité, ni achat intégré, ni profil en ligne, ni outil d’analytique tiers.</Text>
                  <Text style={styles.privacyHeading}>Données traitées</Text>
                  <Text style={styles.privacyParagraph}>Le meilleur score, les statistiques et les préférences de confort sont enregistrés uniquement sur votre appareil. Le développeur ne reçoit pas ces données et elles ne sont pas synchronisées vers un serveur.</Text>
                  <Text style={styles.privacyParagraph}>Lorsque le son est activé, l’application demande un fichier audio statique depuis son hébergement. Cette requête peut créer des journaux techniques de connexion chez l’hébergeur, comme une adresse IP et des informations standard de navigateur ou d’appareil.</Text>
                  <Text style={styles.privacyHeading}>Vos choix</Text>
                  <Text style={styles.privacyParagraph}>Vous pouvez désactiver le son, les vibrations et le contraste renforcé dans les réglages. La désinstallation de Luma Loop supprime les données locales associées sur l’appareil.</Text>
                  <Text style={styles.privacyHeading}>Évolutions</Text>
                  <Text style={styles.privacyParagraph}>Cette version ne diffuse aucune publicité et ne contient pas de SDK publicitaire. Si cela change, cette politique et les déclarations de confidentialité des stores seront mises à jour avant publication.</Text>
                  <Text style={styles.privacyHeading}>Contact</Text>
                  <Text style={styles.privacyParagraph}>Pour toute question relative à cette politique, utilisez le contact d’assistance indiqué sur la fiche de Luma Loop dans votre store.</Text>
                </ScrollView>
                <PrimaryButton label="J’AI COMPRIS" onPress={() => setPrivacyVisible(false)} />
              </View>
            </View>
          </Modal>
          <LegalNoticeModal visible={legalNoticeVisible} onClose={() => setLegalNoticeVisible(false)} />
          <AdConsentModal visible={adConsentVisible} value={profile.adConsentPreference} onChoose={(adConsentPreference) => updateProfile({ adConsentPreference })} onClose={() => setAdConsentVisible(false)} />
          <ResetDataModal visible={resetStep !== null} step={resetStep ?? "warning"} onClose={() => setResetStep(null)} onContinue={() => setResetStep("confirm")} onReset={resetLocalData} />
        </View>
      </SafeAreaView>
    );
  }

  if (status === "stats") {
    return <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}><StatsView stats={profile.stats} onBack={() => setStatus("home")} onAchievements={() => setStatus("achievements")} /></SafeAreaView>;
  }

  if (status === "achievements") {
    return <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}><AchievementsView stats={profile.stats} dailyStreak={profile.dailyStreak} onBack={() => setStatus("home")} /></SafeAreaView>;
  }

  if (status === "collection") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <FlatList
          data={ORBIT_THEMES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.collectionList}
          ListHeaderComponent={<View><Text style={styles.eyebrow}>VOTRE ORBITE</Text><Text style={styles.collectionTitle}>Thèmes</Text><Text style={styles.collectionSubtitle}>Atteignez de nouveaux records pour éclairer votre boucle autrement.</Text><View style={styles.collectionScore}><Text style={styles.collectionScoreLabel}>MEILLEUR ÉLAN</Text><Text style={styles.collectionScoreValue}>{scoreLabel(profile.bestScore)}</Text></View><Text style={styles.collectionSection}>COLLECTION</Text></View>}
          renderItem={({ item }) => {
            const unlocked = isOrbitThemeUnlocked(item, profile.bestScore, profile.unlockedThemeIds);
            const equipped = item.id === profile.equippedOrbitId;
            return <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}${unlocked ? "" : ", verrouillé"}`} disabled={!unlocked} onPress={() => updateProfile({ equippedOrbitId: item.id })} style={({ pressed }) => [styles.themeCard, equipped && styles.themeCardEquipped, !unlocked && styles.themeCardLocked, pressed && unlocked && styles.buttonPressed]}><View style={[styles.themeSwatch, { backgroundColor: item.palette.primary }]}><View style={[styles.themeSwatchInner, { borderColor: item.palette.secondary }]} /></View><View style={styles.themeCopy}><Text style={styles.themeName}>{item.name}</Text><Text style={styles.themeDescription}>{unlocked ? item.description : `Record ${item.unlockScore} requis`}</Text></View><View style={[styles.themeBadge, equipped && styles.themeBadgeEquipped]}><Text style={[styles.themeBadgeText, equipped && styles.themeBadgeTextEquipped]}>{equipped ? "ACTIF" : unlocked ? "CHOISIR" : `× ${item.unlockScore}`}</Text></View></Pressable>;
          }}
          ListFooterComponent={<View style={styles.collectionFooter}><PrimaryButton label="RETOUR" onPress={() => setStatus("home")} secondary /></View>}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  if (status === "daily") {
    const rewardTheme = getOrbitTheme("orbit-daybreak");
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.endScreen}>
          <Text style={styles.eyebrow}>UNE FOIS PAR JOUR</Text>
          <Text style={styles.endTitle}>Défi du jour</Text>
          <View style={styles.endScoreBubble}><Text style={styles.endScore}>{dailyProgress.value}</Text><Text style={styles.endScoreLabel}>SUR {dailyChallenge.target}</Text></View>
          <Text style={styles.endHint}>{dailyProgress.completed ? `Récompense débloquée : thème ${rewardTheme.name}.` : `${dailyChallenge.title} — ${dailyChallenge.description}.`}</Text>
          <Text style={styles.streakCaption}>SÉRIE ACTUELLE · {profile.dailyStreak.current} JOUR{profile.dailyStreak.current > 1 ? "S" : ""}</Text>
          <View style={styles.streakCalendar}>{streakCalendar.map((day) => <View key={day.key} style={styles.calendarDay}><Text style={[styles.calendarLabel, day.today && styles.calendarLabelToday]}>{day.label}</Text><View style={[styles.calendarDot, day.completed && styles.calendarDotComplete, day.today && styles.calendarDotToday]}>{day.completed ? <Text style={styles.calendarTick}>✓</Text> : null}</View></View>)}</View>
          <View style={styles.endActions}>
            <PrimaryButton label={dailyProgress.completed ? "VOIR LE THÈME" : "RELEVER LE DÉFI"} onPress={() => dailyProgress.completed ? setStatus("collection") : startGame()} />
            <PrimaryButton label="ACCUEIL" onPress={() => setStatus("home")} secondary />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "gameover") {
    const record = game.score >= profile.bestScore && game.score > 0;
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.endScreen}>
          <Text style={styles.eyebrow}>{record ? "NOUVEL ÉLAN" : "BEL ESSAI"}</Text>
          <Text style={styles.endTitle}>{record ? "Vous brillez." : "La boucle continue."}</Text>
          <View style={styles.endScoreBubble}><Text style={styles.endScore}>{scoreLabel(game.score)}</Text><Text style={styles.endScoreLabel}>POINTS</Text></View>
          <Text style={styles.endHint}>Chaque passage est une nouvelle chance.</Text>
          <View style={styles.endActions}>
            <PrimaryButton label="ENCORE" onPress={startGame} />
            <PrimaryButton label="ACCUEIL" onPress={() => setStatus("home")} secondary />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "paused") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.pauseScreen}>
          <Text style={styles.eyebrow}>RESPIRER</Text>
          <Text style={styles.endTitle}>La lumière attend.</Text>
          <View style={styles.pauseScorePanel}>
            <Text style={styles.pauseScoreLabel}>ÉLAN ACTUEL</Text>
            <Text style={styles.pauseScore}>{scoreLabel(game.score)}</Text>
          </View>
          <View style={styles.endActions}>
            <PrimaryButton label="REPRENDRE" onPress={() => setStatus("playing")} />
            <PrimaryButton label="RECOMMENCER" onPress={startGame} secondary />
            <Pressable accessibilityRole="button" accessibilityLabel="Revenir à l’accueil" onPress={() => setStatus("home")} style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}><Text style={styles.settingsText}>Accueil</Text></Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.gameScreen}>
        <View style={styles.gameHeader}>
          <View><Text style={styles.hudLabel}>{game.mode === "tutorial" ? "DÉCOUVERTE" : game.mode === "training" ? "ENTRAÎNEMENT" : "ÉLAN"}</Text><Text style={styles.hudScore}>{scoreLabel(game.score)}</Text></View>
          {game.mode === "training" || game.mode === "tutorial" ? <View style={styles.trainingBadge}><Text style={styles.trainingInfinity}>{game.mode === "tutorial" ? "✦" : "∞"}</Text><Text style={styles.trainingText}>{game.mode === "tutorial" ? "GUIDÉ" : "SANS VIES"}</Text></View> : <View style={styles.lives}>{[0, 1, 2].map((item) => <MiniPetal key={item} active={item < game.lives} />)}</View>}
          <Pressable accessibilityRole="button" accessibilityLabel="Mettre la partie en pause" onPress={() => setStatus("paused")} style={({ pressed }) => [styles.pauseButton, pressed && styles.settingsPressed]}><View style={styles.pauseBars}><View style={styles.pauseBar}/><View style={styles.pauseBar}/></View></Pressable>
        </View>
          <View style={styles.levelRow}><View style={styles.levelPill}><Text style={styles.levelPillText}>NIVEAU {difficulty.level}</Text></View><Text style={styles.levelName}>{difficulty.name.toUpperCase()}</Text>{game.direction < 0 ? <View style={styles.directionBadge}><Text style={styles.directionBadgeText}>↺ SENS INVERSÉ</Text></View> : null}</View>
          <View style={styles.comboLine}>{game.combo > 1 ? <Text style={styles.comboText}>{game.lastResult === "perfect" ? "PARFAIT · " : "SÉRIE · "}× {game.combo}</Text> : <Text style={styles.comboPrompt}>{difficulty.instruction}</Text>}</View>
        {game.mode === "tutorial" ? <View style={styles.tutorialCard}><Text style={styles.tutorialEyebrow}>REGARDEZ LA LUCIOLE</Text><Text style={styles.tutorialText}>Touchez n’importe où lorsqu’elle traverse la porte dorée.</Text></View> : null}
        <View style={styles.gameFieldWrap}>{playfield}</View>
        <View style={styles.gameInstruction}><View style={styles.instructionDot}/><Text style={styles.instructionText}>{game.mode === "tutorial" ? "PREMIÈRE RÉUSSITE · LA PARTIE GUIDÉE CONTINUE" : game.mode === "training" ? "ENTRAÎNEMENT · RYTHME LIBRE SANS FIN DE PARTIE" : dailyProgress.completed ? "DÉFI DU JOUR TERMINÉ · BRAVO" : dailyChallenge.kind === "perfect" ? `${dailyRemaining} PARFAIT${dailyRemaining > 1 ? "S" : ""} POUR LE DÉFI` : `${dailyRemaining} PASSAGES POUR LE DÉFI`}</Text></View>
      </View>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (next: boolean) => void }) {
  return <View style={styles.settingRow}><Text style={styles.settingLabel}>{label}</Text><Switch value={value} onValueChange={onChange} trackColor={{ false: "#3B3656", true: "#43F3C5" }} thumbColor={value ? "#F4F7FF" : "#A69FBB"} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#090B1A" },
  home: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 18, paddingBottom: 14 },
  brandLockup: { alignItems: "center" }, brandMark: { width: 64, height: 64, marginBottom: 10, alignItems: "center", justifyContent: "center" }, brandOrbit: { width: 54, height: 54, borderRadius: 28, borderWidth: 3, borderColor: "#8B5CF6", borderRightColor: "#43F3C5", transform: [{ rotate: "-26deg" }] }, brandSpark: { position: "absolute", width: 13, height: 13, borderRadius: 8, backgroundColor: "#43F3C5", right: 3, top: 8, borderWidth: 3, borderColor: "#F4F7FF", shadowColor: "#43F3C5", shadowOpacity: 0.85, shadowRadius: 8, elevation: 5 },
  brandName: { color: "#F4F7FF", fontSize: 28, letterSpacing: 5, fontWeight: "800" }, brandTagline: { color: "#AAA7C7", fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: "center", maxWidth: 280 },
  onboardingHint: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "#172A29", borderWidth: 1, borderColor: "#2D6C62" }, onboardingHintText: { color: "#43F3C5", fontSize: 8, letterSpacing: 1.1, fontWeight: "900" },
  homeOrbitalPreview: { flex: 1, justifyContent: "center", width: "100%" }, homeFooter: { width: "100%", alignItems: "center" }, dailyCard: { width: "100%", minHeight: 72, marginBottom: 13, borderWidth: 1, borderColor: "#4A3C7C", borderRadius: 18, backgroundColor: "#141733", paddingHorizontal: 12, paddingVertical: 9, flexDirection: "row", alignItems: "center" }, dailyComplete: { borderColor: "#43F3C5" }, dailyOrb: { width: 43, height: 43, borderRadius: 22, borderWidth: 2, borderColor: "#FFD166", alignItems: "center", justifyContent: "center", backgroundColor: "#2A2544" }, dailyOrbText: { color: "#FFD166", fontSize: 11, fontWeight: "900" }, dailyCopy: { flex: 1, paddingLeft: 10 }, dailyEyebrow: { color: "#43F3C5", fontSize: 8, letterSpacing: 1.5, fontWeight: "900" }, dailyTitle: { color: "#F4F7FF", fontSize: 14, fontWeight: "800", marginTop: 2 }, dailySubtitle: { color: "#AAA7C7", fontSize: 10, marginTop: 2 }, dailyArrow: { color: "#FFD166", fontSize: 29, lineHeight: 30, fontWeight: "300" }, bestCaption: { color: "#8C88A9", fontSize: 10, letterSpacing: 2.4, fontWeight: "800" }, bestScore: { color: "#FFD166", fontSize: 30, fontWeight: "800", letterSpacing: 1, marginTop: 3, marginBottom: 14 }, homeLinks: { flexDirection: "row", alignItems: "center", marginTop: 1 }, linkDivider: { width: 1, height: 16, backgroundColor: "#3B365E" },
  metricTile: { width: "48.4%", minHeight: 76, borderRadius: 17, justifyContent: "center", paddingHorizontal: 14, backgroundColor: "#141733", borderWidth: 1, borderColor: "#342F52" }, metricTileAccent: { borderColor: "#3E7970", backgroundColor: "#112927" }, metricLabel: { color: "#AAA7C7", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 }, metricValue: { color: "#F4F7FF", fontSize: 25, fontWeight: "900", marginTop: 3 }, metricValueAccent: { color: "#43F3C5" },
  activityLinks: { width: "100%", flexDirection: "row", gap: 9, marginTop: 2 }, activityLink: { flex: 1, minHeight: 42, paddingHorizontal: 12, justifyContent: "center", alignItems: "center", borderRadius: 13, backgroundColor: "#12152E", borderWidth: 1, borderColor: "#2E2A4B" }, activityLinkLabel: { color: "#8C88A9", fontSize: 8, letterSpacing: 1.25, fontWeight: "900" }, activityLinkValue: { color: "#F4F7FF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  playfieldTouch: { alignSelf: "center", borderRadius: 180 }, playfieldPressed: { transform: [{ scale: 0.985 }] }, playfield: { alignItems: "center", justifyContent: "center", borderRadius: 180, backgroundColor: "#0D1030", borderWidth: 1, borderColor: "#342A58", shadowColor: "#8B5CF6", shadowOpacity: 0.25, shadowRadius: 22, elevation: 6, overflow: "hidden" }, playfieldContrast: { borderWidth: 3, borderColor: "#F4F7FF" },
  primaryButton: { width: "100%", minHeight: 58, borderRadius: 29, justifyContent: "center", alignItems: "center", backgroundColor: "#43F3C5", shadowColor: "#43F3C5", shadowOpacity: 0.36, shadowRadius: 14, elevation: 5 }, primaryButtonText: { color: "#09211F", fontSize: 15, fontWeight: "900", letterSpacing: 2.3 }, secondaryButton: { backgroundColor: "#1A1D3C", borderWidth: 1, borderColor: "#3B365E", shadowOpacity: 0 }, secondaryButtonText: { color: "#D7D4EC" }, buttonPressed: { opacity: 0.88, transform: [{ scale: 0.975 }] }, settingsButton: { paddingVertical: 16, paddingHorizontal: 24, marginTop: 3 }, settingsText: { color: "#AAA7C7", fontSize: 14, fontWeight: "700" }, settingsPressed: { opacity: 0.6 },
  gameScreen: { flex: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 }, gameHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 60 }, hudLabel: { color: "#8C88A9", fontSize: 10, letterSpacing: 2, fontWeight: "800" }, hudScore: { color: "#F4F7FF", fontSize: 29, lineHeight: 32, fontWeight: "800", letterSpacing: 1 }, lives: { flexDirection: "row", gap: 7, alignItems: "center" }, trainingBadge: { alignItems: "center" }, trainingInfinity: { color: "#43F3C5", fontSize: 25, lineHeight: 25, fontWeight: "800" }, trainingText: { color: "#43F3C5", fontSize: 8, letterSpacing: 1.2, fontWeight: "900" }, petal: { width: 15, height: 20, borderRadius: 12, transform: [{ rotate: "35deg" }] }, petalActive: { backgroundColor: "#FF6B8A", shadowColor: "#FF6B8A", shadowOpacity: 0.8, shadowRadius: 5 }, petalLost: { backgroundColor: "#302A46" }, pauseButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: "#3B365E", backgroundColor: "#141733", alignItems: "center", justifyContent: "center" }, pauseBars: { flexDirection: "row", gap: 5 }, pauseBar: { width: 4, height: 15, borderRadius: 2, backgroundColor: "#D7D4EC" },
  levelRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, height: 29 }, levelPill: { backgroundColor: "#251D45", borderWidth: 1, borderColor: "#6B51AD", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }, levelPillText: { color: "#C4B5FD", fontSize: 9, letterSpacing: 1.3, fontWeight: "900" }, levelName: { color: "#AAA7C7", fontSize: 10, letterSpacing: 1.8, fontWeight: "800" }, directionBadge: { borderRadius: 9, borderWidth: 1, borderColor: "#3E7970", backgroundColor: "#112927", paddingHorizontal: 6, paddingVertical: 3 }, directionBadgeText: { color: "#43F3C5", fontSize: 7, letterSpacing: 0.8, fontWeight: "900" }, comboLine: { height: 30, alignItems: "center", justifyContent: "center" }, comboText: { color: "#FFD166", fontSize: 12, fontWeight: "900", letterSpacing: 1.7 }, comboPrompt: { color: "#817C9C", fontSize: 13 }, gameFieldWrap: { flex: 1, alignItems: "center", justifyContent: "center" }, gameInstruction: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 8, paddingVertical: 10 }, instructionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FFD166" }, instructionText: { color: "#AAA7C7", fontSize: 10, letterSpacing: 1.1, fontWeight: "800", textAlign: "center" }, levelFlash: { position: "absolute", alignSelf: "center", top: "36%", alignItems: "center", paddingHorizontal: 18, paddingVertical: 13, borderRadius: 18, backgroundColor: "rgba(9, 11, 26, 0.88)", borderWidth: 1, borderColor: "#FFD166" }, levelFlashTop: { color: "#43F3C5", fontSize: 9, fontWeight: "900", letterSpacing: 1.8 }, levelFlashText: { color: "#FFD166", fontSize: 24, fontWeight: "900", letterSpacing: 1.2, marginTop: 3 }, levelFlashName: { color: "#F4F7FF", fontSize: 10, fontWeight: "800", letterSpacing: 1.6, marginTop: 2 },
  tutorialCard: { alignSelf: "center", maxWidth: 300, paddingHorizontal: 15, paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: "#6B51AD", backgroundColor: "#171330" }, tutorialEyebrow: { color: "#43F3C5", fontSize: 8, fontWeight: "900", letterSpacing: 1.7, textAlign: "center" }, tutorialText: { color: "#F4F7FF", fontSize: 12, lineHeight: 17, fontWeight: "700", textAlign: "center", marginTop: 3 },
  settingsScreen: { flex: 1, padding: 28 }, eyebrow: { color: "#43F3C5", fontSize: 11, fontWeight: "900", letterSpacing: 2.7 }, settingsTitle: { color: "#F4F7FF", fontSize: 40, fontWeight: "800", letterSpacing: -1, marginTop: 8 }, settingsSubtitle: { color: "#AAA7C7", fontSize: 16, lineHeight: 23, marginTop: 10, maxWidth: 280 }, settingsCard: { backgroundColor: "#141733", borderRadius: 22, marginTop: 34, paddingHorizontal: 18, borderWidth: 1, borderColor: "#342F52" }, settingRow: { minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, settingLabel: { color: "#E5E3F4", fontSize: 16, fontWeight: "700" }, divider: { height: 1, backgroundColor: "#302B4B" }, settingsSpacer: { flex: 1 },
  settingsActions: { marginTop: 14, gap: 10 }, settingsActionCard: { minHeight: 75, borderRadius: 17, borderWidth: 1, borderColor: "#38345B", backgroundColor: "#141733", paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, resetActionCard: { minHeight: 75, borderRadius: 17, borderWidth: 1, borderColor: "#694255", backgroundColor: "#21142A", paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, settingsActionTitle: { color: "#F4F7FF", fontSize: 14, fontWeight: "800" }, resetActionTitle: { color: "#FF9BAF", fontSize: 14, fontWeight: "800" }, settingsActionText: { color: "#AAA7C7", fontSize: 10, lineHeight: 15, marginTop: 3, maxWidth: 245 }, settingsActionArrow: { color: "#FFD166", fontSize: 28, fontWeight: "300" },
  legalLinks: { alignSelf: "center", flexDirection: "row", alignItems: "center", marginTop: 12 }, privacyLink: { paddingHorizontal: 14, paddingVertical: 8 }, legalDivider: { width: 1, height: 17, backgroundColor: "#3B365E" }, privacyLinkText: { color: "#AAA7C7", fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
  modalScrim: { flex: 1, backgroundColor: "rgba(3, 4, 12, 0.78)", justifyContent: "flex-end" }, privacySheet: { maxHeight: "88%", minHeight: 480, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 24, backgroundColor: "#11142B", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: "#3D3761" }, privacyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: "#2C2946", paddingBottom: 15 }, privacyKicker: { color: "#43F3C5", fontSize: 9, letterSpacing: 2.1, fontWeight: "900" }, privacyTitle: { color: "#F4F7FF", fontSize: 26, fontWeight: "800", letterSpacing: -0.4, marginTop: 3 }, modalClose: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#24203B", borderWidth: 1, borderColor: "#4A4567" }, modalCloseText: { color: "#F4F7FF", fontSize: 25, lineHeight: 27, fontWeight: "300" }, privacyContent: { paddingVertical: 18, gap: 12 }, privacyDate: { color: "#817C9C", fontSize: 11, fontStyle: "italic", marginBottom: 3 }, privacyHeading: { color: "#43F3C5", fontSize: 13, fontWeight: "900", letterSpacing: 1.1, marginTop: 7 }, privacyParagraph: { color: "#D7D4EC", fontSize: 14, lineHeight: 21 },
  collectionList: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 26 }, collectionTitle: { color: "#F4F7FF", fontSize: 38, letterSpacing: -1, fontWeight: "800", marginTop: 8 }, collectionSubtitle: { color: "#AAA7C7", fontSize: 15, lineHeight: 22, marginTop: 9, maxWidth: 310 }, collectionScore: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderRadius: 18, backgroundColor: "#141733", borderWidth: 1, borderColor: "#342F52", paddingHorizontal: 16, paddingVertical: 14, marginTop: 22 }, collectionScoreLabel: { color: "#AAA7C7", fontSize: 10, letterSpacing: 1.8, fontWeight: "900" }, collectionScoreValue: { color: "#FFD166", fontSize: 28, fontWeight: "900" }, collectionSection: { color: "#817C9C", fontSize: 10, letterSpacing: 2, fontWeight: "900", marginTop: 26, marginBottom: 10 }, themeCard: { minHeight: 78, borderRadius: 18, borderWidth: 1, borderColor: "#342F52", backgroundColor: "#141733", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 10 }, themeCardEquipped: { borderColor: "#43F3C5", backgroundColor: "#152842" }, themeCardLocked: { opacity: 0.52 }, themeSwatch: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" }, themeSwatchInner: { width: 29, height: 29, borderRadius: 15, borderWidth: 3, backgroundColor: "#090B1A" }, themeCopy: { flex: 1, paddingLeft: 11 }, themeName: { color: "#F4F7FF", fontSize: 15, fontWeight: "800" }, themeDescription: { color: "#AAA7C7", fontSize: 11, lineHeight: 16, marginTop: 2 }, themeBadge: { borderRadius: 10, borderWidth: 1, borderColor: "#4B4567", paddingHorizontal: 8, paddingVertical: 5 }, themeBadgeEquipped: { borderColor: "#43F3C5", backgroundColor: "#193E3A" }, themeBadgeText: { color: "#AAA7C7", fontSize: 8, letterSpacing: 1, fontWeight: "900" }, themeBadgeTextEquipped: { color: "#43F3C5" }, collectionFooter: { marginTop: 9 },
  endScreen: { flex: 1, paddingHorizontal: 28, paddingTop: 58, paddingBottom: 24, alignItems: "center" }, endTitle: { color: "#F4F7FF", fontSize: 36, letterSpacing: -0.8, fontWeight: "800", marginTop: 9, textAlign: "center" }, endScoreBubble: { width: 176, height: 176, borderRadius: 88, backgroundColor: "#141733", borderWidth: 2, borderColor: "#8B5CF6", alignItems: "center", justifyContent: "center", marginTop: 44, shadowColor: "#8B5CF6", shadowOpacity: 0.36, shadowRadius: 24, elevation: 7 }, endScore: { color: "#FFD166", fontSize: 54, fontWeight: "900", letterSpacing: 1 }, endScoreLabel: { color: "#AAA7C7", fontSize: 10, fontWeight: "900", letterSpacing: 2.4, marginTop: 1 }, endHint: { color: "#AAA7C7", fontSize: 15, lineHeight: 23, marginTop: 28, textAlign: "center" }, streakCaption: { color: "#43F3C5", fontSize: 10, letterSpacing: 1.6, fontWeight: "900", marginTop: 12 }, streakCalendar: { flexDirection: "row", gap: 9, marginTop: 10 }, calendarDay: { alignItems: "center", gap: 5 }, calendarLabel: { color: "#817C9C", fontSize: 9, fontWeight: "800" }, calendarLabelToday: { color: "#F4F7FF" }, calendarDot: { width: 19, height: 19, borderRadius: 10, backgroundColor: "#2C2844", borderWidth: 1, borderColor: "#3F395C", alignItems: "center", justifyContent: "center" }, calendarDotComplete: { backgroundColor: "#43F3C5", borderColor: "#43F3C5" }, calendarDotToday: { borderColor: "#FFD166" }, calendarTick: { color: "#09211F", fontSize: 11, fontWeight: "900" }, endActions: { width: "100%", gap: 12, marginTop: "auto" },
  pauseScreen: { flex: 1, paddingHorizontal: 28, paddingTop: 58, paddingBottom: 24, alignItems: "center" }, pauseScorePanel: { width: "100%", marginTop: 52, paddingVertical: 27, backgroundColor: "#141733", borderRadius: 22, borderWidth: 1, borderColor: "#342F52", alignItems: "center" }, pauseScoreLabel: { color: "#AAA7C7", fontSize: 10, letterSpacing: 2.3, fontWeight: "900" }, pauseScore: { color: "#FFD166", fontSize: 44, fontWeight: "900", marginTop: 5 },
});
