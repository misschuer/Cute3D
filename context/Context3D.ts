class Context3D implements Tick<void> {
	private static context:Context3D = null;

	private renderContext:WebGLRenderingContext = null;
	private width:number;
	private height:number;

    private pMatrix:PerspectiveMatrix3D = new PerspectiveMatrix3D();
    private mvMatrix:Matrix3D = new Matrix3D();

    private mvMatrixStack = [];

	private shaderProgram = null;
    private shaderLightFragProgram = null;
	private canv:CanvasRenderingContext2D = null; 
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

        // 载入茶杯
        // this.loadTeapot();


		this.renderContext.clearColor(0, 0, 0, 1);
		this.renderContext.enable(this.renderContext.DEPTH_TEST);

        var obj = this;

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
    }

    private currentlyPressedKeys:Object = new Object();

    private handleKeyDown(event):void {
        this.currentlyPressedKeys[event.keyCode] = true;
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

        // 透视矩阵
		this.shaderProgram.pMatrixUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uPMatrix");
        // 活动矩阵
		this.shaderProgram.mvMatrixUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uMVMatrix");
        // 法线矩阵
        this.shaderProgram.mNMatrixUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uNMatrix");


        this.shaderProgram.materialShininessUniform             = this.renderContext.getUniformLocation(this.shaderProgram, "uMaterialShininess");

        this.shaderProgram.useColorMapUniform                   = this.renderContext.getUniformLocation(this.shaderProgram, "uUseColorMap");
        this.shaderProgram.useLightingUniform                   = this.renderContext.getUniformLocation(this.shaderProgram, "uUseLighting"      );
        this.shaderProgram.useSpecularMapUniform                = this.renderContext.getUniformLocation(this.shaderProgram, "uUseSpecularMap"      );

        this.shaderProgram.ambientColorUniform                  = this.renderContext.getUniformLocation(this.shaderProgram, "uAmbientColor"     );

        this.shaderProgram.pointLightingLocationUniform         = this.renderContext.getUniformLocation(this.shaderProgram, "uPointLightingLocation");
        this.shaderProgram.pointLightingSpecularColorUniform    = this.renderContext.getUniformLocation(this.shaderProgram, "uPointLightingSpecularColor" );
        this.shaderProgram.pointLightingDiffuseColorUniform     = this.renderContext.getUniformLocation(this.shaderProgram, "uPointLightingDiffuseColor");
        
        // 贴图
		this.shaderProgram.colorMapSamplerUniform               = this.renderContext.getUniformLocation(this.shaderProgram, "uColorMapSampler");
        this.shaderProgram.specularMapSamplerUniform            = this.renderContext.getUniformLocation(this.shaderProgram, "uSpecularMapSampler");
    }

    private crateTextures:Array<any> = new Array();

    public initTexture():void {
		var obj = this;
        var srcList = ["resource/earth.jpg", "resource/earth-specular.gif"];
        for (var i = 0; i < srcList.length; ++ i) {
            var texture:any = this.renderContext.createTexture();
            this.crateTextures.push(texture);
        }
        Texture.getInstance().loadImages(srcList, function(images) {
            for (var i = 0; i < obj.crateTextures.length; ++ i) {
                obj.crateTextures[ i ].image = images[ i ];
                obj.handleLoadedTexture(obj.crateTextures[ i ]);
            }
        });
    }

    public handleLoadedTexture(texture):void {
        this.renderContext.pixelStorei(this.renderContext.UNPACK_FLIP_Y_WEBGL, 1);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, texture);
        this.renderContext.texImage2D(this.renderContext.TEXTURE_2D, 0, this.renderContext.RGBA, this.renderContext.RGBA, this.renderContext.UNSIGNED_BYTE, texture.image);
        this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MAG_FILTER, this.renderContext.LINEAR);
        this.renderContext.texParameteri(this.renderContext.TEXTURE_2D, this.renderContext.TEXTURE_MIN_FILTER, this.renderContext.LINEAR_MIPMAP_NEAREST);
        this.renderContext.generateMipmap(this.renderContext.TEXTURE_2D);
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

    private loadTeapot():void {
        var request = new XMLHttpRequest();
        request.open("GET", "resource/Teapot.json");
        var obj = this;
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                obj.handleLoadedTeapot(request.responseText);
            }
        }
        request.send();
    }

    private teapotVertexPositionBuffer;
    private teapotVertexNormalBuffer;
    private teapotVertexTextureCoordBuffer;
    private teapotVertexIndexBuffer;

    private initBuffers():void {
        var gd:GeometryData = Sphere.getInstance().getSphereData(13, 30, 30);
        this.teapotVertexNormalBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexNormalBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(gd.normalData), this.renderContext.STATIC_DRAW);
        this.teapotVertexNormalBuffer.itemSize = 3;
        this.teapotVertexNormalBuffer.numItems = gd.normalData.length / 3;
 
        this.teapotVertexTextureCoordBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexTextureCoordBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(gd.textureCoordData), this.renderContext.STATIC_DRAW);
        this.teapotVertexTextureCoordBuffer.itemSize = 2;
        this.teapotVertexTextureCoordBuffer.numItems = gd.textureCoordData.length / 2;
 
        this.teapotVertexPositionBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexPositionBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(gd.vertexPositionData), this.renderContext.STATIC_DRAW);
        this.teapotVertexPositionBuffer.itemSize = 3;
        this.teapotVertexPositionBuffer.numItems = gd.vertexPositionData.length / 3;
 
        this.teapotVertexIndexBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.teapotVertexIndexBuffer);
        this.renderContext.bufferData(this.renderContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(gd.indexData), this.renderContext.STATIC_DRAW);
        this.teapotVertexIndexBuffer.itemSize = 1;
        this.teapotVertexIndexBuffer.numItems = gd.indexData.length;
    }

    private handleLoadedTeapot(data:any):void {
        var teapotData = JSON.parse(data);
        
        this.teapotVertexNormalBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexNormalBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), this.renderContext.STATIC_DRAW);
        this.teapotVertexNormalBuffer.itemSize = 3;
        this.teapotVertexNormalBuffer.numItems = teapotData.vertexNormals.length / 3;
 
        this.teapotVertexTextureCoordBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexTextureCoordBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(teapotData.vertexTextureCoords), this.renderContext.STATIC_DRAW);
        this.teapotVertexTextureCoordBuffer.itemSize = 2;
        this.teapotVertexTextureCoordBuffer.numItems = teapotData.vertexTextureCoords.length / 2;
 
        this.teapotVertexPositionBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexPositionBuffer);
        this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(teapotData.vertexPositions), this.renderContext.STATIC_DRAW);
        this.teapotVertexPositionBuffer.itemSize = 3;
        this.teapotVertexPositionBuffer.numItems = teapotData.vertexPositions.length / 3;
 
        this.teapotVertexIndexBuffer = this.renderContext.createBuffer();
        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.teapotVertexIndexBuffer);
        this.renderContext.bufferData(this.renderContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapotData.indices), this.renderContext.STATIC_DRAW);
        this.teapotVertexIndexBuffer.itemSize = 1;
        this.teapotVertexIndexBuffer.numItems = teapotData.indices.length;
    }

	public update(param:any): void {
		this.drawScene(param);
        this.animate();
	}

    private handleKeys():void {

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
        this.renderContext.useProgram(this.currProgram);

        // 是否使用灯光
        this.renderContext.uniform1i(this.currProgram.useLightingUniform, param.lighting);
        // 正常地图
        this.renderContext.uniform1i(this.currProgram.useColorMapUniform, param.color_map);
        // 高光贴图
        this.renderContext.uniform1i(this.currProgram.useSpecularMapUniform, param.specular_map);
        
        // 环境光
        this.renderContext.uniform3f(this.currProgram.ambientColorUniform, 
            param.ambientR, 
            param.ambientG, 
            param.ambientB);
        
        // 光源位置
        this.renderContext.uniform3f(this.currProgram.pointLightingLocationUniform, 
            param.lightPositionX, 
            param.lightPositionY, 
            param.lightPositionZ);

         // 镜面反射光颜色
        this.renderContext.uniform3f(this.currProgram.pointLightingSpecularColorUniform, 
            param.specularR, 
            param.specularG, 
            param.specularB);

        // 漫反射光颜色
        this.renderContext.uniform3f(this.currProgram.pointLightingDiffuseColorUniform, 
            param.diffuseR, 
            param.diffuseG, 
            param.diffuseB);
        
        this.mvMatrix.identity();
        // 相机矩阵
        Camera3D.getInstance().setCameraCoordinate(0, 3, -35);
        var cameraMat:Matrix3D = Camera3D.getInstance().getCameraMatrix(0, 0);

        this.mvPushMatrix();
        this.drawTeapot(cameraMat);
        this.mvPopMatrix();
    }

     private drawTeapot(cameraMat:Matrix3D):void {
        this.mvMatrix.appendTranslation(2, 0, 0);
        this.mvMatrix.appendRotation(-this.yaw, Vector3D.Y_AXIS);
        this.mvMatrix.appendRotation(-30, Vector3D.Z_AXIS);
        this.mvMatrix.append(cameraMat);

        // 贴图赋值
        this.renderContext.activeTexture(this.renderContext.TEXTURE0);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, this.crateTextures[ 0 ]);
        this.renderContext.uniform1i(this.currProgram.colorMapSamplerUniform, 0);

        this.renderContext.activeTexture(this.renderContext.TEXTURE1);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, this.crateTextures[ 1 ]);
        this.renderContext.uniform1i(this.currProgram.specularMapSamplerUniform, 1);

        // 贴图坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexTextureCoordBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.aTextureCoord, this.teapotVertexTextureCoordBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 顶点坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexPositionBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.vertexPositionAttribute, this.teapotVertexPositionBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 法线坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.teapotVertexNormalBuffer);
        this.renderContext.vertexAttribPointer(this.currProgram.aVertexNormal, this.teapotVertexNormalBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.teapotVertexIndexBuffer);
        this.setMatrixUniforms();
        this.renderContext.drawElements(this.renderContext.TRIANGLES, this.teapotVertexIndexBuffer.numItems, this.renderContext.UNSIGNED_SHORT, 0);
    }

    private lastTime = 0;
    private joggingAngle = 0;

    private animate():void {
        var timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            var elapsed = timeNow - this.lastTime;
            this.yaw += 0.01 * elapsed;
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