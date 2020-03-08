/*
  OLED12864 display image block
*/

//% color=#006464 weight=20 icon="\uf1b9" block="displayImage"
namespace oled12864_image {

    let _I2CAddr = 60;
    let _screen = pins.createBuffer(1025);
    let _buf2 = pins.createBuffer(2);
    let _buf3 = pins.createBuffer(3);
    let _buf4 = pins.createBuffer(4);
    let _ZOOM = 1;

    function cmd1(d: number) {
        let n = d % 256;
        pins.i2cWriteNumber(_I2CAddr, n, NumberFormat.UInt16BE);
    }

    function cmd2(d1: number, d2: number) {
        _buf3[0] = 0;
        _buf3[1] = d1;
        _buf3[2] = d2;
        pins.i2cWriteBuffer(_I2CAddr, _buf3);
    }

    function cmd3(d1: number, d2: number, d3: number) {
        _buf4[0] = 0;
        _buf4[1] = d1;
        _buf4[2] = d2;
        _buf4[3] = d3;
        pins.i2cWriteBuffer(_I2CAddr, _buf4);
    }

    function set_pos(col: number = 0, page: number = 0) {
        cmd1(0xb0 | page) // page number
        let c = col * (_ZOOM + 1)
        cmd1(0x00 | (c % 16)) // lower start column address
        cmd1(0x10 | (c >> 4)) // upper start column address    
    }

    // clear bit
    function clrbit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    /**
	 * TODO: display image
     * @param x X座標。, eg: 0
     * @param y Y座標。, eg: 0
     * @param xs Xサイズ。, eg: 64
     * @param ys Yサイズ。, eg: 8
     * @param zoom ズーム。, eg: true
     * @param bitmap ビットマップ。, eg: "01001001"
     * @param color 表示色 。, eg: 1
     */
    //% blockId="displayImage" block="dispalyImage X%x Y%y xSize%xs ySize%ys Zoom%zoom bitmap%bitmap color%color"
    //% weight=92 blockGap=10
    export function showImage(x: number, y: number, xs: number, ys: number, zoom: boolean = true, image: string, color: number = 1) {
        let col = 0
        let pos = 0
        let ind = 0
        _ZOOM = (zoom) ? 1 : 0
        for (let i = 0; i < xs; i++) {
            col = 0
            for (let j = 0; j < ys; j++) {
                if ((image.charAt(i + j * xs)) == '1')
                    col |= (1 << j)
            }
            ind = i * (_ZOOM + 1) + 1
            if (color == 0)
                col = 255 - col
            _screen[ind] = col
            if (zoom)
                _screen[ind + 1] = col
        }
        set_pos(x, y)
        let buf = _screen.slice(0, xs * (_ZOOM + 1) + 1)
        buf[0] = 0x40
        pins.i2cWriteBuffer(_I2CAddr, buf)
    }
    /**
     * TODO: OLEDにビットマップを反転して表示する（X座標、Y座標、Xサイズ、Yサイズ、ズーム、ビット文字列、表示色）
     * @param x X座標。, eg: 0
     * @param y Y座標。, eg: 0
     * @param xs Xサイズ。, eg: 64
     * @param ys Yサイズ。, eg: 8
     * @param zoom ズーム。, eg: true
     * @param bitmap ビットマップ。, eg: "01001001"
     * @param color 表示色 。, eg: 1
     */
    //% blockId="displayImageRev" block="dispalyImageRev X%x Y%y xSize%xs ySize%ys Zoom%zoom bitmap%bitmap color%color"
    //% weight=92 blockGap=10
    export function showImageRev(x: number, y: number, xs: number, ys: number, zoom: boolean = true, image: string, color: number = 1) {
        let col = 0
        let pos = 0
        let ind = 0
        _ZOOM = (zoom) ? 1 : 0
        for (let i = xs; i > 0; i--) {
            col = 0
            for (let j = ys; j > 0; j--) {
                if ((image.charAt((i - 1) + (j - 1) * xs)) == '1')
                    col |= (1 << (8 - j))
            }
            ind = (xs - i) * (_ZOOM + 1) + 1
            if (color == 0)
                col = 255 - col
            _screen[ind] = col
            if (zoom)
                _screen[ind + 1] = col
        }
        set_pos(128 - (x - xs) * (_ZOOM + 1), (8 / (_ZOOM + 1) - y - (ys / 8)))
        let buf = _screen.slice(0, xs * (_ZOOM + 1) + 1)
        buf[0] = 0x40
        pins.i2cWriteBuffer(_I2CAddr, buf)
    }
}
