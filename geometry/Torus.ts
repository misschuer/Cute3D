class Torus {

	private constructor() {}
	private static instance:Torus = null;
	public static getInstance():Torus {
		if (!Torus.instance) {
			Torus.instance = new Torus();
		}
		return Torus.instance;
	}

	/**
	 * x(θ, φ) = (R + rcosθ) * cosφ
	 * y(θ, φ) = (R + rcosθ) * sinφ
	 * z(θ, φ) = rsinθ
	 * R is the distance from the center of the tube to the center of the torus,
	 * r is the radius of the tube.
	 * θ is for r
	 * φ is for R
	 */
	public getTorusData(R, r, RCount, rCount):GeometryData {
		var vertexPositionData = [];
		var indexData = [];
		var textureCoordData = [];
		var normalData = [];

		var mat4:Matrix3D = new Matrix3D();
		var vec:Vector3D = new Vector3D(0, 0, 0);
		for (var RNum = 0; RNum <= RCount; ++ RNum) {
			var phi = RNum * 2 * Math.PI / RCount;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			if (RNum == 0 || RNum == RCount) {
				sinPhi = 0;
				cosPhi = 1;
			}

			for (var rNum = 0; rNum <= rCount; ++ rNum) {
				var theta = rNum * 2 * Math.PI / rCount;
				var sinTheta = Math.sin(theta);
				var cosTheta = Math.cos(theta);

				if (rNum == 0 || rNum == rCount) {
					sinTheta = 0;
					cosTheta = 1;
				}
				
				var x = (R + r * cosTheta) * cosPhi;
				var y = (R + r * cosTheta) * sinPhi;
				var z = r * sinTheta;
				
				// 顶点数据
				vertexPositionData.push(x);
				vertexPositionData.push(y);
				vertexPositionData.push(z);
				
				// 法线数据
				var deg = Utils.radToDeg(phi);
				mat4.setPosition(x, y, z);
				mat4.appendRotation(-deg, Vector3D.Z_AXIS);
				mat4.appendTranslation(-R, 0, 0);
				mat4.appendRotation(deg, Vector3D.Z_AXIS);
				mat4.getPosition(vec);
				vec.normalize();
				normalData.push(vec.x);
				normalData.push(vec.y);
				normalData.push(vec.z);

				// normalData.push(0);
				// normalData.push(0);
				// normalData.push(1);

				// uv数据
				var u = 1 - (RNum / RCount);
				var v = 1 - (rNum  / rCount);
				textureCoordData.push(u);
				textureCoordData.push(v);
			}
		}

		for (var RNum = 0; RNum < RCount; ++ RNum) {
            for (var rNum = 0; rNum < rCount; ++ rNum) {
                var first = (RNum * (rCount + 1)) + rNum;
                var second = first + rCount + 1;
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