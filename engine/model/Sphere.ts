class Sphere {
	// x = r sinθ cosφ
	// y = r cosθ
	// z = r sinθ sinφ

	private radius;
	// θ
	private latitudeBands;
	// φ
	private longitudeBands;

	public constructor(radius, latitudeBands, longitudeBands) {
		this.radius = radius;
		this.latitudeBands = latitudeBands;
		this.longitudeBands = longitudeBands;
	}

	public getSphereData():SphereData {
		var indexData = [];
        var normalData = [];
        var textureCoordData = [];
		var vertexPositionData = [];

		for (var latiNum = 0; latiNum <= this.latitudeBands; ++ latiNum) {
			var theta = latiNum * Math.PI / this.latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for (var longiNum = 0; longiNum <= this.longitudeBands; ++ longiNum) {
				var phi = longiNum * 2 * Math.PI / this.longitudeBands;
				var unitX = sinTheta * Math.cos(phi);
				var unitY = cosTheta;
				var unitZ = sinTheta * Math.sin(phi);

				// 顶点数据
				vertexPositionData.push(this.radius * unitX);
				vertexPositionData.push(this.radius * unitY);
				vertexPositionData.push(this.radius * unitZ);

				// 发现数据
				normalData.push(unitX);
				normalData.push(unitY);
				normalData.push(unitZ);

				// uv数据
				var u = (longiNum / this.longitudeBands);
				var v = (latiNum  / this.latitudeBands);
				textureCoordData.push(u);
				textureCoordData.push(v);
			}
		}

		for (var latNumber = 0; latNumber < this.latitudeBands; ++ latNumber) {
            for (var longNumber = 0; longNumber < this.longitudeBands; ++ longNumber) {
                var first = (latNumber * (this.longitudeBands + 1)) + longNumber;
                var second = first + this.longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

		var sd:SphereData = new SphereData();
		sd.indexData			=			 indexData;
		sd.normalData 			= 			normalData;
		sd.textureCoordData		= 	  textureCoordData;
		sd.vertexPositionData	= 	vertexPositionData;
		return sd;
	}
}