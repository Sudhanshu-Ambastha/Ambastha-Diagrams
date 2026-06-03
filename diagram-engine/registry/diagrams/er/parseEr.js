const CARD_MAP = {
  1: { inner: "one", outer: "one" },
  "01": { inner: "one", outer: "zero" }, // Added for 0 or 1
  "0..1": { inner: "one", outer: "zero" },
  "1..n": { inner: "many_bar", outer: "one" },
  "0..n": { inner: "many", outer: "zero" },
  n: { inner: "many", outer: "one" },
  "": { inner: "one", outer: "one" },
  "-": { inner: "many", outer: "one" },
};

function parseCard(raw) {
  const key = raw.trim();
  return CARD_MAP[key] || { inner: "one", outer: "one" };
}

export function parseERD(source) {
  const db = { entities: {}, relations: [], entityOrder: [] };
  const lines = source.split(/\r?\n/).slice(1);
  let currentEntity = null;

  const ensureEntity = (name) => {
    if (!db.entities[name]) {
      db.entities[name] = { name, attrs: [] };
      db.entityOrder.push(name);
    }
    return db.entities[name];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;

    if (line === "}") {
      currentEntity = null;
    } else if (currentEntity) {
      handleAttribute(currentEntity, line);
    } else if (line.startsWith("entity ")) {
      currentEntity = handleEntityDeclaration(line, ensureEntity);
    } else {
      handleRelationship(line, ensureEntity, db);
    }
  }
  return db;
}

function handleAttribute(entity, line) {
  const am = line.match(/^([+\-*#~])\s*(\w+)(?:\s*:\s*(.+))?$/);
  if (!am) return;
  const typeRaw = (am[3] || "").trim();
  entity.attrs.push({
    vis: am[1],
    name: am[2],
    type: typeRaw.replace(/\b(PK|FK)\b/gi, "").trim(),
    pk: /\bPK\b/i.test(typeRaw) || am[1] === "*",
    fk: /\bFK\b/i.test(typeRaw) || am[1] === "~",
  });
}

function handleEntityDeclaration(line, ensureEntity) {
  const name = line
    .replace(/^entity\s+/i, "")
    .replace(/\{$/, "")
    .trim();
  const entity = ensureEntity(name);
  return line.endsWith("{") ? entity : null;
}

function handleRelationship(line, ensureEntity, db) {
  const relRe =
    /^(\w[\w\s]*?)\s*\{([^}]*)\}(-\.?)((?:[^{])*?)(-\.?)?\{([^}]*)\}\s+(\w[\w\s]*?)$/;
  const rm = line.match(relRe);
  if (!rm) return;

  const midLabel = rm[4].trim();
  const isDiamond = midLabel.toLowerCase().includes("(diamond)");
  const label = midLabel
    .replace(/\(diamond\)/gi, "")
    .replace(/^-+|-+$/g, "")
    .trim();

  ensureEntity(rm[1].trim());
  ensureEntity(rm[7].trim());

  db.relations.push({
    from: rm[1].trim(),
    cardFrom: parseCard(rm[2]),
    label,
    isDiamond,
    dashed: rm[3].includes(".") || (rm[5] || "").includes("."),
    cardTo: parseCard(rm[6]),
    to: rm[7].trim(),
  });
}
