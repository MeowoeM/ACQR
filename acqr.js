"use strict";
function main() {
    // default values
    document.getElementById('downsampleRate').value = 8;
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
    let colorDownsamplingRate;
    let metric;
    let imageData;
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
            let palette = e.data.contents;
            let context;
            if (metric === 'euclidean') {
                context = applyPalette(imageData, alphaThreshold, palette, Color.EuclideanColorDistance);
            }
            else {
                context = applyPalette(imageData, alphaThreshold, palette, Color.deltaE);
            }
            for (let rowIdx = 0; rowIdx < nRow; rowIdx++) {
                for (let colIdx = 0; colIdx < nCol; colIdx++) {
                    let blockImageData = context.getImageData(32 * colIdx, 32 * rowIdx, 32, 32);
                    let bytes = makeQrContents(palette, blockImageData);
                    qr = QrCode.encodeSegments([qrcodegen.QrSegment.makeBytes(bytes)], QrCode.Ecc.MEDIUM, 19, 19);
                    qr.drawCanvas(6, 2, appendCanvas(`(${rowIdx}, ${colIdx})`));
                }
            }
            ;
            // enable the input again after conversion
            document.getElementById('file-input').disabled = false;
            updateProgress(progress, 'Done!');
        }
    };
    document.getElementById('file-input').onchange = function (e) {
        loadImage(e.target.files[0], function (img) {
            // temporarily disable the input during conversion
            document.getElementById('file-input').disabled = true;
            let p = document.getElementById("output").appendChild(document.createElement("p"));
            p.textContent = "Original:";
            let figure = document.getElementById("output").appendChild(document.createElement("figure"));
            figure.className += " image";
            figure.appendChild(img);
            imageData = readImage(img);
            if (imageData.width % 32 > 0 || imageData.width % 32 > 0) {
                alert('the input image must be able to split into 32 * 32 blocks!');
                return;
            }
            nRow = Math.round(imageData.height / 32);
            nCol = Math.round(imageData.width / 32);
            alphaThreshold = parseInt(document.getElementById('alphaThreshold').value);
            colorDownsamplingRate = parseInt(document.getElementById('downsampleRate').value);
            let opaqueBytes = downsampleImage(imageData, alphaThreshold, colorDownsamplingRate);
            if (document.getElementById('deltaE').checked) {
                metric = 'delta-e';
            }
            else if (document.getElementById('euclidean').checked) {
                metric = 'euclidean';
            }
            let maxIter = document.getElementById('maxIter').value;
            worker.postMessage({
                opaqueBytes: opaqueBytes,
                paletteGamut: paletteGamut,
                metricType: metric,
                maxIter: maxIter
            });
        }, { maxWidth: 600 } // Options
        );
    };
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
function applyPalette(imageData, alphaThreshold, palette, metric) {
    var canvas = appendCanvas('Converted');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var context = canvas.getContext('2d');
    var newImageData = context.createImageData(imageData.width, imageData.height);
    for (let i = 0; i < newImageData.data.length; i += 4) {
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
            newImageData.data[i + 0] = closestColor[0];
            newImageData.data[i + 1] = closestColor[1];
            newImageData.data[i + 2] = closestColor[2];
            newImageData.data[i + 3] = 255;
        }
        else {
            newImageData.data[i + 3] = 0;
        }
    }
    context.putImageData(newImageData, 0, 0);
    return context;
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
function downsampleImage(imageData, alphaThreshold, colorDownsamplingRate) {
    let opaqueBytes = new Array();
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > alphaThreshold) {
            // downsample to 12-bit color to speed up
            opaqueBytes.push(downsamplePixel(imageData.data.slice(i, i + 3), colorDownsamplingRate));
        }
    }
    return opaqueBytes;
}
function readImage(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return imageData;
}
function downsamplePixel(color, rate) {
    return [
        Math.min(255, rate * Math.round(color[0] / rate)),
        Math.min(255, rate * Math.round(color[1] / rate)),
        Math.min(255, rate * Math.round(color[2] / rate))
    ];
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