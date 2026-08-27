import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

import { createInitialState, getDifficulty, normalizeAngle, resolveTap } from "@/lib/game/engine";
import { gameHaptics } from "@/lib/game/haptics";
import { DEFAULT_PROFILE, loadProfile, saveProfile } from "@/lib/game/profile";
import type { GameState, PlayerProfile, RunStatus } from "@/lib/game/types";

const AMBIENT_AUDIO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663253463242/vrBHtdJuieNHcUuN.mp3";

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
  const ambientPlayer = useAudioPlayer(AMBIENT_AUDIO_URL);
  const [status, setStatus] = useState<RunStatus>("home");
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [game, setGame] = useState<GameState>(() => createInitialState(Date.now() % 997));
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [playfieldSize, setPlayfieldSize] = useState(320);
  const [burst, setBurst] = useState<Burst>("idle");
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
    void loadProfile().then(setProfile);
  }, []);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
    ambientPlayer.volume = 0.14;
    ambientPlayer.loop = true;
  }, [ambientPlayer]);

  useEffect(() => {
    if (status === "playing" && profile.soundEnabled) {
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
    if (status !== "playing") {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      timestampRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const previous = timestampRef.current ?? timestamp;
      const delta = Math.min(42, timestamp - previous) / 1000;
      timestampRef.current = timestamp;
      orbitAngleRef.current = normalizeAngle(
        orbitAngleRef.current + getDifficulty(gameRef.current.score).radiansPerSecond * delta,
      );
      setOrbitAngle(orbitAngleRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [status]);

  const updateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      void saveProfile(next);
      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    gameHaptics.tap(profileRef.current.hapticsEnabled);
    orbitAngleRef.current = 0;
    setOrbitAngle(0);
    setBurst("idle");
    setGame(createInitialState(Date.now() % 997));
    setStatus("playing");
  }, []);

  const handleTap = useCallback(() => {
    if (status !== "playing") return;
    const outcome = resolveTap(gameRef.current, orbitAngleRef.current);
    setGame(outcome.state);
    setBurst(outcome.hit ? "hit" : "miss");
    if (outcome.hit) {
      gameHaptics.hit(profileRef.current.hapticsEnabled);
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

  const difficulty = getDifficulty(game.score);
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
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={gateScreenRadius} fill="none" stroke="#473D72" strokeOpacity="0.65" strokeWidth="2" />
          <Path d={gatePath} fill="none" stroke="#FFD166" strokeWidth="11" strokeLinecap="round" />
          <Path d={gatePath} fill="none" stroke="#FFF2B7" strokeWidth="3" strokeLinecap="round" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.16} fill="#111431" stroke="#8B5CF6" strokeWidth="2" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.12} fill="url(#core)" />
          <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.055} fill="#F4F7FF" fillOpacity="0.96" />
          {burst === "hit" && <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.27} fill="none" stroke="#43F3C5" strokeOpacity="0.8" strokeWidth="2" />}
          {burst === "miss" && <Circle cx={playfieldSize / 2} cy={playfieldSize / 2} r={playfieldSize * 0.24} fill="none" stroke="#FF6B8A" strokeOpacity="0.7" strokeWidth="3" />}
          <G>
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius} r={18} fill="#43F3C5" fillOpacity="0.12" />
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius} r={9} fill="#43F3C5" fillOpacity="0.32" />
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius} r={5} fill="#F4F7FF" />
            <Circle cx={playfieldSize / 2 + Math.cos(orbitAngle) * gateScreenRadius - 1.8} cy={playfieldSize / 2 + Math.sin(orbitAngle) * gateScreenRadius - 1.8} r={2.4} fill="#43F3C5" />
          </G>
        </Svg>
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
          </View>
          <View style={styles.homeOrbitalPreview}>{playfield}</View>
          <View style={styles.homeFooter}>
            <Text style={styles.bestCaption}>MEILLEUR ÉLAN</Text>
            <Text style={styles.bestScore}>{scoreLabel(profile.bestScore)}</Text>
            <PrimaryButton label="JOUER" onPress={startGame} />
            <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les réglages" onPress={() => setStatus("settings")} style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}>
              <Text style={styles.settingsText}>Réglages</Text>
            </Pressable>
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
          </View>
          <View style={styles.settingsSpacer} />
          <PrimaryButton label="RETOUR" onPress={() => setStatus("home")} secondary />
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
          <View><Text style={styles.hudLabel}>ÉLAN</Text><Text style={styles.hudScore}>{scoreLabel(game.score)}</Text></View>
          <View style={styles.lives}>{[0, 1, 2].map((item) => <MiniPetal key={item} active={item < game.lives} />)}</View>
          <Pressable accessibilityRole="button" accessibilityLabel="Mettre la partie en pause" onPress={() => setStatus("paused")} style={({ pressed }) => [styles.pauseButton, pressed && styles.settingsPressed]}><View style={styles.pauseBars}><View style={styles.pauseBar}/><View style={styles.pauseBar}/></View></Pressable>
        </View>
        <View style={styles.comboLine}>{game.combo > 1 ? <Text style={styles.comboText}>SÉRIE × {game.combo}</Text> : <Text style={styles.comboPrompt}>La porte est votre rythme.</Text>}</View>
        <View style={styles.gameFieldWrap}>{playfield}</View>
        <View style={styles.gameInstruction}><View style={styles.instructionDot}/><Text style={styles.instructionText}>TOUCHEZ AU PASSAGE DANS L’ARC AMBRE</Text></View>
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
  homeOrbitalPreview: { flex: 1, justifyContent: "center", width: "100%" }, homeFooter: { width: "100%", alignItems: "center" }, bestCaption: { color: "#8C88A9", fontSize: 10, letterSpacing: 2.4, fontWeight: "800" }, bestScore: { color: "#FFD166", fontSize: 30, fontWeight: "800", letterSpacing: 1, marginTop: 3, marginBottom: 14 },
  playfieldTouch: { alignSelf: "center", borderRadius: 180 }, playfieldPressed: { transform: [{ scale: 0.985 }] }, playfield: { alignItems: "center", justifyContent: "center", borderRadius: 180, backgroundColor: "#0D1030", borderWidth: 1, borderColor: "#342A58", shadowColor: "#8B5CF6", shadowOpacity: 0.25, shadowRadius: 22, elevation: 6, overflow: "hidden" }, playfieldContrast: { borderWidth: 3, borderColor: "#F4F7FF" },
  primaryButton: { width: "100%", minHeight: 58, borderRadius: 29, justifyContent: "center", alignItems: "center", backgroundColor: "#43F3C5", shadowColor: "#43F3C5", shadowOpacity: 0.36, shadowRadius: 14, elevation: 5 }, primaryButtonText: { color: "#09211F", fontSize: 15, fontWeight: "900", letterSpacing: 2.3 }, secondaryButton: { backgroundColor: "#1A1D3C", borderWidth: 1, borderColor: "#3B365E", shadowOpacity: 0 }, secondaryButtonText: { color: "#D7D4EC" }, buttonPressed: { opacity: 0.88, transform: [{ scale: 0.975 }] }, settingsButton: { paddingVertical: 16, paddingHorizontal: 24, marginTop: 3 }, settingsText: { color: "#AAA7C7", fontSize: 14, fontWeight: "700" }, settingsPressed: { opacity: 0.6 },
  gameScreen: { flex: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 }, gameHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 60 }, hudLabel: { color: "#8C88A9", fontSize: 10, letterSpacing: 2, fontWeight: "800" }, hudScore: { color: "#F4F7FF", fontSize: 29, lineHeight: 32, fontWeight: "800", letterSpacing: 1 }, lives: { flexDirection: "row", gap: 7, alignItems: "center" }, petal: { width: 15, height: 20, borderRadius: 12, transform: [{ rotate: "35deg" }] }, petalActive: { backgroundColor: "#FF6B8A", shadowColor: "#FF6B8A", shadowOpacity: 0.8, shadowRadius: 5 }, petalLost: { backgroundColor: "#302A46" }, pauseButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: "#3B365E", backgroundColor: "#141733", alignItems: "center", justifyContent: "center" }, pauseBars: { flexDirection: "row", gap: 5 }, pauseBar: { width: 4, height: 15, borderRadius: 2, backgroundColor: "#D7D4EC" },
  comboLine: { height: 34, alignItems: "center", justifyContent: "center" }, comboText: { color: "#FFD166", fontSize: 12, fontWeight: "900", letterSpacing: 1.7 }, comboPrompt: { color: "#817C9C", fontSize: 13 }, gameFieldWrap: { flex: 1, alignItems: "center", justifyContent: "center" }, gameInstruction: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 8, paddingVertical: 10 }, instructionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FFD166" }, instructionText: { color: "#AAA7C7", fontSize: 10, letterSpacing: 1.1, fontWeight: "800", textAlign: "center" },
  settingsScreen: { flex: 1, padding: 28 }, eyebrow: { color: "#43F3C5", fontSize: 11, fontWeight: "900", letterSpacing: 2.7 }, settingsTitle: { color: "#F4F7FF", fontSize: 40, fontWeight: "800", letterSpacing: -1, marginTop: 8 }, settingsSubtitle: { color: "#AAA7C7", fontSize: 16, lineHeight: 23, marginTop: 10, maxWidth: 280 }, settingsCard: { backgroundColor: "#141733", borderRadius: 22, marginTop: 34, paddingHorizontal: 18, borderWidth: 1, borderColor: "#342F52" }, settingRow: { minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, settingLabel: { color: "#E5E3F4", fontSize: 16, fontWeight: "700" }, divider: { height: 1, backgroundColor: "#302B4B" }, settingsSpacer: { flex: 1 },
  endScreen: { flex: 1, paddingHorizontal: 28, paddingTop: 58, paddingBottom: 24, alignItems: "center" }, endTitle: { color: "#F4F7FF", fontSize: 36, letterSpacing: -0.8, fontWeight: "800", marginTop: 9, textAlign: "center" }, endScoreBubble: { width: 176, height: 176, borderRadius: 88, backgroundColor: "#141733", borderWidth: 2, borderColor: "#8B5CF6", alignItems: "center", justifyContent: "center", marginTop: 44, shadowColor: "#8B5CF6", shadowOpacity: 0.36, shadowRadius: 24, elevation: 7 }, endScore: { color: "#FFD166", fontSize: 54, fontWeight: "900", letterSpacing: 1 }, endScoreLabel: { color: "#AAA7C7", fontSize: 10, fontWeight: "900", letterSpacing: 2.4, marginTop: 1 }, endHint: { color: "#AAA7C7", fontSize: 15, lineHeight: 23, marginTop: 28, textAlign: "center" }, endActions: { width: "100%", gap: 12, marginTop: "auto" },
  pauseScreen: { flex: 1, paddingHorizontal: 28, paddingTop: 58, paddingBottom: 24, alignItems: "center" }, pauseScorePanel: { width: "100%", marginTop: 52, paddingVertical: 27, backgroundColor: "#141733", borderRadius: 22, borderWidth: 1, borderColor: "#342F52", alignItems: "center" }, pauseScoreLabel: { color: "#AAA7C7", fontSize: 10, letterSpacing: 2.3, fontWeight: "900" }, pauseScore: { color: "#FFD166", fontSize: 44, fontWeight: "900", marginTop: 5 },
});
