class Camera3D {
	private static camera:Camera3D = null;

	private x;
	private y;
	private z;

	private constructor() {}

	public static getInstance():Camera3D {
		if (!Camera3D.camera) {
			Camera3D.camera = new Camera3D();
		}
		return Camera3D.camera;
	}

	/**
	 * 设置相机位置
	 */
	public setCameraCoordinate(x, y, z):void {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * 获得相机矩阵
	 */
	public getCameraMatrix(radX:number, radY:number):Matrix3D {
		var mat:Matrix3D = new Matrix3D();
		
		mat.appendRotation(-radX, Vector3D.X_AXIS);
		mat.appendRotation(-radY, Vector3D.Y_AXIS);
		mat.appendTranslation(-this.x, -this.y, -this.z);

		return mat;
	}
}