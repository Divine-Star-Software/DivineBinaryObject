import {
  DBOScehema,
  DBOScehemaPrimitiveElementTypes,
  DBOScehemaAdvancedElementTypes,
  DBOScehemaElement,
} from "Meta/Schema.types";

export const DBO = {
  schemas: <
    Record<
      string,
      {
        length: number;
        schema: DBOScehema;
      }
    >
  >{},

  elementByteCounts: <
    Record<Exclude<DBOScehemaPrimitiveElementTypes, "list" | "string">, number>
  >{
    "8-bit-int": 1,
    "8-bit-uint": 1,
    "16-bit-int": 2,
    "16-bit-uint": 2,
    "32-bit-int": 4,
    "32-bit-uint": 4,
    "32-bit-float": 4,
    "big-int": 8,
    "big-uint": 8,
  },

  elementGetFunctions: <
    Record<
      Exclude<DBOScehemaPrimitiveElementTypes, "list" | "string">,
      (dv: DataView, index: number) => any
    >
  >{
    "8-bit-int": (dv, index) => {
      return dv.getInt8(index);
    },
    "8-bit-uint": (dv, index) => {
      return dv.getUint8(index);
    },
    "16-bit-int": (dv, index) => {
      return dv.getInt16(index);
    },
    "16-bit-uint": (dv, index) => {
      return dv.getUint16(index);
    },
    "32-bit-int": (dv, index) => {
      return dv.getInt32(index);
    },
    "32-bit-uint": (dv, index) => {
      return dv.getUint32(index);
    },
    "32-bit-float": (dv, index) => {
      return dv.getFloat32(index);
    },
    "big-int": (dv, index) => {
      return dv.getBigInt64(index);
    },
    "big-uint": (dv, index) => {
      return dv.getBigUint64(index);
    },
  },

  elementSetFunctions: <
    Record<
      Exclude<DBOScehemaPrimitiveElementTypes, "list" | "string">,
      (dv: DataView, index: number, value: number) => any
    >
  >{
    "8-bit-int": (dv, index, value) => {
      return dv.setInt8(index, value);
    },
    "8-bit-uint": (dv, index, value) => {
      return dv.setUint8(index, value);
    },
    "16-bit-int": (dv, index, value) => {
      return dv.setInt16(index, value);
    },
    "16-bit-uint": (dv, index, value) => {
      return dv.setUint16(index, value);
    },
    "32-bit-int": (dv, index, value) => {
      return dv.setInt32(index, value);
    },
    "32-bit-uint": (dv, index, value) => {
      return dv.setUint32(index, value);
    },
    "32-bit-float": (dv, index, value) => {
      return dv.setFloat32(index, value);
    },
    "big-int": (dv, index, value) => {
      return dv.setBigInt64(index, BigInt(value));
    },
    "big-uint": (dv, index, value) => {
      return dv.setBigUint64(index, BigInt(value));
    },
  },

  advancedElementSetFunctions: <
    Record<
      DBOScehemaAdvancedElementTypes,
      (dv: DataView, byteCount: number, element: DBOScehemaElement) => number
    >
  >{
    "fixed-length-string": (dv, byteCount, element) => {
      if (typeof element.value != "string") {
        throw new Error("Value must a string for 'fixed-length-string'");
      }
      if (!element.length) {
        throw new Error("Length must be set for 'fixed-length-string'");
      }
      const string = element.value;
      for (let i = 0; i < element.length; i++) {
        dv.setUint16(byteCount, string.charCodeAt(i));
        byteCount += 2;
      }
      return byteCount;
    },
    "fixed-length-typed-list": (dv, byteCount, element) => {
      if (!element.listType || !Array.isArray(element.value)) {
        throw new Error("Fixed length type list must have list type set");
      }
      const arrayLength = element.value.length;
      const arrayType = element.listType;
      const byteLength = DBO.elementByteCounts[arrayType];
      const func = DBO.elementSetFunctions[arrayType];
      for (let i = 0; i < arrayLength; i++) {
        func(dv, byteCount, element.value[i]);
        byteCount += byteLength;
      }
      return byteCount;
    },
    "meta-marked-data": (dv, byteCount, element) => {
      return byteCount;
    },
  },

  advancedElementGetFunctions: <
    Record<
      DBOScehemaAdvancedElementTypes,
      (
        dv: DataView,
        byteCount: number,
        element: DBOScehemaElement,
        targetObject: any,
        name: string
      ) => number
    >
  >{
    "fixed-length-string": (dv, byteCount, element, targetObject, name) => {
      if (typeof element.value != "string") {
        throw new Error("Value must a string for 'fixed-length-string'");
      }
      if (!element.length) {
        throw new Error("Length must be set for 'fixed-length-string'");
      }
      let string = "";
      for (let i = 0; i < element.length; i++) {
        string += String.fromCharCode(dv.getUint16(byteCount));
        byteCount += 2;
      }
      targetObject[name] = string;
      return byteCount;
    },
    "fixed-length-typed-list": (dv, byteCount, element, targetObject, name) => {
      if (
        !element.listType ||
        !Array.isArray(element.value) ||
        !element.length
      ) {
        throw new Error("Fixed length type list must have list type set");
      }
      const payloadArray: number[] = [];
      const arrayLength = element.length;
      const arrayType = element.listType;
      const byteLength = DBO.elementByteCounts[arrayType];
      const func = DBO.elementGetFunctions[arrayType];
      for (let i = 0; i < arrayLength; i++) {
        payloadArray[i] = func(dv, byteCount);
        byteCount += byteLength;
      }
      targetObject[name] = payloadArray;
      return byteCount;
    },
    "meta-marked-data": (dv, byteCount, element, targetObject, name) => {
      return byteCount;
    },
  },

  getBuffer(length: number, SAB: boolean) {
    if (SAB) {
      return new SharedArrayBuffer(length);
    }
    return new ArrayBuffer(length);
  },

  syncSABWtihBuffer(sab: SharedArrayBuffer, buffer: ArrayBuffer) {
    const temp1 = new Uint8Array(sab);
    const temp2 = new Uint8Array(buffer);
    temp1.set(temp2, 0);
  },

  sharedBufferToBuffer(sab: SharedArrayBuffer) {
    const temp1 = new Uint8Array(sab);
    const temp2 = new Uint8Array(sab.byteLength);
    temp2.set(temp1, 0);
    return temp2.buffer;
  },

  registerSchema(id: string, schema: DBOScehema) {
    const legnth = this._calculateSchemaLength(schema);
    this.schemas[id] = {
      length: legnth,
      schema: schema,
    };
  },

  _calculateSchemaLength(schema: DBOScehema) {
    let length = 0;
    for (const key of Object.keys(schema)) {
      const element = schema[key];
      /*     if (element.length == "variable") {
        length = -1;
        break;
      } */
      if (element.type == "fixed-length-string" && element.length) {
        length += element.length * 4;
        continue;
      }
      if (
        element.type == "fixed-length-typed-list" &&
        element.length &&
        element.listType
      ) {
        length += element.length * this.elementByteCounts[element.listType];
        continue;
      }
      //@ts-ignore
      length += this.elementByteCounts[element.type];
    }
    return length;
  },

  getSchema(id: string) {
    return this.schemas[id];
  },

  createObject<T>(
    schemaId: string,
    buffer: ArrayBuffer | SharedArrayBuffer | DataView
  ): T {
    let dv;

    //@ts-ignore
    if (Buffer && !(buffer instanceof DataView)) {
      //@ts-ignore
      dv = new DataView(new Uint8Array(buffer).buffer);
    } else {
      if (buffer instanceof DataView) {
        dv = buffer;
      } else {
        dv = new DataView(buffer);
      }
    }

    const schemaData = this.getSchema(schemaId);
    const object: any = new Object();
    const schema = schemaData.schema;

    let byteCount = 0;
    for (const name of Object.keys(schema)) {
      const element = schema[name];
      if (
        this.advancedElementGetFunctions[
          <DBOScehemaAdvancedElementTypes>element.type
        ]
      ) {
        byteCount += this.advancedElementGetFunctions[
          <DBOScehemaAdvancedElementTypes>element.type
        ](dv, byteCount, element, object, name);
        continue;
      }
      if (
        this.elementSetFunctions[<DBOScehemaPrimitiveElementTypes>element.type]
      ) {
        object[name] = this.elementGetFunctions[
          <DBOScehemaPrimitiveElementTypes>element.type
        ](dv, byteCount);
        byteCount +=
          this.elementByteCounts[<DBOScehemaPrimitiveElementTypes>element.type];
      }
    }
    return object;
  },

  _calculateVariableSizeBuffer(scehma: DBOScehema) {
    return 1;
  },

  createBuffer(schemaId: string, updatedValues: any = {}) {
    const schemaData = this.getSchema(schemaId);
    const schema = schemaData.schema;
    for (const key of Object.keys(updatedValues)) {
      const val = updatedValues[key];
      if (schema[key]) {
        schema[key].value = val;
      }
    }
    let length = schemaData.length;
    if (length < 0) {
      length = this._calculateVariableSizeBuffer(schema);
    }
    const buffer = new ArrayBuffer(length);
    const dv = new DataView(buffer);

    let byteCount = 0;
    for (const key of Object.keys(schema)) {
      const element = schema[key];

      if (
        this.advancedElementSetFunctions[
          <DBOScehemaAdvancedElementTypes>element.type
        ]
      ) {
        byteCount += this.advancedElementSetFunctions[
          <DBOScehemaAdvancedElementTypes>element.type
        ](dv, byteCount, element);
        continue;
      }

      if (
        this.elementSetFunctions[<DBOScehemaPrimitiveElementTypes>element.type]
      ) {
        this.elementSetFunctions[<DBOScehemaPrimitiveElementTypes>element.type](
          dv,
          byteCount,
          Number(element.value)
        );
        byteCount +=
          this.elementByteCounts[<DBOScehemaPrimitiveElementTypes>element.type];
      }
    }
    return buffer;
  },
};
