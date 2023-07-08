import { isNode, isDeno, isBrowser } from '../env'
let UnionAssetsMap: typeof NodeAssetsMap | typeof BrowserAssetsMap | typeof DenoAssetsMap

//ifdef node
import { NodeAssetsMap } from "./platform/NodeAssetsMap"
if (isNode) UnionAssetsMap = NodeAssetsMap
//endif

//ifdef browser
import { BrowserAssetsMap } from "./platform/BrowserAssetsMap"
if (isBrowser) UnionAssetsMap = BrowserAssetsMap
//endif

//ifdef deno
import { DenoAssetsMap } from "./platform/DenoAssetsMap"
if (isDeno) UnionAssetsMap = DenoAssetsMap
//endif

// 
export { UnionAssetsMap }