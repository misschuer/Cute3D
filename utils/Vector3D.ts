class Vector3D extends VectorBase<Vector3D> implements Clonable<Vector3D> {
	public static X_AXIS: Vector3D = new Vector3D(1, 0, 0);
    public static Y_AXIS: Vector3D = new Vector3D(0, 1, 0);
    public static Z_AXIS: Vector3D = new Vector3D(0, 0, 1);

	public x: number;
	public y: number;
	public z: number;
	public w: number;

	public constructor(x: number = 0, y: number = 0, z: number = 0, w : number = 1) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	public normalize(): void {
		var len: number = this.length();
        if (len == 0) {
            return;
        }
        this.scaleBy(1.0 / len);
    }

	public negate():void {

	}

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public scaleBy(value: number): void {
        this.x *= value;
        this.y *= value;
		this.z *= value;
    }

	public scaleByW(): void {
        this.scaleBy(this.w);
    }

	public clone():Vector3D {
		return new Vector3D(this.x, this.y, this.z);
	}

    public distance(p2:Vector3D): number {

        var xx: number = this.x - p2.x;
        var yy: number = this.y - p2.y;
		var zz: number = this.z - p2.z;

        return Math.sqrt(xx * xx + yy * yy + zz * zz);
    }

	public divideScalar(value: number): void {
        if (value != 0) {
            this.x = this.x / value;
            this.y = this.y / value;
            this.z = this.z / value;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
    }

	public add(value: Vector3D): Vector3D {
        return new Vector3D(this.x + value.x, this.y + value.y, this.z + value.z);
    }

    public subtract(value: Vector3D): Vector3D {
        return new Vector3D(this.x - value.x, this.y - value.y, this.z - value.z);
    }

    public modifyByNum3D(x:number, y:number, z:number): void {
        this.x += x;
        this.y += y;
        this.z += z;
    }

    public reset(x: number, y: number, z: number, w:number=1): void {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public cross(value: Vector3D): Vector3D {
        return new Vector3D(this.y * value.z - this.z * value.y,
            this.z * value.x - this.x * value.z,
            this.x * value.y - this.y * value.x);
    }

    public dot(value: Vector3D): number {
        return this.x * value.x + this.y * value.y + this.z * value.z;
    }

    public toArray():Array<number> {
        return [this.x, this.y, this.z];
    }
}