class Vector2D extends VectorBase<Vector2D> implements Clonable<Vector2D> {
	private x: number;
	private y: number;

	public constructor(x: number = 0, y: number = 0) {
        super();
		this.x = x;
		this.y = y;
	}

    /**
     * 设置45度角的向量
     */
    public set45Vector():void {
        this.x = 1;
        this.y = 1;
    }

    public get X():number {
        return this.x;
    }

    public get Y():number {
        return this.y;
    }

    public cal45CircleCoordinate(tar:Vector2D, isPositive:boolean):Vector2D {
        var dest:Vector2D = new Vector2D();
        if (isPositive) {
            dest.x = this.x;
            dest.y = tar.y;
        } else {
            dest.x = tar.x;
            dest.y = this.y;
        }

        return dest;
    }

	public normalize(): void {
		var len: number = this.length();
        if (len == 0) {
            return;
        }
        this.scaleBy(1.0 / len);
    }

    public transform(vec:Vector2D, isPositive:boolean = true):void {
        if (isPositive) {
            this.x += vec.x;
            this.y += vec.y;
        } else {
            this.x -= vec.x;
            this.y -= vec.y;
        }
    }

    public transformXY(tx:number, ty:number, isPositive:boolean = true):void {
        if (isPositive) {
            this.x += tx;
            this.y += ty;
        } else {
            this.x -= tx;
            this.y -= ty;
        }
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public rotate(rad:number):void {
        var dx:number = this.x * Math.cos(rad) - this.y * Math.sin(rad);
        var dy:number = this.x * Math.sin(rad) + this.y * Math.cos(rad);
        this.x = dx;
        this.y = dy;
    }

    public scaleBy(value: number): void {
        this.x *= value;
        this.y *= value;
    }

    public scaleByXY(sx: number, sy:number): void {
        this.x *= sx;
        this.y *= sy;
    }

	public clone():Vector2D {
		return new Vector2D(this.x, this.y);
	}

    public copyTo(dest:Vector2D):void {
        dest.x = this.x;
        dest.y = this.y;
    }

    public distance(p2:Vector2D): number {
        var xx: number = this.x - p2.x;
        var yy: number = this.y - p2.y;
        return Math.sqrt(xx * xx + yy * yy);
    }

    public toString():string {
        return "(" + this.x + "," + this.y + ")";
    }
}