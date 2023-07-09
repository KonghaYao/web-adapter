# stream-crypto

This is a library for performing streaming crypto in Node.js, exported in accordance with the usage of the Web Stream API. It is planned to achieve unified stream crypto operations across Deno, Node.js, and the browser, making it convenient to unify various functionalities.

## Getting Start

Here is an example of end-to-end encryption based on AES.

```ts
import {
    createRandomBytesStream,
    HexDecodeStream,
    HexEncoderStream,
    createHashStream,
    createCipherivStream,
    createDecipherivStream,
} from "stream-crypto";

// Sending Side
const originData = randomBytes(200);
const key = randomBytes(32);
const iv = randomBytes(16);

const [dataStream, copiedStream] = createStream(originData)
    .pipeThrough(createCipherivStream("aes-256-cbc", key, iv))
    .tee();
const hashStream = copiedStream
    .pipeThrough(createHashStream("sha256"))
    .pipeThrough(new HexEncoderStream());

sendStreamsToOtherSide(dataStream, hashStream);
```

```ts
import {
    createRandomBytesStream,
    HexDecodeStream,
    HexEncoderStream,
    createHashStream,
    createDecipherivStream,
    getFinalDataFromStream,
} from "stream-crypto";

//*** get stream from some where
const { key, iv } = getMessageFromSendingSide();
const [dataStream, hashStream] = getStreamFromSendingSide();

// Receive End
const [forDecrypt, forHashCheck] = dataStream.tee();
const [decrypted, hashCheck, hashString] = await getFinalDataFromStreams(
    forDecrypt.pipeThrough(createDecipherivStream("aes-256-cbc", key, iv)),
    forHashCheck
        .pipeThrough(createHashStream("sha256"))
        .pipeThrough(new HexEncoderStream()),
    hashStream
);

hashCheck === hashString; // true
decrypted; // originData
```
