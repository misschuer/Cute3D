class UIManager {

    private static instance: UIManager;
    public static getInstance(): UIManager {
        if (!this.instance) {
            this.instance = new UIManager();
        }
        return this.instance;
    }

    private _ctx: CanvasRenderingContext2D;
    private _canvas: any;

    public constructor() {
        this._canvas = document.createElement("canvas");
        this._canvas.style.zIndex = "3";
        this._canvas.width = 200;
        this._canvas.height = 200;
        this._canvas.style.left = 200;
        this._canvas.style.top = 300;

        this._ctx = this._canvas.getContext("2d");
    }

    public getContext2D($width: number, $height: number): CanvasRenderingContext2D {
        this._canvas.width = $width;
        this._canvas.height = $height;
        this._ctx.clearRect(0, 0, $width, $height);
        return this._ctx;
    }
} 