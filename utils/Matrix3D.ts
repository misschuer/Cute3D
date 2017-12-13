class Matrix3D implements Clonable<Matrix3D> {
	public static E = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
	public static sharedMatrix3D:Matrix3D = new Matrix3D();

	public data:Float32Array;

	public constructor() {
		this.data = new Float32Array(Matrix3D.E);
	}

    public copyTo(dst: Matrix3D): void {
        dst.data[ 0] = this.data[0];
        dst.data[ 1] = this.data[1];
        dst.data[ 2] = this.data[2];
        dst.data[ 3] = this.data[3];
        dst.data[ 4] = this.data[4];
        dst.data[ 5] = this.data[5];
        dst.data[ 6] = this.data[6];
        dst.data[ 7] = this.data[7];
        dst.data[ 8] = this.data[8];
        dst.data[ 9] = this.data[9];
        dst.data[10] = this.data[10];
        dst.data[11] = this.data[11];
        dst.data[12] = this.data[12];
        dst.data[13] = this.data[13];
        dst.data[14] = this.data[14];
        dst.data[15] = this.data[15];
    }

    public identity(): void {
        this.data[ 0] = 1;
        this.data[ 1] = 0;
        this.data[ 2] = 0;
        this.data[ 3] = 0;
        this.data[ 4] = 0;
        this.data[ 5] = 1;
        this.data[ 6] = 0;
        this.data[ 7] = 0;
        this.data[ 8] = 0;
        this.data[ 9] = 0;
        this.data[10] = 1;
        this.data[11] = 0;
        this.data[12] = 0;
        this.data[13] = 0;
        this.data[14] = 0;
        this.data[15] = 1;
    }

    public inverse(): Matrix3D {
        var a: Float32Array = this.data;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,

            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) {
            return null;
        }
        det = 1.0 / det;

        this.data[ 0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        this.data[ 1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        this.data[ 2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        this.data[ 3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        this.data[ 4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        this.data[ 5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        this.data[ 6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        this.data[ 7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        this.data[ 8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        this.data[ 9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        this.data[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        this.data[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        this.data[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        this.data[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        this.data[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        this.data[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return this;
    }

    public invertToMatrix(dst: Matrix3D): void {
        var a: Float32Array = this.data;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,

            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) {
            return null;
        }
        det = 1.0 / det;

        dst.data[ 0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        dst.data[ 1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        dst.data[ 2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        dst.data[ 3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        dst.data[ 4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        dst.data[ 5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        dst.data[ 6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        dst.data[ 7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        dst.data[ 8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        dst.data[ 9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        dst.data[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        dst.data[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        dst.data[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        dst.data[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        dst.data[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        dst.data[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    }

    public transpose():Matrix3D {
        var a: Float32Array = this.data;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        this.data[ 0] = a00;
        this.data[ 1] = a10;
        this.data[ 2] = a20;
        this.data[ 3] = a30;
        this.data[ 4] = a01;
        this.data[ 5] = a11;
        this.data[ 6] = a21;
        this.data[ 7] = a31;
        this.data[ 8] = a02;
        this.data[ 9] = a12;
        this.data[10] = a22;
        this.data[11] = a32;
        this.data[12] = a03;
        this.data[13] = a13;
        this.data[14] = a23;
        this.data[15] = a33;

        return this;
    }

    public transposeToMatrix(dst: Matrix3D):void {
        var a: Float32Array = this.data;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        dst.data[ 0] = a00;
        dst.data[ 1] = a10;
        dst.data[ 2] = a20;
        dst.data[ 3] = a30;
        dst.data[ 4] = a01;
        dst.data[ 5] = a11;
        dst.data[ 6] = a21;
        dst.data[ 7] = a31;
        dst.data[ 8] = a02;
        dst.data[ 9] = a12;
        dst.data[10] = a22;
        dst.data[11] = a32;
        dst.data[12] = a03;
        dst.data[13] = a13;
        dst.data[14] = a23;
        dst.data[15] = a33;
    }

    public transformVector(p: Vector3D): Vector3D {
		 
        var out: Vector3D = new Vector3D();
        out.x = this.data[ 0] * p.x + this.data[ 4] * p.y + this.data[ 8] * p.z + this.data[12] * p.w;
        out.y = this.data[ 1] * p.x + this.data[ 5] * p.y + this.data[ 9] * p.z + this.data[13] * p.w;
        out.z = this.data[ 2] * p.x + this.data[ 6] * p.y + this.data[10] * p.z + this.data[14] * p.w;
        out.w = this.data[ 3] * p.x + this.data[ 7] * p.y + this.data[11] * p.z + this.data[15] * p.w;

        return out;
    }

    public append(src: Matrix3D): void {

        Matrix3D.sharedMatrix3D.data[ 0] = src.data[ 0];
        Matrix3D.sharedMatrix3D.data[ 1] = src.data[ 1];
        Matrix3D.sharedMatrix3D.data[ 2] = src.data[ 2];
        Matrix3D.sharedMatrix3D.data[ 3] = src.data[ 3];
        Matrix3D.sharedMatrix3D.data[ 4] = src.data[ 4];
        Matrix3D.sharedMatrix3D.data[ 5] = src.data[ 5];
        Matrix3D.sharedMatrix3D.data[ 6] = src.data[ 6];
        Matrix3D.sharedMatrix3D.data[ 7] = src.data[ 7];
        Matrix3D.sharedMatrix3D.data[ 8] = src.data[ 8];
        Matrix3D.sharedMatrix3D.data[ 9] = src.data[ 9];
        Matrix3D.sharedMatrix3D.data[10] = src.data[10];
        Matrix3D.sharedMatrix3D.data[11] = src.data[11];
        Matrix3D.sharedMatrix3D.data[12] = src.data[12];
        Matrix3D.sharedMatrix3D.data[13] = src.data[13];
        Matrix3D.sharedMatrix3D.data[14] = src.data[14];
        Matrix3D.sharedMatrix3D.data[15] = src.data[15];

        Matrix3D.sharedMatrix3D.prepend(this);

        this.data[ 0] = Matrix3D.sharedMatrix3D.data[ 0];
        this.data[ 1] = Matrix3D.sharedMatrix3D.data[ 1];
        this.data[ 2] = Matrix3D.sharedMatrix3D.data[ 2];
        this.data[ 3] = Matrix3D.sharedMatrix3D.data[ 3];
        this.data[ 4] = Matrix3D.sharedMatrix3D.data[ 4];
        this.data[ 5] = Matrix3D.sharedMatrix3D.data[ 5];
        this.data[ 6] = Matrix3D.sharedMatrix3D.data[ 6];
        this.data[ 7] = Matrix3D.sharedMatrix3D.data[ 7];
        this.data[ 8] = Matrix3D.sharedMatrix3D.data[ 8];
        this.data[ 9] = Matrix3D.sharedMatrix3D.data[ 9];
        this.data[10] = Matrix3D.sharedMatrix3D.data[10];
        this.data[11] = Matrix3D.sharedMatrix3D.data[11];
        this.data[12] = Matrix3D.sharedMatrix3D.data[12];
        this.data[13] = Matrix3D.sharedMatrix3D.data[13];
        this.data[14] = Matrix3D.sharedMatrix3D.data[14];
        this.data[15] = Matrix3D.sharedMatrix3D.data[15];
    }

    public prepend(src: Matrix3D): void {

        var b = src.data;
        var out: Float32Array = this.data;
        var a: Float32Array = this.data;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        // Cache only the current line of the second matrix
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[ 0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[ 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[ 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[ 4]; b1 = b[ 5]; b2 = b[ 6]; b3 = b[ 7];
        out[ 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[ 6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[ 7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[ 8]; b1 = b[ 9]; b2 = b[10]; b3 = b[11];
        out[ 8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    }

	// 平移
	public appendTranslation(x: number, y: number, z: number): void {

        Matrix3D.sharedMatrix3D.identity();
        Matrix3D.sharedMatrix3D.prependTranslation(x, y, z);
        this.append(Matrix3D.sharedMatrix3D)
    }

    public prependTranslation(x: number, y: number, z: number): void {
        var out: Float32Array = this.data;
        out[12] = out[0] * x + out[4] * y + out[ 8] * z + out[12];
        out[13] = out[1] * x + out[5] * y + out[ 9] * z + out[13];
        out[14] = out[2] * x + out[6] * y + out[10] * z + out[14];
        out[15] = out[3] * x + out[7] * y + out[11] * z + out[15];
    }

	// 旋转
    public appendRotation(degree: number, axis: Vector3D): void {

        Matrix3D.sharedMatrix3D.identity()
        Matrix3D.sharedMatrix3D.prependRotation(degree, axis);
        this.append(Matrix3D.sharedMatrix3D)
    }

	public prependRotation(degree: number, axis: Vector3D): Float32Array {

        var out: Float32Array = this.data;
        var a: Float32Array = this.data;
        var x = axis.x, y = axis.y, z = axis.z,
            len = Math.sqrt(x * x + y * y + z * z),
            s, c, t,
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            b00, b01, b02,
            b10, b11, b12,
            b20, b21, b22;

        if (Math.abs(len) < 1E-6) { 
			return null;
		}

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(degree * Math.PI / 180);
        c = Math.cos(degree * Math.PI / 180);
        t = 1 - c;

        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;

        if (a !== out) { // If the source and destination differ, copy the unchanged last row
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    }

	// 缩放
    public prependScale(x: number, y: number, z: number): Float32Array {

        var a: Float32Array = this.data;
        var out: Float32Array = this.data;

        out[ 0] = a[ 0] * x;
        out[ 1] = a[ 1] * x;
        out[ 2] = a[ 2] * x;
        out[ 3] = a[ 3] * x;
        out[ 4] = a[ 4] * y;
        out[ 5] = a[ 5] * y;
        out[ 6] = a[ 6] * y;
        out[ 7] = a[ 7] * y;
        out[ 8] = a[ 8] * z;
        out[ 9] = a[ 9] * z;
        out[10] = a[10] * z;
        out[11] = a[11] * z;
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];

        return out;
    };

    public appendScale(x: number, y: number, z: number): void {

        Matrix3D.sharedMatrix3D.identity();
        Matrix3D.sharedMatrix3D.prependScale(x, y, z);
        this.append(Matrix3D.sharedMatrix3D);
    }

	    // public tomat3(): Float32Array {
    //     var mk = Array.prototype.concat.apply([], arguments);
    //     mk = [
    //         1, 0, 0,
    //         0, 1, 0,
    //         0, 0, 1
    //     ];
    //     var b: Float32Array = new Float32Array(mk);
    //     b[0] = this.data[0];
    //     b[1] = this.data[1];
    //     b[2] = this.data[2];
    //     b[3] = this.data[4];
    //     b[4] = this.data[5];
    //     b[5] = this.data[6];
    //     b[6] = this.data[8];
    //     b[7] = this.data[9];
    //     b[8] = this.data[10]
    //     return b;

    // }

    // public getRotaion(b: Float32Array): void {
    //     b[0] = this.data[0];
    //     b[1] = this.data[1];
    //     b[2] = this.data[2];
    //     b[3] = this.data[4];
    //     b[4] = this.data[5];
    //     b[5] = this.data[6];
    //     b[6] = this.data[8];
    //     b[7] = this.data[9];
    //     b[8] = this.data[10];
    // }


    // public identityPostion(): void {
    //     this.data[12] = 0
    //     this.data[13] = 0
    //     this.data[14] = 0
    // }
    // public get x(): number {
    //     return this.data[12];
    // }
    // public get y(): number {
    //     return this.data[13];
    // }
    // public get z(): number {
    //     return this.data[14];
    // }

    // public fromVtoV($basePos: Vector3D, $newPos: Vector3D): void {
    //     var axis: Vector3D = $basePos.cross($newPos);
    //     var angle: number = Math.acos($basePos.dot($newPos));
    //     var q: Quaternion = new Quaternion();
    //     q.fromAxisAngle(axis, angle);
    //     q.toMatrix3D(this);
    // }
    // public buildLookAtLH(eyePos: Vector3D, lookAt: Vector3D, up: Vector3D): void {
    //     var out: Float32Array = this.m;
    //     var zaxis: Vector3D = new Vector3D;
    //     zaxis.x = lookAt.x - eyePos.x
    //     zaxis.y = lookAt.y - eyePos.y
    //     zaxis.z = lookAt.z - eyePos.z



    //     zaxis.normalize();

    //     var xaxis: Vector3D = up.cross(zaxis);
    //     xaxis.normalize();

    //     var yaxis: Vector3D = zaxis.cross(xaxis);

    //     out[0] = xaxis.x;
    //     out[1] = yaxis.x;
    //     out[2] = zaxis.x;
    //     out[3] = 0.0;

    //     out[4] = xaxis.y;
    //     out[5] = yaxis.y;
    //     out[6] = zaxis.y;
    //     out[7] = 0.0;

    //     out[8] = xaxis.z;
    //     out[9] = yaxis.z;
    //     out[10] = zaxis.z;
    //     out[11] = 0.0;

    //     out[12] = -xaxis.dot(eyePos);
    //     out[13] = -yaxis.dot(eyePos);
    //     out[14] = -zaxis.dot(eyePos);
    //     out[15] = 1.0;


    // }
    // public toEulerAngles(target: Vector3D = null): Vector3D {
    //     var $q: Quaternion = new Quaternion();
    //     $q.fromMatrix(this)
    //     return $q.toEulerAngles(target);
    // }

    /**
     * 方便点的操作
     */
    public setPosition(x:number, y:number, z:number):void {
        this.data[12] = x;
        this.data[13] = y;
        this.data[14] = z;
        this.data[15] = 1;
    }

    public getPosition(vec:Vector3D):void {
        vec.reset(this.data[12], this.data[13], this.data[14], this.data[15]);
    }

	public position(): Vector3D {
        return new Vector3D(this.data[12], this.data[13], this.data[14], this.data[15]);
    }

	public clone():Matrix3D {

		var dst:Matrix3D = new Matrix3D();

	    dst.data[ 0] = this.data[ 0];
        dst.data[ 1] = this.data[ 1];
        dst.data[ 2] = this.data[ 2];
        dst.data[ 3] = this.data[ 3];
        dst.data[ 4] = this.data[ 4];
        dst.data[ 5] = this.data[ 5];
        dst.data[ 6] = this.data[ 6];
        dst.data[ 7] = this.data[ 7];
        dst.data[ 8] = this.data[ 8];
        dst.data[ 9] = this.data[ 9];
        dst.data[10] = this.data[10];
        dst.data[11] = this.data[11];
        dst.data[12] = this.data[12];
        dst.data[13] = this.data[13];
        dst.data[14] = this.data[14];
        dst.data[15] = this.data[15];

		return dst;
	}
}