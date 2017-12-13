class Utils {
	private static EPS = 1E-8;
	private constructor() {}

	public static checkIfInfinityNearZero(val:number):number {
		if (Math.abs(val) <= Utils.EPS) {
			return 0;
		}
		return val;
	}

	public static degToRad(degree:number):number {
        return degree * Math.PI / 180.0;
    }

	public static radToDeg(radian:number):number {
		return radian * 180.0 / Math.PI;
	}
}