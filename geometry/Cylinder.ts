class Cylinder {

	private constructor() {}
	private static instance:Cylinder = null;
	public static getInstance():Cylinder {
		if (!Cylinder.instance) {
			Cylinder.instance = new Cylinder();
		}
		return Cylinder.instance;
	}

	/**
	 * 圆柱
	 * @param -radius : 上下圆半径 <br>
	 * @param -length : 柱体长度
	 * @param -latitudeBands : 柱体长度分割个数
	 * @param -longitudeBands : 圆分割个数
	 */
	public getCylinderData(radius, length, latitudeBands, longitudeBands):GeometryData {
		return this.getPillarData(radius, radius, length, latitudeBands, longitudeBands);
	}

	/**
	 * 棱柱
	 * @param -minorRadius : 顶面中心到各个点的距离
	 * @param -majorRadius : 底面中心到各个点的距离
	 * @param -length : 柱体长度
	 * @param -longitudeBands : 面分割个数
	 */
	public getPrismData(minorRadius, majorRadius, length, longitudeBands):GeometryData {
		return this.getPillarData(minorRadius, majorRadius, length, 1, longitudeBands);
	}

	/**
	 * 圆台
	 * @param -minorRadius : 上圆半径
	 * @param -majorRadius : 下圆半径
	 * @param -length : 柱体长度
	 * @param -latitudeBands : 柱体长度分割个数
	 * @param -longitudeBands : 圆分割个数
	 */
	public getPillarData(minorRadius, majorRadius, length, latitudeBands, longitudeBands):GeometryData {
		var half = length / 2;
		var vertexPositionData = [];
		var indexData = [];
		var textureCoordData = [];
		var normalData = [];
		var offset = 0;

		// 上圆面
		offset = vertexPositionData.length / 3;
		Circle.getInstance().calCircleData(vertexPositionData, textureCoordData, normalData, indexData, -half, minorRadius, longitudeBands, offset, -1);
		// 下圆面
		offset = vertexPositionData.length / 3;
		Circle.getInstance().calCircleData(vertexPositionData, textureCoordData, normalData, indexData, half, majorRadius, longitudeBands, offset, 1);
		// 柱体
		offset = vertexPositionData.length / 3;
		var part = 2 * Math.PI / longitudeBands;
		var si = length / latitudeBands;
		for (var latiNum = 0; latiNum <= latitudeBands; ++ latiNum) {
			var z = latiNum * si - half;
			var r = majorRadius - minorRadius;
			var radius = minorRadius + r * latiNum / latitudeBands;
			for (var longi = 0; longi <= longitudeBands; ++ longi) {
				var theta = longi * part;
				var unitX = Math.sin(theta);
				var unitY = Math.cos(theta);
				// 顶点
				vertexPositionData.push(unitX * radius);
				vertexPositionData.push(unitY * radius);
				vertexPositionData.push(z);
				// 贴图坐标
				var u = 1 - latiNum / latitudeBands;
				var v = 1 - longi / longitudeBands;
				textureCoordData.push(u);
				textureCoordData.push(v);
				// 法线
				normalData.push(unitX);
				normalData.push(unitY);
				normalData.push(0);
			}
		}
		
		for (var latiNum = 0; latiNum < latitudeBands; ++ latiNum) {
			for (var longi = 0; longi < longitudeBands; ++ longi) {
                var first = (latiNum * (longitudeBands + 1)) + longi + offset;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

		var sd:GeometryData = new GeometryData();
		sd.indexData			=			 indexData;
		sd.normalData 			= 			normalData;
		sd.textureCoordData		= 	  textureCoordData;
		sd.vertexPositionData	= 	vertexPositionData;
		return sd;
	}
}