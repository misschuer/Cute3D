class Quaternion implements Clonable<Quaternion> {
	x: number = 0;
    y: number = 0;
    z: number = 0;
    w: number = 1;

    constructor($x: number = 0, $y: number = 0, $z: number = 0, $w: number = 1) {
        this.x = $x;
        this.y = $y;
        this.z = $z;
        this.w = $w;
    }

    public  toEulerAngles() : Vector3D {

        var target = new Vector3D();

        var x: number = this.x, y: number = this.y, z: number = this.z, w: number = this.w;
        target.x = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
        target.y = Math.asin(2 * (w * y - z * x));
        target.z = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));

        return target;
    }

    public toMatrix3D(): Matrix3D {

        var matrix3d = new Matrix3D;
        
        var out: any = matrix3d.data;
        var x: number = this.x, y: number = this.y, z: number = this.z, w: number = this.w,
            x2: number = x + x,
            y2: number = y + y,
            z2: number = z + z,

            xx: number = x * x2,
            yx: number = y * x2,
            yy: number = y * y2,
            zx: number = z * x2,
            zy: number = z * y2,
            zz: number = z * z2,
            wx: number = w * x2,
            wy: number = w * y2,
            wz: number = w * z2;

        out[0] = 1 - yy - zz;
        out[1] = yx + wz;
        out[2] = zx - wy;
        out[3] = 0;

        out[4] = yx - wz;
        out[5] = 1 - xx - zz;
        out[6] = zy + wx;
        out[7] = 0;

        out[8] = zx + wy;
        out[9] = zy - wx;
        out[10] = 1 - xx - yy;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return matrix3d;
    }

    public fromAxisAngle(axis: Vector3D, angle: number): void {
        var sin_a: number = Math.sin(angle / 2);
        var cos_a: number = Math.cos(angle / 2);

        this.x = axis.x * sin_a;
        this.y = axis.y * sin_a;
        this.z = axis.z * sin_a;
        this.w = cos_a;
        this.normalize();
    }

    public normalize(val: number = 1): void {
        var mag: number = val / Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);

        this.x *= mag;
        this.y *= mag;
        this.z *= mag;
        this.w *= mag;
    }

    public fromMatrix(matrix: Matrix3D): void {

        var m: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        m[0] = matrix.data[0];
        m[1] = matrix.data[1];
        m[2] = matrix.data[2];

        m[3] = matrix.data[4];
        m[4] = matrix.data[5];
        m[5] = matrix.data[6];


        m[6] = matrix.data[8];
        m[7] = matrix.data[9];
        m[8] = matrix.data[10];



        var fTrace: number = m[0] + m[4] + m[8];
        var fRoot: number;
        var out: any = [0, 0, 0, 0];

        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;  // 1/(4w)
            out[0] = (m[5] - m[7]) * fRoot;
            out[1] = (m[6] - m[2]) * fRoot;
            out[2] = (m[1] - m[3]) * fRoot;
        } else {
            // |w| <= 1/2
            var i: number = 0;
            if (m[4] > m[0])
                i = 1;
            if (m[8] > m[i * 3 + i])
                i = 2;
            var j: number = (i + 1) % 3;
            var k: number = (i + 2) % 3;

            fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
            out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
            out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
        }

        this.x = out[0];
        this.y = out[1];
        this.z = out[2];
        this.w = out[3];

    }

    public setMd5W(): void {
        this.w = 1 - (this.x * this.x + this.y * this.y + this.z * this.z);
        if (this.w < 0) {
            this.w = 0
        } else {
            this.w = -Math.sqrt(this.w);
        }
    }

	public clone():Quaternion {
		return new Quaternion(this.x, this.y, this.z, this.w);
	}
}