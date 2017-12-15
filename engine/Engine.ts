class Engine implements Tick<void> {
	private static engine:Engine = null;

	private constructor() {}

	public static getInstance():Engine {
		if (Engine.engine == null) {
			Engine.engine = new Engine();
		}

		return Engine.engine;
	}

	public init(canvas:HTMLCanvasElement, shaderInfo:Object):void {
		Context3D.getInstance().init(canvas, shaderInfo);
	}

	public update(param:any):void {
		Context3D.getInstance().update(param);
	}
}