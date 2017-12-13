class Cuboid {

	private constructor() {}
	private static instance:Cuboid = null;
	public static getInstance():Cuboid {
		if (!Cuboid.instance) {
			Cuboid.instance = new Cuboid();
		}
		return Cuboid.instance;
	}

	public getCuboidData(width, height, length):GeometryData {
		var halfX = width / 2;
		var halfY = height / 2;
		var halfZ = length / 2;

		var vertexPositionData = [
			// Front face
            -halfX, -halfY, -halfZ,
             halfX, -halfY, -halfZ,
             halfX,  halfY, -halfZ,
            -halfX,  halfY, -halfZ,

            // Back face
            -halfX, -halfY, halfZ,
            -halfX,  halfY, halfZ,
             halfX,  halfY, halfZ,
             halfX, -halfY, halfZ,

            // Top face
            -halfX,  halfY,  halfZ,
            -halfX,  halfY, -halfZ,
             halfX,  halfY, -halfZ,
             halfX,  halfY,  halfZ,

            // Bottom face
            -halfX, -halfY,  halfZ,
             halfX, -halfY,  halfZ,
             halfX, -halfY, -halfZ,
            -halfX, -halfY, -halfZ,

            // Right face
             halfX, -halfY,  halfZ,
             halfX,  halfY,  halfZ,
             halfX,  halfY, -halfZ,
             halfX, -halfY, -halfZ,

            // Left face
            -halfX, -halfY,  halfZ,
            -halfX, -halfY, -halfZ,
            -halfX,  halfY, -halfZ,
            -halfX,  halfY,  halfZ,
		];
		
		var indexData = [
			0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
		];

		// 圆心的贴图位置
		var textureCoordData = [
			// Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
		];

		var normalData = [
			// Front face
             0.0,  0.0,  -1.0,
             0.0,  0.0,  -1.0,
             0.0,  0.0,  -1.0,
             0.0,  0.0,  -1.0,
 
            // Back face
             0.0,  0.0, 1.0,
             0.0,  0.0, 1.0,
             0.0,  0.0, 1.0,
             0.0,  0.0, 1.0,
 
            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
 
            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
 
            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
 
            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
		];



		var sd:GeometryData = new GeometryData();
		sd.indexData			=			 indexData;
		sd.normalData 			= 			normalData;
		sd.textureCoordData		= 	  textureCoordData;
		sd.vertexPositionData	= 	vertexPositionData;
		return sd;
	}
}