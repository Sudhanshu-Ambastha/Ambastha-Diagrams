/**
 * spacing.js
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

export const spacingThemes = {
  compact: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,

    nodeGap: 30,
    layerGap: 50,
    diagramPadding: 20,
  },

  standard: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 40,

    nodeGap: 50,
    layerGap: 80,
    diagramPadding: 40,
  },

  spacious: {
    xs: 6,
    sm: 12,
    md: 18,
    lg: 30,
    xl: 60,

    nodeGap: 80,
    layerGap: 120,
    diagramPadding: 80,
  },
};

export const spacing = spacingThemes;
