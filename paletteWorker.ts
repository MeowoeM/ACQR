importScripts('Color.js')
importScripts('pMedian.js')
importScripts('misc.js')

function findPalette(
    opaqueBytes: [number, number, number][], 
    paletteGamut: [number, number, number][], 
    metricType: string,
    maxIter: number
    ): [number, number, number][] {
        let metric = Color.deltaE;
        if (metricType == 'euclidean-e') {
            metric = Color.EuclideanColorDistance;
        }

        let paletteGenerator = new pMedian.GA(
            opaqueBytes, 
            paletteGamut, 
            15, 
            metric, 
            Color.rgb2hex, 
            Color.hex2rgb, 
            maxIter);
        let palette = paletteGenerator.pMedian(log);
        return palette;
}

function log(entry: string): void {
    postMessage({
        type: 'log',
        contents: entry
    });
}

onmessage = function(e) {
    let palette = findPalette(
        e.data.opaqueBytes, 
        e.data.paletteGamut, 
        e.data.metricType, 
        e.data.maxIter
    );
    postMessage({
        type: 'result',
        contents: palette,
        position: e.data.position
    });
}