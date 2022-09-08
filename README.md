<h1 align="center">
  Divine Binary Object
</h1>

<p align="center">
<img src="https://divinestarapparel.com/wp-content/uploads/2021/02/logo-small.png"/>
</p>

---

```ts
import { DBO } from "../out/DivineBinaryObject.js";
import type { DBOScehema } from "../out/Meta/Schema.types.js";
import * as crypto from "crypto";

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
const basicArray: DBOScehema = {
  header: {
    type: "8-bit-uint",
    value: 10,
  },
  position: {
    type: "fixed-length-typed-list",
    listType: "32-bit-float",
    length: 3,
    value: [45.2, 45.3, 45.4],
  },
};

const uuid = crypto.randomUUID();
const basicUUID: DBOScehema = {
  header: {
    type: "8-bit-uint",
    value: 10,
  },
  position: {
    type: "fixed-length-string",
    length: uuid.length,
    value: uuid,
  },
};

DBO.registerSchema("basic", basicSchema);
DBO.registerSchema("basicArray", basicArray);
DBO.registerSchema("basicUUID", basicUUID);

const t1 = () => {
  const buffer = DBO.createBuffer("basic");
  console.log(buffer);
  const result = DBO.createObject("basic", buffer);
  console.log(result);
};
const t2 = () => {
  const buffer = DBO.createBuffer("basicArray");
  console.log(buffer);
  const result = DBO.createObject("basicArray", buffer);
  console.log(result);
};
const t3 = () => {
  console.log(uuid);
  const buffer = DBO.createBuffer("basicUUID");
  console.log(buffer);
  const result = DBO.createObject("basicUUID", buffer);
  console.log(result);
};
t1();
t2();
t3();
```

The result is:

```console
ArrayBuffer {
  [Uint8Contents]: <0a 42 34 cc cd 42 35 33 33 42 35 99 9a>,
  byteLength: 13
}
{
  header: 10,
  positionX: 45.20000076293945,
  positionY: 45.29999923706055,
  positionZ: 45.400001525878906
}
ArrayBuffer {
  [Uint8Contents]: <0a 42 34 cc cd 42 35 33 33 42 35 99 9a>,
  byteLength: 13
}
{
  header: 10,
  position: [ 45.20000076293945, 45.29999923706055, 45.400001525878906 ]     
}
f0f18d89-688a-484a-8911-7f36c9905a69
ArrayBuffer {
  [Uint8Contents]: <0a 00 66 00 30 00 66 00 31 00 38 00 64 00 38 00 39 00 2d 
00 36 00 38 00 38 00 61 00 2d 00 34 00 38 00 34 00 61 00 2d 00 38 00 39 00 31 00 31 00 2d 00 37 00 66 00 33 00 36 00 63 00 39 00 39 00 30 00 35 00 61 00 36 00 39 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
00 00 00 00 ... 45 more bytes>,
  byteLength: 145
}
{ header: 10, position: 'f0f18d89-688a-484a-8911-7f36c9905a69' }
```
