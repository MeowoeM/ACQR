"use strict";
const BLOCK_SIZE = 32;
function main() {
    // default values
    document.getElementById('alphaThreshold').value = 128;
    document.getElementById('maxIter').value = 128;
    test();
    // collapsibles
    document.addEventListener('DOMContentLoaded', function () {
        let cardToggles = document.getElementsByClassName('card-toggle');
        for (let i = 0; i < cardToggles.length; i++) {
            cardToggles[i].addEventListener('click', e => {
                e.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
            });
        }
    });
}
function test() {
    let qr;
    const QrCode = qrcodegen.QrCode; // Abbreviation
    const worker = new Worker('./paletteWorker.js');
    let progress = document.getElementById("progress");
    let alphaThreshold;
    let metric;
    let paletteType;
    let originalContext;
    let convertedContext;
    let imageHeight;
    let imageWidth;
    let nRow;
    let nCol;
    let paletteGamut = new Array();
    Color.colorMap.forEach((_, colorHex) => {
        paletteGamut.push(Color.hex2rgb(colorHex));
    });
    worker.onmessage = function (e) {
        let type = e.data.type;
        if (type === 'log') {
            updateProgress(progress, e.data.contents);
        }
        else if (type === 'result') {
            // global palette
            if (paletteType === 'global') {
                let palette = e.data.contents;
                let box = [0, 0, imageWidth, imageHeight];
                if (metric === 'euclidean') {
                    applyPalette(convertedContext, box, alphaThreshold, palette, Color.EuclideanColorDistance);
                }
                else {
                    applyPalette(convertedContext, box, alphaThreshold, palette, Color.deltaE);
                }
                for (let row = 0; row < nRow; row++) {
                    for (let col = 0; col < nCol; col++) {
                        let blockImageData = convertedContext.getImageData(BLOCK_SIZE * col, BLOCK_SIZE * row, BLOCK_SIZE, BLOCK_SIZE);
                        let bytes = makeQrContents(palette, blockImageData);
                        qr = QrCode.encodeSegments([qrcodegen.QrSegment.makeBytes(bytes)], QrCode.Ecc.MEDIUM, 19, 19);
                        qr.drawCanvas(6, 2, appendCanvas(`(${row}, ${col})`));
                    }
                }
                ;
                // enable the input again after conversion
                document.getElementById('file-input').disabled = false;
                updateProgress(progress, 'Done!');
            }
            else if (paletteType === 'local') {
                let palette = e.data.contents;
                let row = e.data.position[0];
                let col = e.data.position[1];
                let box = [
                    BLOCK_SIZE * col, BLOCK_SIZE * row,
                    BLOCK_SIZE, BLOCK_SIZE
                ];
                if (metric === 'euclidean') {
                    applyPalette(convertedContext, box, alphaThreshold, palette, Color.EuclideanColorDistance);
                }
                else {
                    applyPalette(convertedContext, box, alphaThreshold, palette, Color.deltaE);
                }
                let blockImageData = convertedContext.getImageData(BLOCK_SIZE * col, BLOCK_SIZE * row, BLOCK_SIZE, BLOCK_SIZE);
                let bytes = makeQrContents(palette, blockImageData);
                qr = QrCode.encodeSegments([qrcodegen.QrSegment.makeBytes(bytes)], QrCode.Ecc.MEDIUM, 19, 19);
                qr.drawCanvas(6, 2, appendCanvas(`(${row}, ${col})`));
            }
        }
    };
    document.getElementById('file-input').onchange = function (e) {
        loadImage(e.target.files[0], function (img) {
            // temporarily disable the input during conversion
            document.getElementById('file-input').disabled = true;
            let p = document.getElementById("output").appendChild(document.createElement("p"));
            p.textContent = "Original:";
            let figure = document.getElementById("output").appendChild(document.createElement("figure"));
            figure.appendChild(img);
            ({ imageHeight, imageWidth, originalContext } = createOriginalCanvas(img));
            originalContext.drawImage(img, 0, 0);
            // if (imageHeight % BLOCK_SIZE > 0 || imageWidth % BLOCK_SIZE > 0) {
            //     alert('the input image must be able to split into 32 * 32 blocks!');
            //     return
            // }
            nRow = Math.round(imageHeight / BLOCK_SIZE);
            nCol = Math.round(imageWidth / BLOCK_SIZE);
            imageHeight = nRow * BLOCK_SIZE;
            imageWidth = nCol * BLOCK_SIZE;
            convertedContext = createConvertedCanvas(originalContext, imageWidth, imageHeight);
            alphaThreshold = parseInt(document.getElementById('alphaThreshold').value);
            metric = getMetricType();
            paletteType = getPaletteType();
            let mode = document.getElementById('colorDownsampleMode').value;
            let maxIter = document.getElementById('maxIter').value;
            if (paletteType === 'global') {
                let opaqueBytes = downsampleImage(originalContext.getImageData(0, 0, imageWidth, imageHeight), alphaThreshold, mode);
                worker.postMessage({
                    opaqueBytes: opaqueBytes,
                    paletteGamut: paletteGamut,
                    metricType: metric,
                    maxIter: maxIter,
                    position: [0, 0]
                });
            }
            else if (paletteType === 'local') {
                for (let row = 0; row < nRow; row++) {
                    for (let col = 0; col < nCol; col++) {
                        let opaqueBytes = downsampleImage(originalContext.getImageData(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), alphaThreshold, mode);
                        worker.postMessage({
                            opaqueBytes: opaqueBytes,
                            paletteGamut: paletteGamut,
                            metricType: metric,
                            maxIter: maxIter,
                            position: [row, col]
                        });
                    }
                }
            }
        }, { maxWidth: 600 } // Options
        );
    };
}
function createOriginalCanvas(img) {
    var canvas = document.createElement('canvas');
    let imageHeight = img.height;
    let imageWidth = img.width;
    canvas.width = img.width;
    canvas.height = img.height;
    let originalContext = canvas.getContext('2d');
    return { imageHeight, imageWidth, originalContext };
}
function createConvertedCanvas(originalContext, width, height) {
    let imageData = originalContext.getImageData(0, 0, width, height);
    let convertedCanvas = appendCanvas('Converted');
    convertedCanvas.width = imageData.width;
    convertedCanvas.height = imageData.height;
    let context = convertedCanvas.getContext('2d');
    context.putImageData(imageData, 0, 0);
    return context;
}
function getMetricType() {
    let metric = 'delta-e';
    if (document.getElementById('deltaE').checked) {
        metric = 'delta-e';
    }
    else if (document.getElementById('euclidean').checked) {
        metric = 'euclidean';
    }
    return metric;
}
function getPaletteType() {
    let palette = 'global';
    if (document.getElementById('globalPalette').checked) {
        palette = 'global';
    }
    else if (document.getElementById('localPalette').checked) {
        palette = 'local';
    }
    return palette;
}
function updateProgress(scrollable, content) {
    let p = scrollable.appendChild(document.createElement("p"));
    p.textContent = content;
    scrollable.scrollTop = scrollable.scrollHeight;
}
function makeQrContents(palette, imageData) {
    const title = document.getElementById('title').value;
    const titleBytes = stringToBytes(title);
    const nTitleBytes = 20 * 2;
    const author = document.getElementById('author').value;
    const authorBytes = stringToBytes(author);
    const nAuthorBytes = 9 * 2;
    const town = document.getElementById('town').value;
    const nTownBytes = 9 * 2;
    const townBytes = stringToBytes(town);
    let contents = new Array();
    // header
    contents = contents.concat(titleBytes);
    for (let i = titleBytes.length; i < nTitleBytes; i++) {
        contents.push(0);
    }
    contents = contents.concat([0, 0, 182, 236]);
    contents = contents.concat(authorBytes);
    for (let i = authorBytes.length; i < nAuthorBytes; i++) {
        contents.push(0);
    }
    contents = contents.concat([0, 0, 68, 197]);
    contents = contents.concat(townBytes);
    for (let i = townBytes.length; i < nTownBytes; i++) {
        contents.push(0);
    }
    contents = contents.concat([0, 0, 25, 49]);
    let paletteMap = new Map();
    for (let idx = 0; idx < palette.length; idx++) {
        const colorHex = Color.rgb2hex(palette[idx]);
        paletteMap.set(colorHex, idx);
        const colorByte = Color.colorMap.get(colorHex);
        contents.push(colorByte);
    }
    contents = contents.concat([204, 10, 9, 0, 0]);
    // image
    const transparent = 15; // transparent palette index
    let data = imageData.data;
    for (let idx = 0; idx < data.length; idx += 8) {
        let firstPixel = [
            data[idx + 0],
            data[idx + 1],
            data[idx + 2],
            data[idx + 3]
        ];
        let secondPixel = [
            data[idx + 4],
            data[idx + 5],
            data[idx + 6],
            data[idx + 7]
        ];
        let firstPaletteIdx;
        if (firstPixel[3] == 0) {
            firstPaletteIdx = transparent;
        }
        else {
            firstPaletteIdx = paletteMap.get(Color.rgb2hex([
                firstPixel[0],
                firstPixel[1],
                firstPixel[2]
            ]));
        }
        let secondPaletteIdx;
        if (secondPixel[3] == 0) {
            secondPaletteIdx = transparent;
        }
        else {
            secondPaletteIdx = paletteMap.get(Color.rgb2hex([
                secondPixel[0],
                secondPixel[1],
                secondPixel[2]
            ]));
        }
        contents.push(16 * secondPaletteIdx + firstPaletteIdx);
    }
    return contents;
}
function stringToBytes(str) {
    let bytes = new Array();
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char & 0xFF);
        bytes.push(char >>> 8);
    }
    return bytes;
}
function applyPalette(context, box, alphaThreshold, palette, metric) {
    let imageData = context.getImageData(box[0], box[1], box[2], box[3]);
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > alphaThreshold) {
            let thisColor = [
                imageData.data[i + 0],
                imageData.data[i + 1],
                imageData.data[i + 2]
            ];
            let minDistance = Number.MAX_VALUE;
            let closestColor;
            palette.forEach(color => {
                let distance = metric(thisColor, color);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = color;
                }
            });
            imageData.data[i + 0] = closestColor[0];
            imageData.data[i + 1] = closestColor[1];
            imageData.data[i + 2] = closestColor[2];
            imageData.data[i + 3] = 255;
        }
        else {
            imageData.data[i + 3] = 0;
        }
    }
    context.putImageData(imageData, box[0], box[1]);
}
// function findPalette(
//     opaqueBytes: [number, number, number][], 
//     paletteGamut: [number, number, number][], 
//     metric: (rgbA: any, rgbB: any) => number
//     ): [number, number, number][] {
//     let maxIter = document.getElementById('maxIter').value;
//     let paletteGenerator = new pMedian.GA(
//         opaqueBytes, 
//         paletteGamut, 
//         15, 
//         metric, 
//         Color.rgb2hex, 
//         Color.hex2rgb, 
//         maxIter);
//     let palette = paletteGenerator.pMedian();
//     return palette;
// }
function downsampleImage(imageData, alphaThreshold, mode) {
    let opaqueBytes = new Array();
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > alphaThreshold) {
            // downsample to 12-bit color to speed up
            opaqueBytes.push(downsamplePixel(imageData.data.slice(i, i + 3), mode));
        }
    }
    console.log('lab');
    return opaqueBytes;
}
// http://threadlocalmutex.com/?page_id=60
function downsamplePixel(color, mode) {
    // color = Color.rgb2lab(color);
    let newColor = [0, 0, 0];
    if (mode === '4bit') {
        for (let i = 0; i < color.length; i++) {
            let tmp = (color[i] * 15 + 135) >> 8;
            newColor[i] = tmp * 17;
        }
    }
    else if (mode === '5bit') {
        for (let i = 0; i < color.length; i++) {
            let tmp = (color[i] * 249 + 1024) >> 11;
            newColor[i] = (tmp * 527 + 23) >> 6;
        }
    }
    else if (mode === '6bit') {
        for (let i = 0; i < color.length; i++) {
            let tmp = (color[i] * 253 + 512) >> 10;
            newColor[i] = (tmp * 259 + 33) >> 6;
        }
    }
    else if (mode === '7bit') {
        for (let i = 0; i < color.length; i++) {
            let tmp = (color[i] * 2 + 1) >> 2;
            newColor[i] = (tmp * 257 + 64) >> 7;
        }
    }
    else {
        newColor = color;
    }
    // newColor = Color.lab2rgb(newColor)
    // return [newColor[0], newColor[1], newColor[2]]
    return newColor;
}
function appendHeading(text) {
    let outputElem = document.getElementById("output");
    let h2 = outputElem.appendChild(document.createElement("h2"));
    h2.textContent = text;
}
function appendCanvas(caption) {
    let outputElem = document.getElementById("output");
    let p = outputElem.appendChild(document.createElement("p"));
    p.textContent = caption + ":";
    let result = document.createElement("canvas");
    outputElem.appendChild(result);
    return result;
}
function toUtf8ByteArray(str) {
    str = encodeURI(str);
    let result = [];
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) != "%")
            result.push(str.charCodeAt(i));
        else {
            result.push(parseInt(str.substr(i + 1, 2), 16));
            i += 2;
        }
    }
    return result;
}
main();
//# sourceMappingURL=acqr.js.map