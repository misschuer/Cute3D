class Sphere {
	
	private constructor() {}
	private static instance:Sphere = null;
	public static getInstance():Sphere {
		if (!Sphere.instance) {
			Sphere.instance = new Sphere();
		}
		return Sphere.instance;
	}

	/**
	 * x = r sinθ cosφ
	 * y = r cosθ
	 * z = r sinθ sinφ
	 */
	public getSphereData(radius, latitudeBands, longitudeBands):GeometryData {
		var indexData = [];
        var normalData = [];
        var textureCoordData = [];
		var vertexPositionData = [];

		for (var latiNum = 0; latiNum <= latitudeBands; ++ latiNum) {
			var theta = latiNum * Math.PI / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for (var longiNum = 0; longiNum <= longitudeBands; ++ longiNum) {
				var phi = longiNum * 2 * Math.PI / longitudeBands;
				var unitX = sinTheta * Math.cos(phi);
				var unitY = cosTheta;
				var unitZ = sinTheta * Math.sin(phi);

				// 顶点数据
				vertexPositionData.push(radius * unitX);
				vertexPositionData.push(radius * unitY);
				vertexPositionData.push(radius * unitZ);

				// 法线数据
				normalData.push(unitX);
				normalData.push(unitY);
				normalData.push(unitZ);

				// uv数据
				var u = 1 - (longiNum / longitudeBands);
				var v = 1 - (latiNum  / latitudeBands);
				textureCoordData.push(u);
				textureCoordData.push(v);
			}
		}

		for (var latNumber = 0; latNumber < latitudeBands; ++ latNumber) {
            for (var longNumber = 0; longNumber < longitudeBands; ++ longNumber) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
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