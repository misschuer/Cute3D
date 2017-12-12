class Texture {
	private static instance:Texture;

	public static getInstance():Texture {
		if (!Texture.instance) {
			Texture.instance = new Texture();
		}
		return Texture.instance;
	}

	public loadImage(src:string, callback:Function):void {
		var image = new Image();
		image.onload = function () {
			callback(image);
        }
        image.src = src;
	}

	public loadImages(srcArray:Array<string>, callback:Function) {
		var count = 0;
		var size = srcArray.length;
		var dest:Array<any> = new Array<any>();

		var func:Function = function(image) {
			dest.push(image);
			count ++;
			if (count == size) {
				callback(dest);
			}
		}

		for (var i = 0; i < srcArray.length; ++ i) {
			Texture.getInstance().loadImage(srcArray[ i ], func);
		}
	}
}