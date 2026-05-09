/**
 * typography.js
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

export const typographyThemes = {
  enterprise: {
    fontFamily: "Helvetica, Arial, sans-serif",

    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 18,
      xl: 24,
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },

    lineHeight: 1.4,
  },

  technical: {
    fontFamily: "Consolas, Monaco, monospace",

    sizes: {
      xs: 10,
      sm: 12,
      md: 13,
      lg: 16,
      xl: 20,
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },

    lineHeight: 1.3,
  },

  modern: {
    fontFamily: "Inter, Segoe UI, sans-serif",

    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 20,
      xl: 28,
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },

    lineHeight: 1.5,
  },

  presentation: {
    fontFamily: "Poppins, Verdana, sans-serif",

    sizes: {
      xs: 12,
      sm: 14,
      md: 18,
      lg: 24,
      xl: 36,
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 800,
    },

    lineHeight: 1.6,
  },
};

export const typography = typographyThemes;
