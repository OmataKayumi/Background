"use strict";
class LifeGame {
    constructor(option) {
        //フィールドのサイズ(番兵は含めない)
        this._fieldSize = { x: 64, y: 36 };
        //もし引数があれば設定
        if (option) {
            //フィールドサイズの設定
            if (option.fieldSize) {
                this._fieldSize = option.fieldSize;
                //もしサイズが0以下であればエラー
                if (option.fieldSize.x < 1 || option.fieldSize.y < 1) {
                    throw new Error("Out of Range");
                }
            }
        }
        //フィールドの初期化
        this._cells = new Array();
        //番兵が必要なので+2
        for (let j = 0; j < this._fieldSize.y + 2; j++) {
            this._cells.push(new Array());
            //番兵が必要なので+2
            for (let i = 0; i < this._fieldSize.x + 2; i++) {
                this._cells[j].push(Math.random() < 0.5 ? 1 : 0);
            }
        }
    }
    /**
     * 番兵の更新
     */
    updateSentinel() {
        for (let j = 0; j < this._fieldSize.y + 2; j++) {
            this._cells[j][0] = this._cells[j][this._fieldSize.x];
            this._cells[j][this._fieldSize.x + 1] = this._cells[j][1];
        }
        for (let i = 0; i < this._fieldSize.x + 2; i++) {
            this._cells[0][i] = this._cells[this._fieldSize.y][i];
            this._cells[this._fieldSize.y + 1][i] = this._cells[1][i];
        }
    }
    /**
     * セルの設定
     * @param x
     * @param y
     * @param aliveFlag default true. (Alive)
     */
    setCell(x, y, aliveFlag = true) {
        //もし指定した座標が範囲外ならエラー
        if (x < 0 || this._fieldSize.x <= x || y < 0 || this._fieldSize.y <= y) {
            throw new Error("Out of Range");
        }
        //セルを設定(番兵がいるので+1)
        this._cells[y + 1][x + 1] = aliveFlag ? 1 : 0;
        //もしフィールドの境界に設定した場合、番兵も更新
        this.updateSentinel();
    }
    /**
     * セルの取得
     * @param x x座標
     * @param y y座標
     * @returns (Dead = 0, Alive > 0)
     */
    getCell(x, y) {
        //もし指定した座標が範囲外ならエラー
        if (x < 0 || this._fieldSize.x <= x || y < 0 || this._fieldSize.y <= y) {
            throw new Error("Out of Range");
        }
        return this._cells[y + 1][x + 1];
    }
    /**
     * サイズの取得
     */
    getSize() {
        return { x: this._fieldSize.x, y: this._fieldSize.y };
    }
    /**
     * 世代の更新
     */
    next() {
        //フィールドの初期化
        let newCells = new Array();
        //番兵が必要なので+2
        for (let j = 0; j < this._fieldSize.y + 2; j++) {
            newCells.push(new Array());
            //番兵が必要なので+2
            for (let i = 0; i < this._fieldSize.x + 2; i++) {
                newCells[j].push(0);
            }
        }
        for (let j = 0; j < this._fieldSize.y; j++) {
            for (let i = 0; i < this._fieldSize.x; i++) {
                let count = 0;
                for (let v = -1; v < 2; v++) {
                    for (let u = -1; u < 2; u++) {
                        if (u == 0 && v == 0) {
                            continue;
                        }
                        count += this._cells[j + 1 + v][i + 1 + u] ? 1 : 0;
                    }
                }
                //
                if (count == 3) {
                    newCells[j + 1][i + 1] = count;
                }
                if (count == 2) {
                    newCells[j + 1][i + 1] = this._cells[j + 1][i + 1] ? count : 0;
                }
                if (count < 2 || 3 < count) {
                    newCells[j + 1][i + 1] = 0;
                }
            }
        }
        this._cells = JSON.parse(JSON.stringify(newCells));
        this.updateSentinel();
    }
}
class Canvas {
    constructor(canvas) {
        if (!canvas) {
            throw new Error("Canvas is null");
        }
        if (canvas instanceof HTMLCanvasElement) {
            this._canvas = canvas;
        }
        else {
            throw new Error("Canvas is not HTMLCanvasElement");
        }
        let ctx = this._canvas.getContext("2d");
        if (ctx) {
            this._ctx = ctx;
        }
        else {
            throw new Error("Context is null");
        }
    }
    get ctx() {
        return this._ctx;
    }
    get size() {
        return {
            width: this._canvas.width,
            height: this._canvas.height
        };
    }
    resize() {
        const parent = this._canvas.parentElement;
        if (!parent) {
            throw new Error('Parent is null');
        }
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        this._canvas.setAttribute("width", width.toString());
        this._canvas.setAttribute("height", height.toString());
    }
}
window.onload = function () {
    const game = new LifeGame();
    const canvas = new Canvas(document.getElementById("canvas"));
    const cellImg = new Image();
    let gameSize = game.getSize();
    cellImg.src = "./img/block.png";
    setInterval(() => {
        for (let j = 0; j < gameSize.y; j++) {
            for (let i = 0; i < gameSize.x; i++) {
                if (Math.floor(Math.random() * gameSize.y * gameSize.x) % (gameSize.y * gameSize.x) == 0) {
                    game.setCell(i, j);
                }
            }
        }
        //描画処理
        let canvasSize = canvas.size;
        let cellSize = { width: canvasSize.width / gameSize.x, height: canvasSize.height / gameSize.y };
        //画面のリサイズと背景の塗りつぶし
        canvas.resize();
        canvas.ctx.fillStyle = "black";
        canvas.ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
        console.log('-----');
        for (let j = 0; j < gameSize.y; j++) {
            let s = "";
            for (let i = 0; i < gameSize.x; i++) {
                //ベースのセル画像を描画
                canvas.ctx.globalCompositeOperation = "source-over";
                canvas.ctx.drawImage(cellImg, i * cellSize.width, j * cellSize.height, cellSize.width, cellSize.height);
                //セルの色を設定(背景)
                canvas.ctx.globalCompositeOperation = "multiply";
                canvas.ctx.fillStyle = `rgb(${(32 / gameSize.y) * j} ${(32 / gameSize.x) * i} ${32 - ((32 / gameSize.y) * j + (32 / gameSize.x) * i) / 2})`;
                //セルが生きている場合は明るく
                if (game.getCell(i, j)) {
                    canvas.ctx.fillStyle = `rgb(${(255 / gameSize.y) * j / 2} ${(255 / gameSize.x) * i / 2} ${255 - ((255 / gameSize.y) * j + (255 / gameSize.x) * i) / 2})`;
                }
                //セルの色の合成
                canvas.ctx.fillRect(i * cellSize.width, j * cellSize.height, cellSize.width, cellSize.height);
                s += ' ' + (game.getCell(i, j) ? game.getCell(i, j) : '.');
            }
            console.log(`${('00' + j).slice(-2)} |${s}`);
        }
        //次世代へ
        game.next();
    }, 1000 / 1);
};
