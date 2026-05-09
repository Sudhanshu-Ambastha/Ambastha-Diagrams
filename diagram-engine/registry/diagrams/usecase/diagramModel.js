/**
 * diagramModel.js
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

export class DiagramModel {

  constructor(title = "System") {
    this.title = title;
    this.actors = {};
    this.system = null;
    this.externalSystems = {};
    this.usecases = {};
    this.connections = [];
  }

  addActor(alias, label) {
    this.actors[alias] = label || alias;
  }

  setSystem(label) {
    this.system = label;
  }

  addExternalSystem(alias, label) {
    this.externalSystems[alias] = label || alias;
  }

  addUseCase(alias, label) {
    this.usecases[alias] = label || alias;
  }

  addConnection(from, type, to) {
    this.connections.push({
      from: from.trim(),
      type,
      to: to.trim()
    });
  }

  inferUseCases() {

    const entities = new Set();

    this.connections.forEach(conn => {
      entities.add(conn.from);
      entities.add(conn.to);
    });

    entities.forEach(entity => {

      const isActor = this.actors.hasOwnProperty(entity);
      const isExternal = this.externalSystems.hasOwnProperty(entity);
      const isUsecase = this.usecases.hasOwnProperty(entity);

      if (!isActor && !isExternal && !isUsecase) {
        this.addUseCase(entity, entity);
      }
    });
  }
}