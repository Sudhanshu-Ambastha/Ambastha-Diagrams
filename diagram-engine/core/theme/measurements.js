/**
 * measurements.js
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

export const measurementThemes = {
  compact: {
    actor: {
      headRadius: 5,
      armWidth: 12,
      bodyHeight: 20,
    },

    usecase: {
      rx: 60,
      ry: 22,
    },

    note: {
      width: 90,
      height: 55,
      fold: 18,
    },

    cpm: {
      width: 100,
      rowHeight: 25,
    },

    eventNode: {
      radius: 24,
    },

    connector: {
      curveOffset: 40,
      strokeWidth: 1.2,
    },
  },

  standard: {
    actor: {
      headRadius: 6,
      armWidth: 15,
      bodyHeight: 24,
    },

    usecase: {
      rx: 70,
      ry: 25,
    },

    note: {
      width: 100,
      height: 60,
      fold: 20,
    },

    cpm: {
      width: 120,
      rowHeight: 30,
    },

    eventNode: {
      radius: 30,
    },

    connector: {
      curveOffset: 60,
      strokeWidth: 1.5,
    },
  },

  presentation: {
    actor: {
      headRadius: 10,
      armWidth: 20,
      bodyHeight: 32,
    },

    usecase: {
      rx: 90,
      ry: 35,
    },

    note: {
      width: 140,
      height: 80,
      fold: 24,
    },

    cpm: {
      width: 160,
      rowHeight: 40,
    },

    eventNode: {
      radius: 40,
    },

    connector: {
      curveOffset: 80,
      strokeWidth: 2,
    },
  },
};

export const measurements = measurementThemes;
