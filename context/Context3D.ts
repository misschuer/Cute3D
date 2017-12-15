class Context3D implements Tick<void> {
	private static context:Context3D = null;

	private renderContext:WebGLRenderingContext = null;
	private width:number;
	private height:number;

    private worldVertexPositionBuffer;
    private worldVertexTextureCoordBuffer;

    private pMatrix:PerspectiveMatrix3D = new PerspectiveMatrix3D();
    private mvMatrix:Matrix3D = new Matrix3D();

    private mvMatrixStack = [];

	private shaderProgram = null;
    private shaderLightFragProgram = null;

	private canv:CanvasRenderingContext2D = null; 

	private times = 0;
    private filter = 0;

    private xRot = 0;
    private xSpeed = 0;
 
    private yRot = 0;
    private ySpeed = 0;

    private xTilt = 0;
    private tilt = 0;
    private spin = 0;
    private w = -Math.PI / 60;

    private stars:Array<Star> = [];
 
    private z = 15;
    private isLoaded = false;

	private constructor() {}

	public static getInstance():Context3D {
		if (Context3D.context == null) {
			Context3D.context = new Context3D();
		}

		return Context3D.context;
	}

	public init(canvas:HTMLCanvasElement, shaderInfo:Object): void {
		if (this.renderContext != null) {
			return;
		}

		// 初始化渲染器
		this.initRenderContext(canvas);

		// 初始化着色器
		this.initShaders(shaderInfo);

		// 初始化缓存
		this.initBuffers();

		this.initTexture();

        // 载入世界
        // this.loadWorld();


		this.renderContext.clearColor(0, 0, 0, 1);
		this.renderContext.enable(this.renderContext.DEPTH_TEST);

        var obj = this;

        // document.onkeydown = function(event) {
        //     obj.handleKeyDown(event);
        // };

        // document.onkeyup = function(event) {
        //     obj.handleKeyUp(event);
        // };

        canvas.onmousedown      = function(event) {
            obj.handleMouseDown(event);
        };

        document.onmouseup      = function(event) {
            obj.handleMouseUp(event);
        };

        document.onmousemove    = function(event) {
            obj.handleMouseMove(event);
        };

		//this.drawScene();
	}

    private mouseDown = false;
    private lastMouseX = null;
    private lastMouseY = null;

    private moonRotationMatrix = new Matrix3D();

    private handleMouseDown(event) {
        this.mouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    private handleMouseUp(event):void {
        this.mouseDown = false;
    }

    private handleMouseMove(event):void {
        if (!this.mouseDown) {
            return;
        }
        // var newX = event.clientX;
        // var newY = event.clientY;

        // var deltaX = this.lastMouseX - newX;
        // var newRotationMatrix = new Matrix3D();
        // newRotationMatrix.appendRotation(deltaX / 10, Vector3D.Y_AXIS);

        // var deltaY = this.lastMouseY - newY;
        // newRotationMatrix.appendRotation(deltaY / 10, Vector3D.X_AXIS);

        // this.moonRotationMatrix.append(newRotationMatrix);

        // this.lastMouseX = newX;
        // this.lastMouseY = newY;
    }

    private currentlyPressedKeys:Object = new Object();

    private handleKeyDown(event):void {
        this.currentlyPressedKeys[event.keyCode] = true;
 
        if (String.fromCharCode(event.keyCode) == "F") {
            this.filter += 1;
            if (this.filter == 3) {
                this.filter = 0;
            }
        }
    }

    private handleKeyUp(event):void {
        this.currentlyPressedKeys[event.keyCode] = false;
    }

	private initRenderContext(canvas:HTMLCanvasElement): void {
		this.renderContext = canvas.getContext('webgl', { stencil: true, alpha: true, depth: true, antialias: false })
            ||  canvas.getContext('experimental-webgl', { stencil: true, alpha: true, depth: true, antialias: false });
		
		this.width  = canvas.width;
		this.height = canvas.height;
		this.renderContext.viewport(0, 0, canvas.width, canvas.height);
	}

	private initShaders(shaderInfo:any):void {
        this.initShader1(shaderInfo);
        this.initShader2(shaderInfo);
	}

    private initShader1(shaderInfo:any):void {
        var fragShaderInfo = shaderInfo.fragShaderInfo;
        var vertShaderInfo = shaderInfo.vertShaderInfo
		var fragShader = this.getShader(fragShaderInfo);
		var vertShader = this.getShader(vertShaderInfo);

		this.shaderProgram = this.renderContext.createProgram();
		this.renderContext.attachShader(this.shaderProgram, vertShader);
		this.renderContext.attachShader(this.shaderProgram, fragShader);

        // link之前绑定attribute 变量的位置 gl.bindAttribLocation(program, 10, "position");

		this.renderContext.linkProgram(this.shaderProgram);

		if (!this.renderContext.getProgramParameter(this.shaderProgram, this.renderContext.LINK_STATUS)) {
			// alert("Could not initialise shaders");
			// return;
            throw "program filed to link:" + this.renderContext.getProgramInfoLog (this.shaderProgram);
		}


		this.renderContext.useProgram(this.shaderProgram);
        // 坐标点
		this.shaderProgram.vertexPositionAttribute = this.renderContext.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.renderContext.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
        // uv位置
		this.shaderProgram.aTextureCoord = this.renderContext.getAttribLocation(this.shaderProgram, "aTextureCoord");
		this.renderContext.enableVertexAttribArray(this.shaderProgram.aTextureCoord);
        // 法线
        this.shaderProgram.aVertexNormal = this.renderContext.getAttribLocation(this.shaderProgram, "aVertexNormal");
		this.renderContext.enableVertexAttribArray(this.shaderProgram.aVertexNormal);
        // 贴图
		this.shaderProgram.samplerUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uSampler");
        // 透视矩阵
		this.shaderProgram.pMatrixUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uPMatrix");
        // 活动矩阵
		this.shaderProgram.mvMatrixUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uMVMatrix");
        // 法线矩阵
        this.shaderProgram.mNMatrixUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uNMatrix");

        this.shaderProgram.useLightingUniform             = this.renderContext.getUniformLocation(this.shaderProgram, "uUseLighting"      );
        this.shaderProgram.useTexturesUniform             = this.renderContext.getUniformLocation(this.shaderProgram, "uUseTextures"      );
        this.shaderProgram.ambientColorUniform            = this.renderContext.getUniformLocation(this.shaderProgram, "uAmbientColor"     );
        this.shaderProgram.pointLightingColorUniform      = this.renderContext.getUniformLocation(this.shaderProgram, "uPointLightingColor" );
        this.shaderProgram.pointLightingLocationUniform   = this.renderContext.getUniformLocation(this.shaderProgram, "uPointLightingLocation");
    }

    private initShader2(shaderInfo:any):void {
        var fragShaderInfo = shaderInfo.frag2ShaderInfo;
        var vertShaderInfo = shaderInfo.vert2ShaderInfo
		var fragShader = this.getShader(fragShaderInfo);
		var vertShader = this.getShader(vertShaderInfo);

		this.shaderLightFragProgram = this.renderContext.createProgram();
		this.renderContext.attachShader(this.shaderLightFragProgram, vertShader);
		this.renderContext.attachShader(this.shaderLightFragProgram, fragShader);

        // link之前绑定attribute 变量的位置 gl.bindAttribLocation(program, 10, "position");

		this.renderContext.linkProgram(this.shaderLightFragProgram);

		if (!this.renderContext.getProgramParameter(this.shaderLightFragProgram, this.renderContext.LINK_STATUS)) {
			// alert("Could not initialise shaders");
			// return;
            throw "program filed to link:" + this.renderContext.getProgramInfoLog (this.shaderLightFragProgram);
		}


		this.renderContext.useProgram(this.shaderLightFragProgram);
        // 坐标点
		this.shaderLightFragProgram.vertexPositionAttribute = this.renderContext.getAttribLocation(this.shaderLightFragProgram, "aVertexPosition");
        this.renderContext.enableVertexAttribArray(this.shaderLightFragProgram.vertexPositionAttribute);
        // uv位置
		this.shaderLightFragProgram.aTextureCoord = this.renderContext.getAttribLocation(this.shaderLightFragProgram, "aTextureCoord");
		this.renderContext.enableVertexAttribArray(this.shaderLightFragProgram.aTextureCoord);
        // 法线
        this.shaderLightFragProgram.aVertexNormal = this.renderContext.getAttribLocation(this.shaderLightFragProgram, "aVertexNormal");
		this.renderContext.enableVertexAttribArray(this.shaderLightFragProgram.aVertexNormal);
        // 透视矩阵
		this.shaderLightFragProgram.pMatrixUniform = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uPMatrix");
        // 活动矩阵
		this.shaderLightFragProgram.mvMatrixUniform = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uMVMatrix");
        // 法线矩阵
        this.shaderLightFragProgram.mNMatrixUniform = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uNMatrix");

         // 贴图
		this.shaderLightFragProgram.samplerUniform = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uSampler");

        this.shaderLightFragProgram.useLightingUniform              = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uUseLighting"      );
        this.shaderLightFragProgram.useTexturesUniform              = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uUseTextures"      );
        this.shaderLightFragProgram.ambientColorUniform             = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uAmbientColor"     );
        this.shaderLightFragProgram.pointLightingColorUniform       = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uPointLightingColor" );
        this.shaderLightFragProgram.pointLightingLocationUniform    = this.renderContext.getUniformLocation(this.shaderLightFragProgram, "uPointLightingLocation");
    }


    private initBuffers():void {
        // var longitudeBands = 36;
        // var latitudeBands = 36;
        // var radius = 2;
        // var sd:GeometryData = Sphere.getInstance().getSphereData(radius, latitudeBands, longitudeBands);
        // var sd:GeometryData = Circle.getInstance().getCircleData(radius, longitudeBands);
        // var sd:GeometryData = Cuboid.getInstance().getCuboidData(2, 2, 2);
        // var sd:GeometryData = Annulus.getInstance().getAnnulusData(2, 1, 36);
        // var sd:GeometryData = Torus.getInstance().getTorusData(3, 1, 36, 36);
        // var sd:GeometryData = Cylinder.getInstance().getPillarData(1, 1, 3, 1, 3);
        // var sd:GeometryData = Cone.getInstance().getPyramidData(1, 1.732, 3);
        this.initMoonBuffer();
        this.initCrateBuffer();
    }

    private moonVertexPositionBuffer;
    private moonVertexNormalBuffer;
    private moonVertexTextureCoordBuffer;
    private moonVertexIndexBuffer;

    private initMoonBuffer():void {
        var longitudeBands = 36;
        var latitudeBands = 36;
        var radius = 1;
        var sd:GeometryData = Sphere.getInstance().getSphereData(radius, latitudeBands, longitudeBands);

        // 顶点坐标
        this.moonVertexPositionBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexPositionBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(sd.vertexPositionData), this.renderContext.STATIC_DRAW);
        this.moonVertexPositionBuffer.itemSize = 3;
        this.moonVertexPositionBuffer.numItems = sd.vertexPositionData.length / 3;

        // 贴图数据
        this.moonVertexTextureCoordBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexTextureCoordBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(sd.textureCoordData), this.renderContext.STATIC_DRAW);
        this.moonVertexTextureCoordBuffer.itemSize = 2;
        this.moonVertexTextureCoordBuffer.numItems = sd.textureCoordData.length / 2;

        // 法线数据
        this.moonVertexNormalBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexNormalBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(sd.normalData), this.renderContext.STATIC_DRAW);
        this.moonVertexNormalBuffer.itemSize = 3;
        this.moonVertexNormalBuffer.numItems = sd.normalData.length / 3;

        // 索引数据
        this.moonVertexIndexBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.moonVertexIndexBuffer);
        this.renderContext.bufferData(this.renderContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(sd.indexData), this.renderContext.STATIC_DRAW);
        this.moonVertexIndexBuffer.itemSize = 1;
        this.moonVertexIndexBuffer.numItems = sd.indexData.length;
    }


    private crateVertexPositionBuffer;
    private crateVertexNormalBuffer;
    private crateVertexTextureCoordBuffer;
    private crateVertexIndexBuffer;

    private initCrateBuffer():void {
        var length = 2;
        var sd:GeometryData = Cuboid.getInstance().getCuboidData(length, length, length);

        // 顶点坐标
        this.crateVertexPositionBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.crateVertexPositionBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(sd.vertexPositionData), this.renderContext.STATIC_DRAW);
        this.crateVertexPositionBuffer.itemSize = 3;
        this.crateVertexPositionBuffer.numItems = sd.vertexPositionData.length / 3;

        // 贴图数据
        this.crateVertexTextureCoordBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.crateVertexTextureCoordBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(sd.textureCoordData), this.renderContext.STATIC_DRAW);
        this.crateVertexTextureCoordBuffer.itemSize = 2;
        this.crateVertexTextureCoordBuffer.numItems = sd.textureCoordData.length / 2;

        // 法线数据
        this.crateVertexNormalBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.crateVertexNormalBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(sd.normalData), this.renderContext.STATIC_DRAW);
        this.crateVertexNormalBuffer.itemSize = 3;
        this.crateVertexNormalBuffer.numItems = sd.normalData.length / 3;

        // 索引数据
        this.crateVertexIndexBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.crateVertexIndexBuffer);
        this.renderContext.bufferData(this.renderContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(sd.indexData), this.renderContext.STATIC_DRAW);
        this.crateVertexIndexBuffer.itemSize = 1;
        this.crateVertexIndexBuffer.numItems = sd.indexData.length;
    }

    private crateTextures:Array<any> = new Array();

    public initTexture():void {
		var obj = this;

        for (var i = 0; i < 2; ++ i) {
            var texture:any = this.renderContext.createTexture();
            this.crateTextures.push(texture);
        }
        Texture.getInstance().loadImages(["resource/moon.gif", "resource/crate.gif"], function(images) {
            for (var i = 0; i < obj.crateTextures.length; ++ i) {
                obj.crateTextures[ i ].image = images[ i ];
                obj.handleLoadedTexture(obj.crateTextures[ i ]);
            }
        });

        // Texture.getInstance().loadImage("resource/moon.gif", function(image) {
        //     texture.image = image;
        //     obj.handleLoadedTexture(texture);
        // });
    }

    public handleLoadedTexture(texture):void {
		// var image:any = texture.image;
		// var size:number = 256;
		// this.canv = UIManager.getInstance().getContext2D(size, size);
		// this.canv.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);
        // var imgData:ImageData = this.canv.getImageData(0, 0, size, size);
        // texture.isLoaded = true;

        this.renderContext.pixelStorei(this.renderContext.UNPACK_FLIP_Y_WEBGL, 1);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, texture);
        this.renderContext.texImage2D(this.renderContext.TEXTURE_2D, 0, this.renderContext.RGBA, this.renderContext.RGBA, this.renderContext.UNSIGNED_BYTE, texture.image);
        this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MAG_FILTER, this.renderContext.NEAREST);
        this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MIN_FILTER, this.renderContext.NEAREST);

        // this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, textures[ 1 ]);
        // this.renderContext.texImage2D(this.renderContext.TEXTURE_2D, 0, this.renderContext.RGBA, this.renderContext.RGBA, this.renderContext.UNSIGNED_BYTE, textures[ 1 ].image);
        // this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MAG_FILTER, this.renderContext.LINEAR);
        // this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MIN_FILTER, this.renderContext.LINEAR);

        // this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, textures[ 2 ]);
        // this.renderContext.texImage2D(this.renderContext.TEXTURE_2D, 0, this.renderContext.RGBA, this.renderContext.RGBA, this.renderContext.UNSIGNED_BYTE, textures[ 2 ].image);
        // this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MAG_FILTER, this.renderContext.LINEAR);
        // this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MIN_FILTER, this.renderContext.LINEAR_MIPMAP_NEAREST);
        // this.renderContext.generateMipmap(this.renderContext.TEXTURE_2D);

        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, null);

        this.isLoaded = true;
    }

    private clearTarget(target:number = WebGLRenderingContext.ARRAY_BUFFER):void {
        this.renderContext.bindBuffer(target, null);
    }

    private mvPushMatrix():void {
        var copy = this.mvMatrix.clone();
        this.mvMatrixStack.push(copy);
    }

    private mvPopMatrix() {
        if (this.mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        var copy:Matrix3D = this.mvMatrixStack.pop();
        copy.copyTo(this.mvMatrix);
    }

    private loadWorld():void {
        var request = new XMLHttpRequest();
        request.open("GET", "resource/world.txt");
        var obj = this;
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                obj.handleLoadedWorld(request.responseText);
            }
        }
        request.send();
    }

    private handleLoadedWorld(data:any):void {
        var lines = data.split("\n");
        var vertexCount = 0;
        var vertexPositions = [];
        var vertexTextureCoords = [];

        for (var i in lines) {
            var vals = lines[ i ].replace(/^\s+/, "").split(/\s+/);
            if (vals.length == 5 && vals[ 0 ] != "//") {
                vertexPositions.push(parseFloat(vals[ 0 ]));
                vertexPositions.push(parseFloat(vals[ 1 ]));
                vertexPositions.push(parseFloat(vals[ 2 ]));

                vertexTextureCoords.push(parseFloat(vals[ 3 ]));
                vertexTextureCoords.push(parseFloat(vals[ 4 ]));

                vertexCount ++;
            }
        }
        // this.initBuffers2(vertexPositions, vertexTextureCoords, vertexCount);
    }

	public update(param:any): void {
		
		// this.times ++;
        // this.handleKeys();
		this.drawScene(param);
        this.animate();
	}

    private handleKeys():void {
        // if (this.currentlyPressedKeys[33]) {
        //     // Page Up
        //     this.pitchRate = 0.1;
        // } else if (this.currentlyPressedKeys[34]) {
        //     // Page Down
        //     this.pitchRate = -0.1;
        // } else {
        //     this.pitchRate = 0;
        // }
 
        // if (this.currentlyPressedKeys[37] || this.currentlyPressedKeys[65]) {
        //     // Left cursor key or A
        //     this.yawRate = -0.1;
        // } else if (this.currentlyPressedKeys[39] || this.currentlyPressedKeys[68]) {
        //     // Right cursor key or D
        //     this.yawRate = 0.1;
        // } else {
        //     this.yawRate = 0;
        // }
 
        // if (this.currentlyPressedKeys[38] || this.currentlyPressedKeys[87]) {
        //     // Up cursor key or W
        //     this.speed = 0.003;
        // } else if (this.currentlyPressedKeys[40] || this.currentlyPressedKeys[83]) {
        //     // Down cursor key
        //     this.speed = -0.003;
        // } else {
        //     this.speed = 0;
        // }
    }

    private pitch = 0;
    private pitchRate = 0;
 
    private yaw = 0;
    private yawRate = 0;
 
    private xPos = 0;
    private yPos = 0.4;
    private zPos = 0;
 
    private speed = 0;

    private currProgram;
    private drawScene(param:any):void {
        
        if (!this.isLoaded) {
            return;
        }

        this.renderContext.clear(this.renderContext.COLOR_BUFFER_BIT | this.renderContext.DEPTH_BUFFER_BIT);

        this.pMatrix.identity();
		this.pMatrix.perspectiveFieldOfViewLH(45, this.width / this.height, 0.1, 100);

        this.currProgram = this.shaderProgram;
        if (param.per_fragment) {
            this.currProgram = this.shaderLightFragProgram;
        }

        // this.renderContext.blendFunc(this.renderContext.SRC_ALPHA, this.renderContext.ONE);
        // this.renderContext.enable(this.renderContext.BLEND);
        this.renderContext.useProgram(this.currProgram);

        this.renderContext.uniform1i(this.currProgram.useTexturesUniform, param.textures);
        this.renderContext.uniform1i(this.currProgram.useLightingUniform, param.lighting);
        if (param.lighting) {
            this.renderContext.uniform3f(this.currProgram.ambientColorUniform, 
                param.ambientR, 
                param.ambientG, 
                param.ambientB);
            
            this.renderContext.uniform3f(this.currProgram.pointLightingColorUniform, 
                param.directionalR, 
                param.directionalG, 
                param.directionalB);
            
            this.renderContext.uniform3f(this.currProgram.pointLightingLocationUniform, 
                param.lightDirectionX, 
                param.lightDirectionY, 
                param.lightDirectionZ);
        }
        
        this.mvMatrix.identity();
        // 相机矩阵
        Camera3D.getInstance().setCameraCoordinate(0, 3, -12);
        var cameraMat:Matrix3D = Camera3D.getInstance().getCameraMatrix(0, 0);

        this.mvPushMatrix();
        this.drawMoon(cameraMat);
        this.mvPopMatrix();

        this.drawCrate(cameraMat);
    }

    private drawMoon(cameraMat:Matrix3D):void {
        this.mvMatrix.appendTranslation(2, 0, 0);
        this.mvMatrix.appendRotation(-this.yaw, Vector3D.Y_AXIS);
        this.mvMatrix.append(cameraMat);
        // this.mvMatrix.prepend(this.moonRotationMatrix);

        // 贴图赋值
        this.renderContext.activeTexture(this.renderContext.TEXTURE0);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, this.crateTextures[ 0 ]);
        this.renderContext.uniform1i(this.currProgram.samplerUniform, 0);

        // 贴图坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexTextureCoordBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.aTextureCoord, this.moonVertexTextureCoordBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 顶点坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexPositionBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.vertexPositionAttribute, this.moonVertexPositionBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 法线坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexNormalBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.aVertexNormal, this.moonVertexNormalBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.moonVertexIndexBuffer);
        this.setMatrixUniforms();
        this.renderContext.drawElements(this.renderContext.TRIANGLES, this.moonVertexIndexBuffer.numItems, this.renderContext.UNSIGNED_SHORT, 0);
    }

    private drawCrate(cameraMat:Matrix3D):void {
        this.mvMatrix.appendTranslation(-2, 0, 0);
        this.mvMatrix.appendRotation(-this.yaw, Vector3D.Y_AXIS);
        this.mvMatrix.append(cameraMat);
        // this.mvMatrix.prepend(this.moonRotationMatrix);

        // 贴图赋值
        this.renderContext.activeTexture(this.renderContext.TEXTURE0);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, this.crateTextures[ 1 ]);
        this.renderContext.uniform1i(this.currProgram.samplerUniform, 0);

        // 贴图坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.crateVertexTextureCoordBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.aTextureCoord, this.crateVertexTextureCoordBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 顶点坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.crateVertexPositionBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.vertexPositionAttribute, this.crateVertexPositionBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 法线坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.crateVertexNormalBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.aVertexNormal, this.crateVertexNormalBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.crateVertexIndexBuffer);
        this.setMatrixUniforms();
        this.renderContext.drawElements(this.renderContext.TRIANGLES, this.crateVertexIndexBuffer.numItems, this.renderContext.UNSIGNED_SHORT, 0);
    }

    private lastTime = 0;
    private joggingAngle = 0;

    private animate():void {
        var timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            var elapsed = timeNow - this.lastTime;

            this.yaw += 0.01 * elapsed;

            // if (this.speed != 0) {
            //     this.xPos -= Math.sin(this.degToRad(this.yaw)) * this.speed * elapsed;
            //     this.zPos -= Math.cos(this.degToRad(this.yaw)) * this.speed * elapsed;
 
            //     this.joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
            //     this.yPos = Math.sin(this.degToRad(this.joggingAngle)) / 20 + 0.4
            // }
            // this.yaw += this.yawRate * elapsed;
            // this.pitch += this.pitchRate * elapsed;
        }
        this.lastTime = timeNow;
    }

	private setMatrixUniforms():void {
		this.renderContext.uniformMatrix4fv(this.currProgram.pMatrixUniform, false, this.pMatrix.data);
		this.renderContext.uniformMatrix4fv(this.currProgram.mvMatrixUniform, false, this.mvMatrix.data);
        // 法线矩阵
        Normal3D.getIntance().calNormalsMatrix(this.mvMatrix);
        this.renderContext.uniformMatrix4fv(this.currProgram.mNMatrixUniform, false, this.mvMatrix.data);
	}

	private getShader(shaderScript:any) {
        //var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
 
        var str = shaderScript.program;
        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = this.renderContext.createShader(this.renderContext.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = this.renderContext.createShader(this.renderContext.VERTEX_SHADER);
        } else {
            return null;
        }
 
        this.renderContext.shaderSource(shader, str);
        this.renderContext.compileShader(shader);
 
        if (!this.renderContext.getShaderParameter(shader, this.renderContext.COMPILE_STATUS)) {
            // alert();
            throw "Could not compile WebGL program. \n\n" + this.renderContext.getShaderInfoLog(shader);
            // return null;
        }
 
        return shader;
    }
}