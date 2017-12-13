class Cone {

	private constructor() {}
	private static instance:Cone = null;
	public static getInstance():Cone {
		if (!Cone.instance) {
			Cone.instance = new Cone();
		}
		return Cone.instance;
	}

	/**
	 * 圆锥
	 * 
	 * @param -radius : 底圆半径
	 * @param -length : 柱体长度
	 * @param -latitudeBands : 柱体长度分割个数
	 * @param -longitudeBands : 圆分割个数
	 */
	public getCircularConeData(radius, length, latitudeBands, longitudeBands):GeometryData {
		return Cylinder.getInstance().getPillarData(0, radius, length, latitudeBands, longitudeBands);
	}

	/**
	 * 棱锥
	 * 
	 * @param -radius : 底面中心到各个点的距离
	 * @param -height : 高度
	 * @param -longitudeBands : 边数
	 */
	public getPyramidData(radius, height, longitudeBands) {
		return Cylinder.getInstance().getPrismData(0, radius, height, longitudeBands);
	}
}