/**
 * colors.js
 * Description: Part of the Sovereign Diagram Engine core logic.
 *
 * Copyright 2026 Sudhanshu Ambastha
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const colorThemes = {
  StandardBlue: {
    background: "#ffffff",

    primaryFill: "#61c1ed",
    primaryStroke: "#000000",

    secondaryFill: "#ffffff",
    secondaryStroke: "#000000",

    text: "#000000",

    critical: "#ff4d4d",
    success: "#32cd32",
    warning: "#ffcc00",

    connector: "#000000",
    dashedConnector: "#444444",
  },

  corporateBlue: {
    background: "#ffffff",

    primaryFill: "#dbeafe",
    primaryStroke: "#1e3a8a",

    secondaryFill: "#eff6ff",
    secondaryStroke: "#2563eb",

    text: "#111827",

    critical: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",

    connector: "#1f2937",
    dashedConnector: "#4b5563",
  },

  softGray: {
    background: "#ffffff",

    primaryFill: "#e5e7eb",
    primaryStroke: "#374151",

    secondaryFill: "#f3f4f6",
    secondaryStroke: "#6b7280",

    text: "#111827",

    critical: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",

    connector: "#374151",
    dashedConnector: "#6b7280",
  },

  modernSaaS: {
    background: "#f8fafc",

    primaryFill: "#c4b5fd",
    primaryStroke: "#6d28d9",

    secondaryFill: "#ede9fe",
    secondaryStroke: "#8b5cf6",

    text: "#1e1b4b",

    critical: "#e11d48",
    success: "#059669",
    warning: "#d97706",

    connector: "#312e81",
    dashedConnector: "#6366f1",
  },

  blueprint: {
    background: "#0f172a",

    primaryFill: "#1e3a8a",
    primaryStroke: "#93c5fd",

    secondaryFill: "#172554",
    secondaryStroke: "#bfdbfe",

    text: "#e0f2fe",

    critical: "#f87171",
    success: "#4ade80",
    warning: "#facc15",

    connector: "#e0f2fe",
    dashedConnector: "#93c5fd",
  },

  dark: {
    background: "#111827",

    primaryFill: "#1f2937",
    primaryStroke: "#f9fafb",

    secondaryFill: "#374151",
    secondaryStroke: "#d1d5db",

    text: "#f9fafb",

    critical: "#ef4444",
    success: "#22c55e",
    warning: "#facc15",

    connector: "#f9fafb",
    dashedConnector: "#9ca3af",
  },

  monochrome: {
    background: "#ffffff",

    primaryFill: "#ffffff",
    primaryStroke: "#000000",

    secondaryFill: "#f5f5f5",
    secondaryStroke: "#222222",

    text: "#000000",

    critical: "#000000",
    success: "#000000",
    warning: "#000000",

    connector: "#000000",
    dashedConnector: "#444444",
  },

  pastel: {
    background: "#ffffff",

    primaryFill: "#bae6fd",
    primaryStroke: "#0369a1",

    secondaryFill: "#fbcfe8",
    secondaryStroke: "#be185d",

    text: "#1f2937",

    critical: "#fb7185",
    success: "#4ade80",
    warning: "#fbbf24",

    connector: "#475569",
    dashedConnector: "#64748b",
  },
};

export const colors = colorThemes;
