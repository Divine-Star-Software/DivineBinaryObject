import { DBO } from "../out/DivineBinaryObject.js";
import type { DBOScehema } from "../out/Meta/Schema.types.js";

const basicSchema: DBOScehema = {
  header: {
    type: "8-bit-uint",
    value: 10,
  },
  positionX: {
    type: "32-bit-float",
    value: 45.2,
  },
  positionY: {
    type: "32-bit-float",
    value: 45.3,
  },
  positionZ: {
    type: "32-bit-float",
    value: 45.4,
  },
};

DBO.registerSchema("basic", basicSchema);

const buffer = DBO.createBuffer("basic");
console.log(buffer);
const result = DBO.createObject("basic", buffer);
console.log(result);
