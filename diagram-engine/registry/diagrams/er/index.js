import { parseERD } from "./parseEr.js";
import { layoutERD } from "./layoutEr.js";
import { renderERD } from "./rendererEr.js";

export default {
  name: "ERDiagram",
  parse: parseERD,
  layout: layoutERD,
  render: renderERD,
};
