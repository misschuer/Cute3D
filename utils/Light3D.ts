class Light3D {
	private x;
	private y;
	private z;

	public constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public getReflectVector3D():Vector3D {
		var vec:Vector3D = new Vector3D(this.x, this.y, this.z);
		vec.normalize();
		vec.scaleBy(-1);
		return vec;
	}
}