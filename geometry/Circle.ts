class Circle {
	
	private constructor() {}
	private static instance:Circle = null;
	public static getInstance():Circle {
		if (!Circle.instance) {
			Circle.instance = new Circle();
		}
		return Circle.instance;
	}

	public getCircleData(radius, longitudeBands):GeometryData {
		var vertexPositionData = [];
		var indexData = [];
		var textureCoordData = [];
		var normalData = [];

		this.calCircleData(vertexPositionData, textureCoordData, normalData, indexData, 0, radius, longitudeBands, 0, -1);

		var sd:GeometryData = new GeometryData();
		sd.indexData			=			 indexData;
		sd.normalData 			= 			normalData;
		sd.textureCoordData		= 	  textureCoordData;
		sd.vertexPositionData	= 	vertexPositionData;
		return sd;
	}

	public calCircleData(vertexPositionData, textureCoordData, normalData, indexData, z, radius, longitudeBands, offset, normalZ):void {
		vertexPositionData.push(0);
		vertexPositionData.push(0);
		vertexPositionData.push(z);

		textureCoordData.push(0.5);
		textureCoordData.push(0.5);

		normalData.push(0);
		normalData.push(0);
		normalData.push(normalZ);

		var part = 2 * Math.PI / longitudeBands;
		for (var longi = 0; longi <= longitudeBands; ++ longi) {
			var theta = longi * part;
			var unitX = Math.sin(theta);
			var unitY = Math.cos(theta);
			// 顶点
			vertexPositionData.push(unitX * radius);
			vertexPositionData.push(unitY * radius);
			vertexPositionData.push(z);
			// 贴图坐标
			textureCoordData.push(unitX / 2 + 0.5);
			textureCoordData.push(unitY / 2 + 0.5);

			normalData.push(0);
			normalData.push(0);
			normalData.push(normalZ);

			if (longi > 0) {
				indexData.push(longi+offset);
				indexData.push(offset);
				indexData.push(longi+offset+1);
			}
		}
	}
}