class Engine implements Tick<void> {
	private static engine:Engine = null;

	private constructor() {}

	public static getInstance():Engine {
		if (Engine.engine == null) {
			Engine.engine = new Engine();
		}

		return Engine.engine;
	}

	public init(canvas:HTMLCanvasElement, fragShaderInfo:any, vertShaderInfo:any):void {
		Context3D.getInstance().init(canvas, fragShaderInfo, vertShaderInfo);
	}

	public update(param:any):void {
		Context3D.getInstance().update(param);
	}
}