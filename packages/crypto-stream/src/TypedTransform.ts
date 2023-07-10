import { TypedArray } from "./interface"

/** 
 * @en convert a TypedArray to a specified type, such as Uint8Array or Uint16Array
 * @zh 转化 TypedArray 为 一个指定的 Uint8Array 或者 Uint16Array 等类型
 */
export class TypedTransform<D extends TypedArray, T extends new (array: ArrayLike<number> | ArrayBufferLike) => D> extends TransformStream<TypedArray, D>{
    constructor(TypedClass: T) {
        super({
            transform(chunk, controller) {
                controller.enqueue(new TypedClass(chunk))
            }
        })
    }
}