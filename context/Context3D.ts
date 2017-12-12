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

	public init(canvas:HTMLCanvasElement, fragShaderInfo:any, vertShaderInfo:any): void {
		if (this.renderContext != null) {
			return;
		}

		// 初始化渲染器
		this.initRenderContext(canvas);

		// 初始化着色器
		this.initShaders(fragShaderInfo, vertShaderInfo);

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
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = this.lastMouseX - newX;
        var newRotationMatrix = new Matrix3D();
        newRotationMatrix.appendRotation(deltaX / 10, Vector3D.Y_AXIS);

        var deltaY = this.lastMouseY - newY;
        newRotationMatrix.appendRotation(deltaY / 10, Vector3D.X_AXIS);

        this.moonRotationMatrix.append(newRotationMatrix);

        this.lastMouseX = newX;
        this.lastMouseY = newY;
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

	private initShaders(fragShaderInfo:any, vertShaderInfo:any):void {
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

        this.shaderProgram.useLightingUniform       = this.renderContext.getUniformLocation(this.shaderProgram, "uUseLighting"      );
        this.shaderProgram.ambientColorUniform      = this.renderContext.getUniformLocation(this.shaderProgram, "uAmbientColor"     );
        this.shaderProgram.directionalColorUniform  = this.renderContext.getUniformLocation(this.shaderProgram, "uDirectionalColor" );
        this.shaderProgram.lightingDirectionUniform = this.renderContext.getUniformLocation(this.shaderProgram, "uLightingDirection");
	}

    private moonVertexPositionBuffer;
    private moonVertexNormalBuffer;
    private moonVertexTextureCoordBuffer;
    private moonVertexIndexBuffer;

    private initBuffers():void {
        var longitudeBands = 36;
        var latitudeBands = 36;
        var radius = 2;

        var sphere:Sphere = new Sphere(radius, latitudeBands, longitudeBands);
        var sd:SphereData = sphere.getSphereData();
        // console.log(sd.vertexPositionData);
        // console.log(sd.textureCoordData);
        // console.log(sd.normalData);
        // console.log(sd.indexData);

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

    private initBuffers2(vertices:any, textureCoords:any, count:number):void {
        // this.worldVertexPositionBuffer = this.renderContext.createBuffer();
        // this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.worldVertexPositionBuffer);
        // this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(vertices), this.renderContext.STATIC_DRAW);
        // this.worldVertexPositionBuffer.itemSize = 3;
        // this.worldVertexPositionBuffer.numItems = count;

        // this.worldVertexTextureCoordBuffer = this.renderContext.createBuffer();
        // this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer);
        // this.renderContext.bufferData(this.renderContext.ARRAY_BUFFER, new Float32Array(textureCoords), this.renderContext.STATIC_DRAW);
        // this.worldVertexTextureCoordBuffer.itemSize = 2;
        // this.worldVertexTextureCoordBuffer.numItems = count;
    }

    private crateTextures:Array<any> = new Array();

    public initTexture():void {
		var obj = this;
        var texture:any = this.renderContext.createTexture();
        this.crateTextures.push(texture);
        Texture.getInstance().loadImage("resource/moon.gif", function(image) {
            texture.image = image;
            obj.handleLoadedTexture(texture);
        });
    }

    public handleLoadedTexture(texture):void {
		// var image:any = texture.image;
		// var size:number = 256;
		// this.canv = UIManager.getInstance().getContext2D(size, size);
		// this.canv.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);
        // var imgData:ImageData = this.canv.getImageData(0, 0, size, size);
        // texture.isLoaded = true;

    //    console.log(textures[ 0 ].image.width, textures[ 0 ].image.height);

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
        this.initBuffers2(vertexPositions, vertexTextureCoords, vertexCount);
    }

	public update(param:any): void {
		
		// this.times ++;
        // this.handleKeys();
		this.drawScene2(param);
        // this.animate();
	}

    private handleKeys():void {
        if (this.currentlyPressedKeys[33]) {
            // Page Up
            this.pitchRate = 0.1;
        } else if (this.currentlyPressedKeys[34]) {
            // Page Down
            this.pitchRate = -0.1;
        } else {
            this.pitchRate = 0;
        }
 
        if (this.currentlyPressedKeys[37] || this.currentlyPressedKeys[65]) {
            // Left cursor key or A
            this.yawRate = -0.1;
        } else if (this.currentlyPressedKeys[39] || this.currentlyPressedKeys[68]) {
            // Right cursor key or D
            this.yawRate = 0.1;
        } else {
            this.yawRate = 0;
        }
 
        if (this.currentlyPressedKeys[38] || this.currentlyPressedKeys[87]) {
            // Up cursor key or W
            this.speed = 0.003;
        } else if (this.currentlyPressedKeys[40] || this.currentlyPressedKeys[83]) {
            // Down cursor key
            this.speed = -0.003;
        } else {
            this.speed = 0;
        }
    }

    private pitch = 0;
    private pitchRate = 0;
 
    private yaw = 0;
    private yawRate = 0;
 
    private xPos = 0;
    private yPos = 0.4;
    private zPos = 0;
 
    private speed = 0;

    private drawScene2(param:any):void {
        
        if (!this.isLoaded) {
            return;
        }

        this.renderContext.clear(this.renderContext.COLOR_BUFFER_BIT | this.renderContext.DEPTH_BUFFER_BIT);

        this.pMatrix.identity();
		this.pMatrix.perspectiveFieldOfViewLH(45, this.width / this.height, 0.1, 100);


        // this.renderContext.blendFunc(this.renderContext.SRC_ALPHA, this.renderContext.ONE);
        // this.renderContext.enable(this.renderContext.BLEND);

        this.mvMatrix.identity();
        
        // 相机矩阵
        // Camera3D.getInstance().setCameraCoordinate(0, 0, 0);
        // var cameraMat:Matrix3D = Camera3D.getInstance().getCameraMatrix(0, 0);
        // this.mvMatrix.append(cameraMat);

        this.mvMatrix.appendTranslation(0, 0, 6);
        this.mvMatrix.prepend(this.moonRotationMatrix);

        // 贴图赋值
        this.renderContext.activeTexture(this.renderContext.TEXTURE0);
        this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, this.crateTextures[this.filter]);
        this.renderContext.uniform1i(this.shaderProgram.samplerUniform, 0);

        // 贴图坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexTextureCoordBuffer);
        this.renderContext.vertexAttribPointer(this.shaderProgram.aTextureCoord, this.moonVertexTextureCoordBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 顶点坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexPositionBuffer);
        this.renderContext.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.moonVertexPositionBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // 法线坐标赋值
        this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.moonVertexNormalBuffer);
        this.renderContext.vertexAttribPointer(this.shaderProgram.aVertexNormal, this.moonVertexNormalBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        this.renderContext.uniform1i(this.shaderProgram.useLightingUniform, param.lighting);
        if (param.lighting) {
            this.renderContext.uniform3f(this.shaderProgram.ambientColorUniform, 
                param.ambientR, 
                param.ambientG, 
                param.ambientB);
            
            this.renderContext.uniform3f(this.shaderProgram.directionalColorUniform, 
                param.directionalR, 
                param.directionalG, 
                param.directionalB);
            
            var light:Light3D = new Light3D(param.lightDirectionX, param.lightDirectionY, param.lightDirectionZ);
            this.renderContext.uniform3fv(this.shaderProgram.lightingDirectionUniform, light.getReflectVector3D().toArray());
        }

        this.renderContext.bindBuffer(this.renderContext.ELEMENT_ARRAY_BUFFER, this.moonVertexIndexBuffer);
        this.setMatrixUniforms();
        this.renderContext.drawElements(this.renderContext.TRIANGLES, this.moonVertexIndexBuffer.numItems, this.renderContext.UNSIGNED_SHORT, 0);
    }

    private lastTime = 0;
    private joggingAngle = 0;

    private animate():void {
        var timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            var elapsed = timeNow - this.lastTime;



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

    private degToRad(angle:number):number {
        return angle * Math.PI / 180.0;
    }

    private effectiveFPMS = 60 / 1000;
    private starAnimate (star:Star, elapsedTime):void {
        // star.angle += this.w * this.effectiveFPMS * elapsedTime;
        // star.angle += star.rotationSpeed * this.effectiveFPMS * elapsedTime;

        // // Decrease the distance, resetting the star to the outside of
        // // the spiral if it's at the center.
        // star.dist -= 0.01 * this.effectiveFPMS * elapsedTime;
        // if (star.dist < 0.0) {
        //     star.dist += 5.0;
        //     star.randomiseColors();
        // }

    };

    private draw(star:Star, twinkle):void {
        
        // this.mvPushMatrix();

        // // Move to the star's position
        // // this.mvMatrix.appendRotation(star.angle, Vector3D.Y_AXIS);
        
        // if (star.id == 0) {
        //     this.mvMatrix.appendTranslation(0, 0, 2.9-this.z);
        // }

        // this.mvMatrix.appendRotation(this.tilt, Vector3D.X_AXIS);
        // this.mvMatrix.appendRotation(this.xTilt, Vector3D.Y_AXIS);
        
        // this.mvMatrix.appendTranslation(star.x, star.y, 0);

        // this.mvMatrix.appendRotation(-this.xTilt, Vector3D.Y_AXIS);
        // this.mvMatrix.appendRotation(-this.tilt, Vector3D.X_AXIS);

        // this.mvMatrix.appendRotation(star.angle, Vector3D.Z_AXIS);

        // // // Rotate back so that the star is facing the viewer
        // // this.mvMatrix.appendRotation(-star.angle, Vector3D.Y_AXIS);
        // // var mt:Matrix3D = new Matrix3D();
        // // mt.appendRotation(this.tilt, Vector3D.X_AXIS);
        // // this.mvMatrix.prepend(mt);

        // if (twinkle) {
        //     // Draw a non-rotating star in the alternate "twinkling" color
        //     this.renderContext.uniform3f(this.shaderProgram.colorUniform, star.twinkleR, star.twinkleG, star.twinkleB);
        //     this.drawStar();
        // }

        // // All stars spin around the Z axis at the same rate
        // // this.mvMatrix.appendRotation(this.spin, Vector3D.Z_AXIS);
        // if (star.id < 0) {
        //     var mm:Matrix3D = new Matrix3D();
        //     mm.appendRotation(this.spin, Vector3D.Z_AXIS);
        //     this.mvMatrix.prepend(mm);
        // }

        // // Draw the star in its main color
        // this.renderContext.uniform3f(this.shaderProgram.colorUniform, star.r, star.g, star.b);
        // this.drawStar();

        // this.mvPopMatrix();
    }

    private drawStar():void {
        // this.renderContext.activeTexture(this.renderContext.TEXTURE0);
        // this.renderContext.bindTexture(this.renderContext.TEXTURE_2D, this.crateTextures[this.filter]);
        // this.renderContext.uniform1i(this.shaderProgram.samplerUniform, 0);

        // this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.starVertexTextureCoordBuffer);
        // this.renderContext.vertexAttribPointer(this.shaderProgram.aTextureCoord, this.starVertexTextureCoordBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // this.renderContext.bindBuffer(this.renderContext.ARRAY_BUFFER, this.starVertexPositionBuffer);
        // this.renderContext.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.starVertexPositionBuffer.itemSize, this.renderContext.FLOAT, false, 0, 0);

        // this.setMatrixUniforms();
        // this.renderContext.drawArrays(this.renderContext.TRIANGLE_STRIP, 0, this.starVertexPositionBuffer.numItems);
    }

	private setMatrixUniforms():void {
		this.renderContext.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix.data);
		this.renderContext.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix.data);
        // 法线矩阵
        Normal3D.getIntance().calNormalsMatrix(this.mvMatrix);
        this.renderContext.uniformMatrix4fv(this.shaderProgram.mNMatrixUniform, false, this.mvMatrix.data);
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