class Texture {
	private static instance:Texture;

	public static getInstance():Texture {
		if (!Texture.instance) {
			Texture.instance = new Texture();
		}
		return Texture.instance;
	}

	public loadImage(src:string, callback:Function, index:number = 0):void {
		var image = new Image();
		image.onload = function () {
			callback(image, index);
		}
		image.src = src;
	}

	public loadImages(srcArray:Array<string>, callback:Function) {
		var count = 0;
		var size = srcArray.length;
		// 全部填满先
		var dest:Array<any> = new Array<any>();
		for (var i = 0; i < size; ++ i) {
			dest.push(null);
		}

		var func:Function = function(image, index) {
			dest[index] = image;
			count ++;
			if (count == size) {
				callback(dest);
			}
		}

		for (var i = 0; i < srcArray.length; ++ i) {
			Texture.getInstance().loadImage(srcArray[ i ], func, i);
		}
	}
}