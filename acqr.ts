
"use strict";


namespace app {
    
    let outputElem = document.getElementById("output") as HTMLElement;
    let colorMap = new Map();
    // grayscale

    function main(): void {
        // default values
        document.getElementById('downsampleRate').value = 8;
        document.getElementById('alphaThreshold').value = 128;
        document.getElementById('maxIter').value = 128;
		test();
	}
	
	
	function test(): void {
        appendHeading("Variety");
		let qr: qrcodegen.QrCode;
		const QrCode = qrcodegen.QrCode;  // Abbreviation

        document.getElementById('file-input').onchange = function (e) {
            loadImage(
              e.target.files[0],
              function (img) {
                document.getElementById('output').appendChild(img);
                var imageData = readImage(img);
                if (imageData.width % 32 > 0 || imageData.width % 32 > 0) {
                    alert('the input image must be able to split into 32 * 32 blocks!');
                    return
                }
                const nRow = Math.round(imageData.height / 32);
                const nCol = Math.round(imageData.width / 32);

                const alphaThreshold = parseInt(document.getElementById('alphaThreshold').value);
                const colorDownsamplingRate = parseInt(document.getElementById('downsampleRate').value);
                
                let paletteGamut = new Array<[number, number, number]>();
                Color.colorMap.forEach((_, colorHex) => {
                    paletteGamut.push(Color.hex2rgb(colorHex));
                });

                let opaqueBytes = downsampleImage(imageData, alphaThreshold, colorDownsamplingRate);
                
                let metric = Color.deltaE;
                if (document.getElementById('deltaE').checked) {
                    metric = Color.deltaE;
                }
                else if (document.getElementById('euclidean').checked) {
                    metric = Color.EuclideanColorDistance;
                }

                let palette = findPalette(opaqueBytes, paletteGamut, metric);
                let context = applyPalette(imageData, alphaThreshold, palette, metric);
                
                for (let rowIdx = 0; rowIdx < nRow; rowIdx++) {
                    for ( let colIdx = 0; colIdx < nCol; colIdx++) {
                        let blockImageData = context.getImageData(
                            32 * colIdx, 32 * rowIdx,
                            32, 32
                        )
                        let bytes = makeQrContents(palette, blockImageData);
                        qr = QrCode.encodeSegments(
                            [qrcodegen.QrSegment.makeBytes(bytes)], 
                            QrCode.Ecc.MEDIUM, 19, 19
                        )
                        qr.drawCanvas(6, 2, appendCanvas(`(${rowIdx}, ${colIdx})`));
                    }
                }
                },
              { maxWidth: 600 } // Options
            )
        }
    }

    function makeQrContents(
        palette: [number, number, number][],
        imageData: any
    ): Array<number> {
        const title: string = document.getElementById('title').value;
        const titleBytes = stringToBytes(title);
        const nTitleBytes = 20 * 2;
        const author: string = document.getElementById('author').value;
        const authorBytes = stringToBytes(author);
        const nAuthorBytes = 9 * 2;
        const town: string = document.getElementById('town').value;
        const nTownBytes = 9 * 2;
        const townBytes = stringToBytes(town);

        let contents = new Array<number>();

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

        let paletteMap = new Map<string, number>();
        for (let idx = 0; idx < palette.length; idx++) {
            const colorHex = Color.rgb2hex(palette[idx]);
            paletteMap.set(colorHex, idx);
            const colorByte = Color.colorMap.get(colorHex);
            contents.push(colorByte)
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
            let firstPaletteIdx: number;
            if (firstPixel[3] == 0) {
                firstPaletteIdx = transparent;
            }
            else {
                firstPaletteIdx = paletteMap.get(
                    Color.rgb2hex([
                        firstPixel[0], 
                        firstPixel[1], 
                        firstPixel[2]
                    ])
                )
            }

            let secondPaletteIdx: number;
            if (secondPixel[3] == 0) {
                secondPaletteIdx = transparent;
            }
            else {
                secondPaletteIdx = paletteMap.get(
                    Color.rgb2hex([
                        secondPixel[0], 
                        secondPixel[1], 
                        secondPixel[2]
                    ])
                )
            }

            contents.push(16 * secondPaletteIdx + firstPaletteIdx)
        }

        return contents
    }
    
    function stringToBytes(str: string): Array<number> {
        let bytes = new Array<number>();
        for(var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            bytes.push(char & 0xFF);
            bytes.push(char >>> 8);
        }
        return bytes;
    }

    function applyPalette(
        imageData: any, 
        alphaThreshold: number, 
        palette: [number, number, number][], 
        metric: (rgbA: any, rgbB: any) => number
        ) {
        var canvas = appendCanvas('result');
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
                let closestColor: [number, number, number];
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
        return context
    }

    function findPalette(
        opaqueBytes: [number, number, number][], 
        paletteGamut: [number, number, number][], 
        metric: (rgbA: any, rgbB: any) => number
        ): [number, number, number][] {
        let maxIter = document.getElementById('maxIter').value;
        let paletteGenerator = new pMedian.GA(
            opaqueBytes, 
            paletteGamut, 
            15, 
            metric, 
            Color.rgb2hex, 
            Color.hex2rgb, 
            maxIter);
        let palette = paletteGenerator.pMedian();
        return palette;
    }

    function downsampleImage(imageData: any, alphaThreshold: number, colorDownsamplingRate: number) {
        let opaqueBytes = new Array<[number, number, number]>();
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > alphaThreshold) {
                // downsample to 12-bit color to speed up
                opaqueBytes.push(downsamplePixel(imageData.data.slice(i, i + 3), colorDownsamplingRate));
            }
        }
        return opaqueBytes;
    }

    function readImage(img: any) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        return imageData;
    }

	function downsamplePixel(
        color: [number, number, number],
        rate: number 
    ): [number, number, number] {
        return [
            Math.min(255, rate * Math.round(color[0] / rate)), 
            Math.min(255, rate * Math.round(color[1] / rate)), 
            Math.min(255, rate * Math.round(color[2] / rate))
        ]
    }
	
	function appendHeading(text: string): void {
		let h2 = outputElem.appendChild(document.createElement("h2"));
		h2.textContent = text;
	}
	
	
	function appendCanvas(caption: string): HTMLCanvasElement {
		let p = outputElem.appendChild(document.createElement("p"));
		p.textContent = caption + ":";
		let result = document.createElement("canvas");
		outputElem.appendChild(result);
		return result;
	}
	
	
	function toUtf8ByteArray(str: string): Array<number> {
		str = encodeURI(str);
		let result: Array<number> = [];
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
	
}
