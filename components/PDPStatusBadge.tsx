import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  status: string;
};

type BadgeStyle = {
  color: string;
  backgroundColor: string;
  borderColor: string;
};

function normalizeStatus(input: string) {
  return input.replace(/\s+/g, " ").trim().toUpperCase();
}

function getBadgeStyle(status: string): BadgeStyle {
  const s = normalizeStatus(status);

  if (s === "COMPLETE") {
    return { color: "#5cb85c", backgroundColor: "rgba(92,184,92,0.15)", borderColor: "rgba(92,184,92,0.3)" };
  }

  if (s.startsWith("DOCS SUBMITTED")) {
    return { color: "#3ecfcf", backgroundColor: "rgba(62,207,207,0.1)", borderColor: "rgba(62,207,207,0.25)" };
  }

  if (s.startsWith("ON HOLD")) {
    return { color: "#3ecfcf", backgroundColor: "rgba(62,207,207,0.1)", borderColor: "rgba(62,207,207,0.25)" };
  }

  if (s.startsWith("BLOCKED")) {
    return { color: "#e05a5a", backgroundColor: "rgba(224,90,90,0.1)", borderColor: "rgba(224,90,90,0.25)" };
  }

  if (s.startsWith("FLAGGED")) {
    return { color: "#f0a500", backgroundColor: "rgba(240,165,0,0.1)", borderColor: "rgba(240,165,0,0.25)" };
  }

  if (s.startsWith("IN PROGRESS")) {
    return { color: "#f0a500", backgroundColor: "rgba(240,165,0,0.1)", borderColor: "rgba(240,165,0,0.25)" };
  }

  return { color: "#3ecfcf", backgroundColor: "rgba(62,207,207,0.1)", borderColor: "rgba(62,207,207,0.25)" };
}

export default function PDPStatusBadge({ status }: Props) {
  const styles = useMemo(() => createStyles(getBadgeStyle(status)), [status]);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{normalizeStatus(status)}</Text>
    </View>
  );
}

function createStyles(st: BadgeStyle) {
  return StyleSheet.create({
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 100,
      borderWidth: 1,
      backgroundColor: st.backgroundColor,
      borderColor: st.borderColor,
      alignSelf: "flex-start",
    },
    text: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: st.color,
    },
  });
}

