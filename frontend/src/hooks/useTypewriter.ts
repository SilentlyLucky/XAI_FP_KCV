"use client";

import { useState, useCallback, useRef } from "react";

interface TypewriterState {
  sections: Record<string, string>;
  currentSection: string;
  isDone: boolean;
  meta: {
    is_ground_truth: boolean;
    rouge1: number | null;
    bert_score_f1: number | null;
  } | null;
}

export function useTypewriter() {
  const [state, setState] = useState<TypewriterState>({
    sections: {},
    currentSection: "",
    isDone: false,
    meta: null,
  });

  const currentSectionRef = useRef("");

  const reset = useCallback(() => {
    currentSectionRef.current = "";
    setState({
      sections: {},
      currentSection: "",
      isDone: false,
      meta: null,
    });
  }, []);

  const onMeta = useCallback(
    (meta: { is_ground_truth: boolean; rouge1: number | null; bert_score_f1: number | null }) => {
      setState((prev) => ({ ...prev, meta }));
    },
    []
  );

  const onSection = useCallback((section: string) => {
    currentSectionRef.current = section;
    setState((prev) => ({
      ...prev,
      currentSection: section,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section] || "",
      },
    }));
  }, []);

  const onToken = useCallback((token: string) => {
    const section = currentSectionRef.current;
    if (!section) return;

    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: (prev.sections[section] || "") + token,
      },
    }));
  }, []);

  const onDone = useCallback(() => {
    setState((prev) => ({ ...prev, isDone: true }));
  }, []);

  return {
    ...state,
    reset,
    onMeta,
    onSection,
    onToken,
    onDone,
  };
}
