export function mergeUint8Arrays(arrays: Uint8Array[]) {
    // 计算所有数组元素的总长度
    const totalLength = arrays.reduce((length, array) => length + array.length, 0);

    // 创建一个新的 Uint8Array
    const mergedArray = new Uint8Array(totalLength);

    // 使用 set 方法将每个数组依次合并到新数组中
    let offset = 0;
    arrays.forEach(array => {
        mergedArray.set(array, offset);
        offset += array.length;
    });

    return mergedArray;
}
