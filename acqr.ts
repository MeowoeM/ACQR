
"use strict";


namespace app {
    
    let outputElem = document.getElementById("output") as HTMLElement;
    let colorMap = new Map();
    // grayscale

    function main(): void {
		test();
	}
	
	
	function test(): void {
		let qr: qrcodegen.QrCode;
        const QrCode = qrcodegen.QrCode;  // Abbreviation
        let bytes: Array<number> = [
            69, 0, 109, 0, 112, 0, 116, 0, 121, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 182, 236, 85, 0, 110, 0, 107, 0, 
            110, 0, 111, 0, 119, 0, 110, 0, 0, 0, 
            0, 0, 0, 0, 68, 197, 85, 0, 110, 0, 
            107, 0, 110, 0, 111, 0, 119, 0, 110, 0, 
            0, 0, 0, 0, 0, 0, 25, 49, 15, 31, 
            47, 63, 79, 95, 111, 127, 143, 159, 175, 191, 
            207, 223, 239, 204, 10, 9, 0, 0, 0, 0, 
            0, 0, 17, 17, 17, 17, 34, 34, 34, 34, 
            51, 51, 51, 51, 0, 0, 0, 0, 17, 17, 
            17, 17, 34, 34, 34, 34, 51, 51, 51, 51, 
            0, 0, 0, 0, 17, 17, 17, 17, 34, 34, 
            34, 34, 51, 51, 51, 51, 0, 0, 0, 0, 
            17, 17, 17, 17, 34, 34, 34, 34, 51, 51, 
            51, 51, 0, 0, 0, 0, 17, 17, 17, 17, 
            34, 34, 34, 34, 51, 51, 51, 51, 0, 0, 
            0, 0, 17, 17, 17, 17, 34, 34, 34, 34, 
            51, 51, 51, 51, 0, 0, 0, 0, 17, 17, 
            17, 17, 34, 34, 34, 34, 51, 51, 51, 51, 
            0, 0, 0, 0, 17, 17, 17, 17, 34, 34, 
            34, 34, 51, 51, 51, 51, 68, 68, 68, 68, 
            85, 85, 85, 85, 102, 102, 102, 102, 119, 119, 
            119, 119, 68, 68, 68, 68, 85, 85, 85, 85, 
            102, 102, 102, 102, 119, 119, 119, 119, 68, 68, 
            68, 68, 85, 85, 85, 85, 102, 102, 102, 102, 
            119, 119, 119, 119, 68, 68, 68, 68, 85, 85, 
            85, 85, 102, 102, 102, 102, 119, 119, 119, 119, 
            68, 68, 68, 68, 85, 85, 85, 85, 102, 102, 
            102, 102, 119, 119, 119, 119, 68, 68, 68, 68, 
            85, 85, 85, 85, 102, 102, 102, 102, 119, 119, 
            119, 119, 68, 68, 68, 68, 85, 85, 85, 85, 
            102, 102, 102, 102, 119, 119, 119, 119, 68, 68, 
            68, 68, 85, 85, 85, 85, 102, 102, 102, 102, 
            119, 119, 119, 119, 136, 136, 136, 136, 153, 153, 
            153, 153, 170, 170, 170, 170, 187, 187, 187, 187, 
            136, 136, 136, 136, 153, 153, 153, 153, 170, 170, 
            170, 170, 187, 187, 187, 187, 136, 136, 136, 136, 
            153, 153, 153, 153, 170, 170, 170, 170, 187, 187, 
            187, 187, 136, 136, 136, 136, 153, 153, 153, 153, 
            170, 170, 170, 170, 187, 187, 187, 187, 136, 136, 
            136, 136, 153, 153, 153, 153, 170, 170, 170, 170, 
            187, 187, 187, 187, 136, 136, 136, 136, 153, 153, 
            153, 153, 170, 170, 170, 170, 187, 187, 187, 187, 
            136, 136, 136, 136, 153, 153, 153, 153, 170, 170, 
            170, 170, 187, 187, 187, 187, 136, 136, 136, 136, 
            153, 153, 153, 153, 170, 170, 170, 170, 187, 187, 
            187, 187, 204, 204, 204, 204, 221, 221, 221, 221, 
            238, 238, 238, 238, 255, 255, 255, 255, 204, 204, 
            204, 204, 221, 221, 221, 221, 238, 238, 238, 238, 
            255, 255, 255, 255, 204, 204, 204, 204, 221, 221, 
            221, 221, 238, 238, 238, 238, 255, 255, 255, 255, 
            204, 204, 204, 204, 221, 221, 221, 221, 238, 238, 
            238, 238, 255, 255, 255, 255, 204, 204, 204, 204, 
            221, 221, 221, 221, 238, 238, 238, 238, 255, 255, 
            255, 255, 204, 204, 204, 204, 221, 221, 221, 221, 
            238, 238, 238, 238, 255, 255, 255, 255, 204, 204, 
            204, 204, 221, 221, 221, 221, 238, 238, 238, 238, 
            255, 255, 255, 255, 204, 204, 204, 204, 221, 221, 
            221, 221, 238, 238, 238, 238, 255, 255, 255, 255,
        ]
        
        // version is fixed to 19
        qr = QrCode.encodeSegments(
            [qrcodegen.QrSegment.makeBytes(bytes)], 
            QrCode.Ecc.MEDIUM, 19, 19
        )
        qr.drawCanvas(6, 2, appendCanvas("ACQR"));

        let bytes2: Array<number> = [
            69, 0, 109, 0, 112, 0, 116, 0, 121, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 182, 236, 85, 0, 110, 0, 107, 0, 
            110, 0, 111, 0, 119, 0, 110, 0, 0, 0, 
            0, 0, 0, 0, 68, 197, 85, 0, 110, 0, 
            107, 0, 110, 0, 111, 0, 119, 0, 110, 0, 
            0, 0, 0, 0, 0, 0, 25, 49, 192, 193, 
            194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 
            206, 207, 239, 204, 10, 9, 0, 0, 0, 0, 
            0, 0, 17, 17, 17, 17, 34, 34, 34, 34, 
            51, 51, 51, 51, 0, 0, 0, 0, 17, 17, 
            17, 17, 34, 34, 34, 34, 51, 51, 51, 51, 
            0, 0, 0, 0, 17, 17, 17, 17, 34, 34, 
            34, 34, 51, 51, 51, 51, 0, 0, 0, 0, 
            17, 17, 17, 17, 34, 34, 34, 34, 51, 51, 
            51, 51, 0, 0, 0, 0, 17, 17, 17, 17, 
            34, 34, 34, 34, 51, 51, 51, 51, 0, 0, 
            0, 0, 17, 17, 17, 17, 34, 34, 34, 34, 
            51, 51, 51, 51, 0, 0, 0, 0, 17, 17, 
            17, 17, 34, 34, 34, 34, 51, 51, 51, 51, 
            0, 0, 0, 0, 17, 17, 17, 17, 34, 34, 
            34, 34, 51, 51, 51, 51, 68, 68, 68, 68, 
            85, 85, 85, 85, 102, 102, 102, 102, 119, 119, 
            119, 119, 68, 68, 68, 68, 85, 85, 85, 85, 
            102, 102, 102, 102, 119, 119, 119, 119, 68, 68, 
            68, 68, 85, 85, 85, 85, 102, 102, 102, 102, 
            119, 119, 119, 119, 68, 68, 68, 68, 85, 85, 
            85, 85, 102, 102, 102, 102, 119, 119, 119, 119, 
            68, 68, 68, 68, 85, 85, 85, 85, 102, 102, 
            102, 102, 119, 119, 119, 119, 68, 68, 68, 68, 
            85, 85, 85, 85, 102, 102, 102, 102, 119, 119, 
            119, 119, 68, 68, 68, 68, 85, 85, 85, 85, 
            102, 102, 102, 102, 119, 119, 119, 119, 68, 68, 
            68, 68, 85, 85, 85, 85, 102, 102, 102, 102, 
            119, 119, 119, 119, 136, 136, 136, 136, 153, 153, 
            153, 153, 170, 170, 170, 170, 187, 187, 187, 187, 
            136, 136, 136, 136, 153, 153, 153, 153, 170, 170, 
            170, 170, 187, 187, 187, 187, 136, 136, 136, 136, 
            153, 153, 153, 153, 170, 170, 170, 170, 187, 187, 
            187, 187, 136, 136, 136, 136, 153, 153, 153, 153, 
            170, 170, 170, 170, 187, 187, 187, 187, 136, 136, 
            136, 136, 153, 153, 153, 153, 170, 170, 170, 170, 
            187, 187, 187, 187, 136, 136, 136, 136, 153, 153, 
            153, 153, 170, 170, 170, 170, 187, 187, 187, 187, 
            136, 136, 136, 136, 153, 153, 153, 153, 170, 170, 
            170, 170, 187, 187, 187, 187, 136, 136, 136, 136, 
            153, 153, 153, 153, 170, 170, 170, 170, 187, 187, 
            187, 187, 204, 204, 204, 204, 221, 221, 221, 221, 
            238, 238, 238, 238, 255, 255, 255, 255, 204, 204, 
            204, 204, 221, 221, 221, 221, 238, 238, 238, 238, 
            255, 255, 255, 255, 204, 204, 204, 204, 221, 221, 
            221, 221, 238, 238, 238, 238, 255, 255, 255, 255, 
            204, 204, 204, 204, 221, 221, 221, 221, 238, 238, 
            238, 238, 255, 255, 255, 255, 204, 204, 204, 204, 
            221, 221, 221, 221, 238, 238, 238, 238, 255, 255, 
            255, 255, 204, 204, 204, 204, 221, 221, 221, 221, 
            238, 238, 238, 238, 255, 255, 255, 255, 204, 204, 
            204, 204, 221, 221, 221, 221, 238, 238, 238, 238, 
            255, 255, 255, 255, 204, 204, 204, 204, 221, 221, 
            221, 221, 238, 238, 238, 238, 255, 255, 255, 255
        ]

        qr = QrCode.encodeSegments(
            [qrcodegen.QrSegment.makeBytes(bytes2)], 
            QrCode.Ecc.MEDIUM, 19, 19
        )
        qr.drawCanvas(6, 2, appendCanvas("ACQR-2"));

        let alphaThreshold = 128;
        document.getElementById('file-input').onchange = function (e) {
            loadImage(
              e.target.files[0],
              function (img) {
                document.getElementById('output').appendChild(img);
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                let opaqueBytes = new Array<[number, number, number]>();

                for (let i = 0; i < imageData.data.length; i += 4) {
                    if (imageData.data[i + 3] > alphaThreshold) {
                        opaqueBytes.push([
                            imageData.data[i + 0], 
                            imageData.data[i + 1], 
                            imageData.data[i + 2]
                        ]);
                    }
                }

                let paletteGamut = new Array<[number, number, number]>();
                for (const colorHex in Color.colorMap) {
                    paletteGamut.push(Color.hex2rgb(colorHex));
                }
                
                let metric = (c1: [number, number, number], c2: [number, number, number]) => DeltaE.deltaE(DeltaE.rgb2lab(c1), DeltaE.rgb2lab(c2));
                let paletteGenerator = new GA_pMedian.GA_pMedianSolver(
                    opaqueBytes,
                    paletteGamut,
                    15,
                    metric,
                    Color.isEqualRGB,
                    Color.rgb2hex
                );

                let palette = paletteGenerator.pMedian();

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var newImageData = context.createImageData(imageData);
                for (let i = 0; i < newImageData.data.length; i += 4) {
                    if (newImageData.data[i + 3] > alphaThreshold) {
                        let thisColor = [
                            newImageData.data[i + 0], 
                            newImageData.data[i + 1], 
                            newImageData.data[i + 2]
                        ];
                        let mindeltaE = Number.MAX_VALUE;
                        let closestColor: [number, number, number];
                        palette.forEach(color => {
                            let deltaE = metric(thisColor, color);
                            if (deltaE < mindeltaE) {
                                mindeltaE = deltaE;
                                closestColor = thisColor;
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
                console.log('done')
                },
              { maxWidth: 600 } // Options
            )
        }
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
