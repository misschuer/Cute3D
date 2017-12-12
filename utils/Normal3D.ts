class Normal3D {
	private static instance:Normal3D;

	private constructor() {}

	public static getIntance():Normal3D {
		if (!Normal3D.instance) {
			Normal3D.instance = new Normal3D();
		}
		return Normal3D.instance;
	}

	/**
	 * @param => matrix:模型矩阵
	 */
	public getNormalsMatrixWithClone(matrix:Matrix3D):Matrix3D {
		return matrix.clone().inverse().transpose();
	}

	/**
	 * @param => matrix:模型矩阵
	 */
	public calNormalsMatrix(matrix:Matrix3D):void {
		matrix.inverse().transpose();
	}
}