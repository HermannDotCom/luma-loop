import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { AdConsentPreference } from "@/lib/game/types";

type ConsentModalProps = {
  visible: boolean;
  value: AdConsentPreference;
  onChoose: (value: AdConsentPreference) => void;
  onClose: () => void;
};

type ResetModalProps = {
  visible: boolean;
  step: "warning" | "confirm";
  onClose: () => void;
  onContinue: () => void;
  onReset: () => void;
};

function ModalButton({ label, onPress, subtle = false, danger = false }: { label: string; onPress: () => void; subtle?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.button, subtle && styles.buttonSubtle, danger && styles.buttonDanger, pressed && styles.pressed]}><Text style={[styles.buttonText, subtle && styles.buttonTextSubtle, danger && styles.buttonTextDanger]}>{label}</Text></Pressable>;
}

function Sheet({ children, visible, onClose }: { children: React.ReactNode; visible: boolean; onClose: () => void }) {
  return <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent><View style={styles.scrim}><View style={styles.sheet}>{children}</View></View></Modal>;
}

export function AdConsentModal({ visible, value, onChoose, onClose }: ConsentModalProps) {
  const choose = (next: AdConsentPreference) => { onChoose(next); onClose(); };
  return <Sheet visible={visible} onClose={onClose}>
    <View style={styles.header}><View><Text style={styles.kicker}>PRÉFÉRENCES</Text><Text style={styles.title}>Publicité future</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.paragraph}>Aucune publicité n’est diffusée et aucun SDK publicitaire n’est présent dans cette version de Luma Loop.</Text>
      <Text style={styles.paragraph}>Vous pouvez néanmoins enregistrer votre préférence pour une éventuelle version financée par publicité. Ce choix reste local à cet appareil et pourra être modifié à tout moment.</Text>
      <Text style={styles.note}>Lorsqu’un réseau publicitaire réel sera intégré, son formulaire légal et, sur iOS, toute autorisation système applicable seront toujours demandés séparément.</Text>
    </ScrollView>
    <View style={styles.actions}>
      <ModalButton label={value === "ask_later" ? "ME LE DEMANDER PLUS TARD · ACTIF" : "ME LE DEMANDER PLUS TARD"} onPress={() => choose("ask_later")} subtle />
      <ModalButton label={value === "non_personalized" ? "ANNONCES NON PERSONNALISÉES · ACTIF" : "ANNONCES NON PERSONNALISÉES"} onPress={() => choose("non_personalized")} subtle />
      <ModalButton label={value === "personalized" ? "ACCEPTER LA PERSONNALISATION · ACTIF" : "ACCEPTER LA PERSONNALISATION"} onPress={() => choose("personalized")} />
    </View>
  </Sheet>;
}

export function ResetDataModal({ visible, step, onClose, onContinue, onReset }: ResetModalProps) {
  const finalStep = step === "confirm";
  return <Sheet visible={visible} onClose={onClose}>
    <View style={styles.header}><View><Text style={styles.kicker}>DONNÉES LOCALES</Text><Text style={styles.title}>{finalStep ? "Dernière confirmation" : "Réinitialiser"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Annuler" onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
    <View style={styles.content}>
      <Text style={styles.paragraph}>{finalStep ? "Cette action efface maintenant votre meilleur score, vos thèmes, vos défis, vos succès, vos statistiques et vos préférences enregistrées sur cet appareil." : "Vous êtes sur le point d’effacer les données enregistrées uniquement sur cet appareil. L’application reviendra à son état de première ouverture."}</Text>
      <Text style={styles.note}>{finalStep ? "Cette opération ne peut pas être annulée." : "Vos données ne sont pas envoyées à un serveur."}</Text>
    </View>
    <View style={styles.actions}>{finalStep ? <ModalButton label="EFFACER MES DONNÉES" onPress={onReset} danger /> : <ModalButton label="CONTINUER" onPress={onContinue} danger />}<ModalButton label="ANNULER" onPress={onClose} subtle /></View>
  </Sheet>;
}

export function LegalNoticeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return <Sheet visible={visible} onClose={onClose}>
    <View style={styles.header}><View><Text style={styles.kicker}>LUMA LOOP</Text><Text style={styles.title}>Mentions légales</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fermer les mentions légales" onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.paragraph}>Luma Loop est édité par FLASH DIGITAL, société par actions simplifiée au capital social de 5 000 euros.</Text>
      <Text style={styles.note}>Siège social : 277 rue Erik Satie, 45770 Saran, France.</Text>
      <Text style={styles.paragraph}>Immatriculée au Registre du commerce et des sociétés d’Orléans sous le numéro 103 716 346. SIRET du siège : 103 716 346 00012. TVA intracommunautaire : FR16 103716346. Code APE : 6201Z — programmation informatique.</Text>
      <Text style={styles.paragraph}>Président et directeur de la publication : N’GUESSAN Kouassi Hermann Guy Elysé.</Text>
      <Text style={styles.paragraph}>L’activité déclarée comprend notamment la conception, le développement, l’édition et l’exploitation de logiciels, applications web et mobiles et plateformes numériques.</Text>
      <Text style={styles.note}>Pour toute demande relative à l’application, utilisez le canal de support indiqué sur sa fiche de store. La présente information est fournie à titre d’identification de l’éditeur.</Text>
    </ScrollView>
    <View style={styles.actions}><ModalButton label="FERMER" onPress={onClose} /></View>
  </Sheet>;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(3, 4, 12, 0.78)", justifyContent: "flex-end" }, sheet: { maxHeight: "88%", minHeight: 400, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 24, backgroundColor: "#11142B", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: "#3D3761" }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: "#2C2946", paddingBottom: 15 }, kicker: { color: "#43F3C5", fontSize: 9, letterSpacing: 2.1, fontWeight: "900" }, title: { color: "#F4F7FF", fontSize: 26, fontWeight: "800", letterSpacing: -0.4, marginTop: 3 }, close: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#24203B", borderWidth: 1, borderColor: "#4A4567" }, closeText: { color: "#F4F7FF", fontSize: 25, lineHeight: 27, fontWeight: "300" }, content: { flexGrow: 1, paddingVertical: 18, gap: 14 }, paragraph: { color: "#D7D4EC", fontSize: 14, lineHeight: 21 }, note: { color: "#AAA7C7", fontSize: 12, lineHeight: 18, borderLeftWidth: 2, borderLeftColor: "#8B5CF6", paddingLeft: 10 }, actions: { gap: 9 }, button: { width: "100%", minHeight: 54, borderRadius: 27, backgroundColor: "#43F3C5", justifyContent: "center", alignItems: "center", paddingHorizontal: 14 }, buttonSubtle: { backgroundColor: "#1A1D3C", borderWidth: 1, borderColor: "#3B365E" }, buttonDanger: { backgroundColor: "#FF6B8A" }, buttonText: { color: "#09211F", fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textAlign: "center" }, buttonTextSubtle: { color: "#D7D4EC" }, buttonTextDanger: { color: "#2B0711" }, pressed: { opacity: 0.85, transform: [{ scale: 0.975 }] },
});
