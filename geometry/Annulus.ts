class Annulus {

	private constructor() {}
	private static instance:Annulus = null;
	public static getInstance():Annulus {
		if (!Annulus.instance) {
			Annulus.instance = new Annulus();
		}
		return Annulus.instance;
	}

	public getAnnulusData(outerRadius, innerRadius, longitudeBands):GeometryData {
		var vertexPositionData = [];
		var indexData = [];
		var textureCoordData = [];
		var normalData = [];

		var rs = [outerRadius, innerRadius];
		for (var i = 0; i < rs.length; ++ i) {
			var radius = rs[ i ];
			var part = 2 * Math.PI / longitudeBands;
			for (var longi = 0; longi <= longitudeBands; ++ longi) {
				var theta = longi * part;
				var unitX = Math.sin(theta);
				var unitY = Math.cos(theta);
				// 顶点
				vertexPositionData.push(unitX * radius);
				vertexPositionData.push(unitY * radius);
				vertexPositionData.push(0);
				// 贴图坐标
				var u = unitX / 2 * radius / outerRadius + 0.5;
				var v = unitY / 2 * radius / outerRadius + 0.5;
				textureCoordData.push(u);
				textureCoordData.push(v);
				// 法线位置
				normalData.push(0);
				normalData.push(0);
				normalData.push(-1);
			}
		}

		for (var longNumber = 0; longNumber < longitudeBands; ++ longNumber) {
			var first = longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);

			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}

		var sd:GeometryData = new GeometryData();
		sd.indexData			=			 indexData;
		sd.normalData 			= 			normalData;
		sd.textureCoordData		= 	  textureCoordData;
		sd.vertexPositionData	= 	vertexPositionData;
		return sd;
	}
}