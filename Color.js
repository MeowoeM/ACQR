var Color;
(function (Color) {
    Color.colorMap = new Map([
        ['#ffffff', parseInt('0f', 16)],
        ['#eeeeee', parseInt('1f', 16)],
        ['#dddddd', parseInt('2f', 16)],
        ['#cccdcc', parseInt('3f', 16)],
        ['#bbbbbb', parseInt('4f', 16)],
        ['#aaaaaa', parseInt('5f', 16)],
        ['#999999', parseInt('6f', 16)],
        ['#888888', parseInt('7f', 16)],
        ['#777777', parseInt('8f', 16)],
        ['#666666', parseInt('9f', 16)],
        ['#555555', parseInt('af', 16)],
        ['#444444', parseInt('bf', 16)],
        ['#333233', parseInt('cf', 16)],
        ['#222222', parseInt('df', 16)],
        ['#000000', parseInt('ef', 16)],
        ['#ffeeff', parseInt('00', 16)],
        ['#ff99aa', parseInt('01', 16)],
        ['#ee5599', parseInt('02', 16)],
        ['#ff66aa', parseInt('03', 16)],
        ['#ff0066', parseInt('04', 16)],
        ['#bb4477', parseInt('05', 16)],
        ['#cc0055', parseInt('06', 16)],
        ['#990033', parseInt('07', 16)],
        ['#552233', parseInt('08', 16)],
        ['#ffbbcc', parseInt('10', 16)],
        ['#ff7777', parseInt('11', 16)],
        ['#dd3210', parseInt('12', 16)],
        ['#ff5544', parseInt('13', 16)],
        ['#ff0000', parseInt('14', 16)],
        ['#cc6666', parseInt('15', 16)],
        ['#bb4444', parseInt('16', 16)],
        ['#bb0000', parseInt('17', 16)],
        ['#882222', parseInt('18', 16)],
        ['#ddcdbb', parseInt('20', 16)],
        ['#ffcd66', parseInt('21', 16)],
        ['#dd6622', parseInt('22', 16)],
        ['#ffaa22', parseInt('23', 16)],
        ['#ff6600', parseInt('24', 16)],
        ['#bb8855', parseInt('25', 16)],
        ['#dd4400', parseInt('26', 16)],
        ['#bb4400', parseInt('27', 16)],
        ['#663210', parseInt('28', 16)],
        ['#ffeedd', parseInt('30', 16)],
        ['#ffddcc', parseInt('31', 16)],
        ['#ffcdaa', parseInt('32', 16)],
        ['#ffbb88', parseInt('33', 16)],
        ['#ffaa88', parseInt('34', 16)],
        ['#dd8866', parseInt('35', 16)],
        ['#bb6644', parseInt('36', 16)],
        ['#995533', parseInt('37', 16)],
        ['#884422', parseInt('38', 16)],
        ['#ffcdff', parseInt('40', 16)],
        ['#ee88ff', parseInt('41', 16)],
        ['#cc66dd', parseInt('42', 16)],
        ['#bb88cc', parseInt('43', 16)],
        ['#cc00ff', parseInt('44', 16)],
        ['#996699', parseInt('45', 16)],
        ['#8800aa', parseInt('46', 16)],
        ['#550077', parseInt('47', 16)],
        ['#330044', parseInt('48', 16)],
        ['#ffbbff', parseInt('50', 16)],
        ['#ff99ff', parseInt('51', 16)],
        ['#dd22bb', parseInt('52', 16)],
        ['#ff55ee', parseInt('53', 16)],
        ['#ff00cc', parseInt('54', 16)],
        ['#885577', parseInt('55', 16)],
        ['#bb0099', parseInt('56', 16)],
        ['#880066', parseInt('57', 16)],
        ['#550044', parseInt('58', 16)],
        ['#ddbb99', parseInt('60', 16)],
        ['#ccaa77', parseInt('61', 16)],
        ['#774433', parseInt('62', 16)],
        ['#aa7744', parseInt('63', 16)],
        ['#993200', parseInt('64', 16)],
        ['#773222', parseInt('65', 16)],
        ['#552200', parseInt('66', 16)],
        ['#331000', parseInt('67', 16)],
        ['#221000', parseInt('68', 16)],
        ['#ffffcc', parseInt('70', 16)],
        ['#ffff77', parseInt('71', 16)],
        ['#dddd22', parseInt('72', 16)],
        ['#ffff00', parseInt('73', 16)],
        ['#ffdd00', parseInt('74', 16)],
        ['#ccaa00', parseInt('75', 16)],
        ['#999900', parseInt('76', 16)],
        ['#887700', parseInt('77', 16)],
        ['#555500', parseInt('78', 16)],
        ['#ddbbff', parseInt('80', 16)],
        ['#bb99ee', parseInt('81', 16)],
        ['#6632cc', parseInt('82', 16)],
        ['#9955ff', parseInt('83', 16)],
        ['#6600ff', parseInt('84', 16)],
        ['#554488', parseInt('85', 16)],
        ['#440099', parseInt('86', 16)],
        ['#220066', parseInt('87', 16)],
        ['#221033', parseInt('88', 16)],
        ['#bbbbff', parseInt('90', 16)],
        ['#8899ff', parseInt('91', 16)],
        ['#3332aa', parseInt('92', 16)],
        ['#3355ee', parseInt('93', 16)],
        ['#0000ff', parseInt('94', 16)],
        ['#333288', parseInt('95', 16)],
        ['#0000aa', parseInt('96', 16)],
        ['#101066', parseInt('97', 16)],
        ['#000022', parseInt('98', 16)],
        ['#99eebb', parseInt('a0', 16)],
        ['#66cd77', parseInt('a1', 16)],
        ['#226610', parseInt('a2', 16)],
        ['#44aa33', parseInt('a3', 16)],
        ['#008833', parseInt('a4', 16)],
        ['#557755', parseInt('a5', 16)],
        ['#225500', parseInt('a6', 16)],
        ['#103222', parseInt('a7', 16)],
        ['#002210', parseInt('a8', 16)],
        ['#ddffbb', parseInt('b0', 16)],
        ['#ccff88', parseInt('b1', 16)],
        ['#88aa55', parseInt('b2', 16)],
        ['#aadd88', parseInt('b3', 16)],
        ['#88ff00', parseInt('b4', 16)],
        ['#aabb99', parseInt('b5', 16)],
        ['#66bb00', parseInt('b6', 16)],
        ['#559900', parseInt('b7', 16)],
        ['#336600', parseInt('b8', 16)],
        ['#bbddff', parseInt('c0', 16)],
        ['#77cdff', parseInt('c1', 16)],
        ['#335599', parseInt('c2', 16)],
        ['#6699ff', parseInt('c3', 16)],
        ['#1077ff', parseInt('c4', 16)],
        ['#4477aa', parseInt('c5', 16)],
        ['#224477', parseInt('c6', 16)],
        ['#002277', parseInt('c7', 16)],
        ['#001044', parseInt('c8', 16)],
        ['#aaffff', parseInt('d0', 16)],
        ['#55ffff', parseInt('d1', 16)],
        ['#0088bb', parseInt('d2', 16)],
        ['#55bbcc', parseInt('d3', 16)],
        ['#00cdff', parseInt('d4', 16)],
        ['#4499aa', parseInt('d5', 16)],
        ['#006688', parseInt('d6', 16)],
        ['#004455', parseInt('d7', 16)],
        ['#002233', parseInt('d8', 16)],
        ['#ccffee', parseInt('e0', 16)],
        ['#aaeedd', parseInt('e1', 16)],
        ['#33cdaa', parseInt('e2', 16)],
        ['#55eebb', parseInt('e3', 16)],
        ['#00ffcc', parseInt('e4', 16)],
        ['#77aaaa', parseInt('e5', 16)],
        ['#00aa99', parseInt('e6', 16)],
        ['#008877', parseInt('e7', 16)],
        ['#004433', parseInt('e8', 16)],
        ['#aaffaa', parseInt('f0', 16)],
        ['#77ff77', parseInt('f1', 16)],
        ['#66dd44', parseInt('f2', 16)],
        ['#00ff00', parseInt('f3', 16)],
        ['#22dd22', parseInt('f4', 16)],
        ['#55bb55', parseInt('f5', 16)],
        ['#00bb00', parseInt('f6', 16)],
        ['#008800', parseInt('f7', 16)],
        ['#224422', parseInt('f8', 16)]
    ]);
    function hex2rgb(hex) {
        let rgb = [0, 0, 0];
        let bigInt = parseInt(hex.slice(1), 16);
        rgb[0] = (bigInt >> 16) & 255;
        rgb[1] = (bigInt >> 8) & 255;
        rgb[2] = bigInt & 255;
        return rgb;
    }
    Color.hex2rgb = hex2rgb;
    function rgb2hex(rgb) {
        return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    }
    Color.rgb2hex = rgb2hex;
    function isEqualRGB(color1, color2) {
        if (color1[0] != color2[0]) {
            return false;
        }
        if (color1[1] != color2[1]) {
            return false;
        }
        if (color1[2] != color2[2]) {
            return false;
        }
        return true;
    }
    Color.isEqualRGB = isEqualRGB;
    function EuclideanColorDistance(c1, c2) {
        return Math.sqrt(Math.pow(c1[0] - c2[0], 2) +
            Math.pow(c1[1] - c2[2], 2) +
            Math.pow(c1[2] - c2[2], 2));
    }
    Color.EuclideanColorDistance = EuclideanColorDistance;
    /**
     * https://github.com/antimatter15/rgb-lab
     * @param rgbA
     * @param rgbB
     */
    function deltaE(rgbA, rgbB) {
        let labA = rgb2lab(rgbA);
        let labB = rgb2lab(rgbB);
        let deltaL = labA[0] - labB[0];
        let deltaA = labA[1] - labB[1];
        let deltaB = labA[2] - labB[2];
        let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
        let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
        let deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        let sc = 1.0 + 0.045 * c1;
        let sh = 1.0 + 0.015 * c1;
        let deltaLKlsl = deltaL / (1.0);
        let deltaCkcsc = deltaC / (sc);
        let deltaHkhsh = deltaH / (sh);
        let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }
    Color.deltaE = deltaE;
    function rgb2lab(rgb) {
        let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
    }
    Color.rgb2lab = rgb2lab;
    function lab2rgb(lab) {
        var y = (lab[0] + 16) / 116, x = lab[1] / 500 + y, z = y - lab[2] / 200, r, g, b;
        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);
        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.2040 + z * 1.0570;
        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b;
        return [Math.max(0, Math.min(1, r)) * 255,
            Math.max(0, Math.min(1, g)) * 255,
            Math.max(0, Math.min(1, b)) * 255];
    }
    Color.lab2rgb = lab2rgb;
})(Color || (Color = {}));
//# sourceMappingURL=Color.js.map