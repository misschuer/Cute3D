class PerspectiveMatrix3D extends Matrix3D {

	public constructor() {
		super();
	}

	public perspectiveFieldOfViewLH(fieldOfViewY:number, 
									aspectRatio:number, 
									zNear:number, 
									zFar:number):void {
		var yScale:number = 1.0/Math.tan(fieldOfViewY/2.0); 
		var xScale:number = yScale / aspectRatio;

		this.data[ 0] = xScale;
		this.data[ 1] = 0;
		this.data[ 2] = 0;
		this.data[ 3] = 0;
		this.data[ 4] = 0;
		this.data[ 5] = yScale;
		this.data[ 6] = 0;
		this.data[ 7] = 0;
		this.data[ 8] = 0;
		this.data[ 9] = 0;
		this.data[10] = zFar / (zFar - zNear);
		this.data[11] = 1;
		this.data[12] = 0;
		this.data[13] = 0;
		this.data[14] = (zNear * zFar) / (zNear - zFar);
		this.data[15] = 0;
	}
}