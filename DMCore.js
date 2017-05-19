(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.DMCore = global.DMCore || {})));
}(this, (function (exports) {

    function Scene(id_canvas) {
        var canvas = document.getElementById(id_canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        try {
            this.gl = canvas.getContext('experimental-webgl', {antialias: true});
            this.gl.viewportWidth = canvas.width;
            this.gl.viewportHeight = canvas.height;
        } catch (e) {}
        if (!this.gl) {
            alert("your Browser does not support webgl")
        }
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.pMatrix = mat4.create();
        this.vMatrix = mat4.create();
        this.geometry = [];
    }

    Scene.prototype = {
        constructor: Scene,
        addProgramShader: function () {
            this.ShadowProgram = this.gl.createProgram();

            var shadow_vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            var shadow_fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

            this.gl.shaderSource(shadow_vertexShader, [
				'attribute vec3 aVertexPosition;\n' +
                'uniform mat4 uPMatrix;\n' +
                'uniform mat4 uMVMatrix;\n' +
                
                'void main(void){\n' +
                '   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n'+
                '}'].join('\n'));
            
            this.gl.shaderSource(shadow_fragmentShader, [
				'precision mediump float; \n' +
                
                'void main(void){\n' +
                '  gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);\n'+
                '}'].join('\n'));
            
            this.gl.compileShader(shadow_vertexShader);
            this.gl.compileShader(shadow_fragmentShader);

            this.gl.attachShader(this.ShadowProgram, shadow_vertexShader);
            this.gl.attachShader(this.ShadowProgram, shadow_fragmentShader);

            this.gl.linkProgram(this.ShadowProgram);  
            
            this.ShadowProgram.pMatrix = this.gl.getUniformLocation(this.ShadowProgram, "uPMatrix");
            this.ShadowProgram.mvMatrix = this.gl.getUniformLocation(this.ShadowProgram, "uMVMatrix");
            
            this.ShadowProgram.Position = this.gl.getAttribLocation(this.ShadowProgram, "aVertexPosition");          
            
            this.PROJMATRIX_SHADOW = mat4.create();
            this.PROJMATRIX_SHADOW = mat4.perspective(70, this.viewportWidth / this.viewportHeight, 0.1, 1000);
            this.PROJMATRIX_SHADOW = mat4.lookAt(0, 0, 2, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0);
            //-----------------------------
            this.Program = this.gl.createProgram();

            var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

            this.gl.shaderSource(vertexShader, [
				'attribute vec3 aVertexPosition;\n' +
                'attribute vec2 aVertexTexCoord;\n' +
                'attribute vec3 aVertexNormal;\n' +
                'uniform mat4 uPMatrix;\n' +
                'uniform mat4 uVMatrix;\n' +
                'uniform mat4 uMVMatrix;\n' +
                'uniform mat3 uNMatrix;\n' +
                
                'uniform vec3 uAmbientColor;\n' +
                
                'uniform vec3 uLightingPosition;\n' +
                'uniform vec3 uDirectionalColor;\n' +
                
                'varying vec2 vFragTexCoord;\n' +
                'varying vec3 vLightWeighting;\n' +
                'void main(void){\n' +
                '    gl_Position = uPMatrix * uVMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n' +
                '    vFragTexCoord = aVertexTexCoord;\n' +
                '    vec3 transformedNormal = uNMatrix * aVertexNormal;\n' +
                '    vec4 vertexPosition = uMVMatrix * vec4(aVertexPosition, 1.0);\n'+
                '    vec3 LightingDirection = normalize(uLightingPosition - vec3(vertexPosition));\n'+
                '    float nDotL = max(dot(transformedNormal, LightingDirection), 0.0);\n' +
                '    vLightWeighting = uAmbientColor + uDirectionalColor * nDotL;\n' +
                '}'].join('\n'));

            this.gl.shaderSource(fragmentShader, [
                'precision mediump float;\n' +
                'varying vec2 vFragTexCoord;\n' +
                'varying vec3 vLightWeighting;\n' +
                'uniform sampler2D, usampler;\n' +
                'void main(void){\n' +
                '    vec4 textureColor = texture2D(usampler, vFragTexCoord);\n' +
                '    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);\n' +
                '}'].join('\n'));

            this.gl.compileShader(vertexShader);
            this.gl.compileShader(fragmentShader);

            this.gl.attachShader(this.Program, vertexShader);
            this.gl.attachShader(this.Program, fragmentShader);

            this.gl.linkProgram(this.Program);
            //this.gl.useProgram(this.Program);
            
            this.Program.Position = this.gl.getAttribLocation(this.Program, "aVertexPosition");
//            this.gl.enableVertexAttribArray(this.Program.Position);
            this.Program.textureCoord = this.gl.getAttribLocation(this.Program, "aVertexTexCoord");
//            this.gl.enableVertexAttribArray(this.Program.textureCoord);
            this.Program.normalCoord = this.gl.getAttribLocation(this.Program, "aVertexNormal");
//            this.gl.enableVertexAttribArray(this.Program.normalCoord);
            
            this.Program.pMatrix = this.gl.getUniformLocation(this.Program, "uPMatrix");
            this.Program.vMatrix = this.gl.getUniformLocation(this.Program, "uVMatrix");
            this.Program.mvMatrix = this.gl.getUniformLocation(this.Program, "uMVMatrix");
            this.Program.nMatrix = this.gl.getUniformLocation(this.Program, "uNMatrix");
            this.Program.lightPosition = this.gl.getUniformLocation(this.Program, "uLightingPosition");
            this.Program.lightColor = this.gl.getUniformLocation(this.Program, "uDirectionalColor");
            this.Program.ambientColor = this.gl.getUniformLocation(this.Program, "uAmbientColor");
            this.Program.sampler = this.gl.getUniformLocation(this.Program, 'usampler');
            
            
            
            
            this.fb=this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);

            this.rb=this.gl.createRenderbuffer();
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rb);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16 , 512, 512);

            this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT,
                                     this.gl.RENDERBUFFER, this.rb);

            this.texture_rtt=this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_rtt);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 2048, 2048,
                        0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
                                  this.gl.TEXTURE_2D, this.texture_rtt, 0);


            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        },

        add: function (object) {
            if (object.Type == 'PerspectiveCamera'){
                this.pMatrix = object.pMatrix;
                this.vMatrix = object.vMatrix;
            }
            else {
                if (object.Type == 'Plane') {
                    object.VertexBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.VertexBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.Vertices), this.gl.STATIC_DRAW);

                    object.TextureBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.TextureBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.TextureCoord), this.gl.STATIC_DRAW);
                    
                    object.NormalBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.NormalBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new  Float32Array(object.Normal), this.gl.STATIC_DRAW);

                } else if (object.Type == 'Cube') {
                    object.VertexBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.VertexBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.Vertices), this.gl.STATIC_DRAW);

                    object.TextureBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.TextureBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.TextureCoord), this.gl.STATIC_DRAW);
                    
                    object.NormalBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.NormalBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.Normal), this.gl.STATIC_DRAW);
                    
                    object.IndexBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.IndexBuffer);
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.Index), this.gl.STATIC_DRAW);
                } else {
                    object.TextureBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.TextureBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.TextureCoord), this.gl.STATIC_DRAW);
                    object.TextureBuffer.itemSize = 2;
                    object.TextureBuffer.numItems = object.TextureCoord.length / 2;
                    
                    object.VertexBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.VertexBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.Vertices), this.gl.STATIC_DRAW);
                    object.VertexBuffer.itemSize = 3;
                    object.VertexBuffer.numItems = object.Vertices.length / 3;
                    
                    object.NormalBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.NormalBuffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.Normal), this.gl.STATIC_DRAW);
                    object.NormalBuffer.itemSize = 3;
                    object.NormalBuffer.numItems = object.Normal.length / 3;
                    
                    object.IndexBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.IndexBuffer);
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.Index), this.gl.STATIC_DRAW);
                    object.IndexBuffer.itemSize = 1;
                    object.IndexBuffer.numItems = object.Index.length;
                }

                object.Texture = this.gl.createTexture();
                object.Texture.image = new Image();
                _gl = this.gl;
                object.Texture.image.onload = function () {
                    _gl.bindTexture(_gl.TEXTURE_2D, object.Texture);
                    _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
                    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, object.Texture.image);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                    
                    _gl.bindTexture(_gl.TEXTURE_2D, null);
                };
                object.Texture.image.src = object.imageTexture;
                this.geometry.push(object);
                object.indexInGeometry = this.geometry.length - 1;
            }
        },
        renderWebGL: function () {
//                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
//                this.gl.useProgram(this.ShadowProgram);
//
//            this.gl.viewport(0, 0, 1024, 1024); // Set view port for FBO
//            this.gl.clearColor(1.0, 0.0, 0.0, 1.0); //red -> Z=Zfar on the shadow map
//            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
//
//            this.gl.uniformMatrix4fv(this.ShadowProgram.pMatrix, false, this.PROJMATRIX_SHADOW);
//                        this.gl.enableVertexAttribArray(this.ShadowProgram.Position);   
//
//
//            
//             for (var i = 0; i < this.geometry.length; i++){
//                 if (this.geometry[i] === undefined){
//                    continue;  
//                }
//                this.gl.uniformMatrix4fv(this.ShadowProgram.mvMatrix, false, this.geometry[i].mvMatrix); 
//                if (this.geometry[i].Type == 'pPlane') {
//
//                    
//                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].VertexBuffer);
//                    this.gl.vertexAttribPointer(this.ShadowProgram.Position, 3, this.gl.FLOAT, false, 0, 0);
//
//                    
//                    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
//                }
//                else if(this.geometry[i].Type == 'Sphere'){
//                
//                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].VertexBuffer);
//                    this.gl.vertexAttribPointer(this.ShadowProgram.Position, this.geometry[i].VertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
//                    
//
//                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry[i].IndexBuffer);
//                    this.gl.drawElements(this.gl.TRIANGLES, this.geometry[i].IndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
//                }
//                else if(this.geometry[i].Type == 'Cube'){
//                    
//                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].VertexBuffer);
//                    this.gl.vertexAttribPointer(this.ShadowProgram.Position, 3, this.gl.FLOAT, false, 0, 0);
//                    
//                    
//                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry[i].IndexBuffer);
//
//                    this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
//                 
//             }
//        }
//    
//
//            this.gl.disableVertexAttribArray(this.ShadowProgram.Position);
//              this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
//            this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
//            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.useProgram(this.Program);
            this.gl.enableVertexAttribArray(this.Program.Position);
            this.gl.enableVertexAttribArray(this.Program.normalCoord);
            this.gl.enableVertexAttribArray(this.Program.textureCoord);
            this.gl.uniform3fv(this.Program.lightPosition, [0, 0, 2]);
            this.gl.uniform3fv(this.Program.lightColor, [0.2, 0.2, 0.2]);
            this.gl.uniform3fv(this.Program.ambientColor, [0.6, 0.6, 0.6]);
            for (var i = 0; i < this.geometry.length; i++) {
                if (this.geometry[i] === undefined){
                    continue;  
                }
                var temp = mat4.create();
                mat4.set(this.geometry[i].mvMatrix, temp);
                if (this.geometry[i].Type == 'Plane') {
                    
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].VertexBuffer);
                    this.gl.vertexAttribPointer(this.Program.Position, 3, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].NormalBuffer);
                    this.gl.vertexAttribPointer(this.Program.normalCoord, 3, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].TextureBuffer);
                    this.gl.vertexAttribPointer(this.Program.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometry[i].Texture);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.uniform1i(this.Program.sampler, 0);
                    
                    this.gl.uniformMatrix4fv(this.Program.pMatrix, false, this.pMatrix);
                    this.gl.uniformMatrix4fv(this.Program.vMatrix, false, this.vMatrix);
                    this.gl.uniformMatrix4fv(this.Program.mvMatrix, false, this.geometry[i].mvMatrix);
                    var normalMatrix = mat3.create();
                    mat4.toInverseMat3(this.geometry[i].mvMatrix, normalMatrix);
                    mat3.transpose(normalMatrix);
                    this.gl.uniformMatrix3fv(this.Program.nMatrix, false, normalMatrix);
                    
                    
                    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
                }
                else if(this.geometry[i].Type == 'Sphere'){
                    
                    
                    
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].VertexBuffer);
                    this.gl.vertexAttribPointer(this.Program.Position, this.geometry[i].VertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].NormalBuffer);
                    this.gl.vertexAttribPointer(this.Program.normalCoord, this.geometry[i].NormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].TextureBuffer);
                    this.gl.vertexAttribPointer(this.Program.textureCoord, this.geometry[i].TextureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometry[i].Texture);
                    this.gl.uniform1i(this.Program.sampler, 0);
                    
                    this.gl.uniformMatrix4fv(this.Program.pMatrix, false, this.pMatrix);
                    this.gl.uniformMatrix4fv(this.Program.vMatrix, false, this.vMatrix);
                    this.gl.uniformMatrix4fv(this.Program.mvMatrix, false, this.geometry[i].mvMatrix);
                    var normalMatrix = mat3.create();
                    mat4.toInverseMat3(this.geometry[i].mvMatrix, normalMatrix);
                    mat3.transpose(normalMatrix);
                    this.gl.uniformMatrix3fv(this.Program.nMatrix, false, normalMatrix);
                    
                    

                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry[i].IndexBuffer);
                    this.gl.drawElements(this.gl.TRIANGLES, this.geometry[i].IndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
                }
                else if(this.geometry[i].Type == 'Cube'){
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].VertexBuffer);
                    this.gl.vertexAttribPointer(this.Program.Position, 3, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].NormalBuffer);
                    this.gl.vertexAttribPointer(this.Program.normalCoord, 3, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry[i].TextureBuffer);
                    this.gl.vertexAttribPointer(this.Program.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
                    
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.geometry[i].Texture);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.uniform1i(this.Program.sampler, 0);
                    
                    this.gl.uniformMatrix4fv(this.Program.pMatrix, false, this.pMatrix);
                    this.gl.uniformMatrix4fv(this.Program.vMatrix, false, this.vMatrix);
                    this.gl.uniformMatrix4fv(this.Program.mvMatrix, false, this.geometry[i].mvMatrix);
                    var normalMatrix = mat3.create();
                    mat4.toInverseMat3(this.geometry[i].mvMatrix, normalMatrix);
                    mat3.transpose(normalMatrix);
                    this.gl.uniformMatrix3fv(this.Program.nMatrix, false, normalMatrix);
                    
                    
                    
                    
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry[i].IndexBuffer);

                    this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
                }
                mat4.set(temp, this.geometry[i].mvMatrix);
            }
        }
    }

    function PerspectiveCamera(fov, aspect, near, far) {
        this.pMatrix = mat4.create();
        this.vMatrix = mat4.create();
        this.Type = 'PerspectiveCamera';
        this.fov = fov !== undefined ? fov : 50;
        this.aspect = aspect !== undefined ? aspect : 1;
        this.near = near !== undefined ? near : 0.1;
        this.far = far !== undefined ? far : 2000;
        mat4.perspective(fov, aspect, near, far, this.pMatrix);
        mat4.lookAt([0, 0, 9], [0, 0, 0], [0, 1, 0], this.vMatrix);
    }
    
    PerspectiveCamera.prototype = {
        constructor: PerspectiveCamera,
        translate: function (x, y, z) {
            mat4.translate(this.pMatrix, [x, y, z]);
        },
        rotate: function (a, b, c, d) {
            mat4.rotate(this.pMatrix, a, [b, c, d]);
        },
        lookat: function (ex, ey, ez, x, y, z, ax, ay, az){
            mat4.lookAt([ex, ey, ez], [x, y, z], [ax, ay, az], this.vMatrix);
        }
    }

    function Object3D() {
        this.Type,
            this.Vertices = [],
            this.TextureCoord = [],
            this.Index = [],
            this.Normal = [],
            this.imageTexture,
            this.Texture,
            this.VertexBuffer,
            this.TextureBuffer,
            this.NormalBuffer,
            this.IndexBuffer,
            
            this.mvMatrix = mat4.create(),
            this.indexInGeometry,
            this.position;
            mat4.identity(this.mvMatrix);

    }
    Object3D.prototype = {
        constructor: Object3D,
        getVertices: function () {
            return this.Vertices;
        },
        rotate: function (a, b, c, d) {
            mat4.rotate(this.mvMatrix, a, [b, c, d]);
        },
        scale: function (x, y, z) {
            mat4.scale(this.mvMatrix, [x, y, z]);
        },
        translate: function (x, y, z) {
            mat4.translate(this.mvMatrix, [x, y, z]);
        },
        addTexture: function (img_src) {
            this.imageTexture = img_src;
        },
        getPositionX: function (){
            return this.mvMatrix[12];
        },
        getPositionY: function() {
            return this.mvMatrix[13];
        },
    }

    function Plane() {
        Object3D.call(this);
        this.Type = 'Plane';
        this.Vertices = [
           -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, -1.0, 0.0
        ];
        this.TextureCoord = [
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
        ];
        this.Normal = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];
    }
    Plane.prototype = Object.create(Object3D.prototype);

    function Cube() {
        Object3D.call(this);
        this.Type = 'Cube';
        this.Vertices = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

             // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ];
        this.TextureCoord = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Top face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Bottom face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Right face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];
        this.Index = [
            0, 1, 2, 0, 2, 3, // Front face
            4, 5, 6, 4, 6, 7, // Back face
            8, 9, 10, 8, 10, 11, // Top face
            12, 13, 14, 12, 14, 15, // Bottom face
            16, 17, 18, 16, 18, 19, // Right face
            20, 21, 22, 20, 22, 23 // Left face
        ];
        this.Normal = [
            //front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            //back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            //top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            //bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            //right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            //left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
        ]
    }
    Cube.prototype = Object.create(Object3D.prototype);

    function Sphere() {
        Object3D.call(this);
        this.Type = 'Sphere';
        var latitudeBands = 30;
        var longitudeBands = 30;
        var radius = 2;
        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);
                this.Normal.push(x);
                this.Normal.push(y);
                this.Normal.push(z);
                this.TextureCoord.push(u);
                this.TextureCoord.push(v);
                this.Vertices.push(radius * x);
                this.Vertices.push(radius * y);
                this.Vertices.push(radius * z);
            }
        }

        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                this.Index.push(first);
                this.Index.push(second);
                this.Index.push(first + 1);

                this.Index.push(second);
                this.Index.push(second + 1);
                this.Index.push(first + 1);
            }
        }
    }
    Sphere.prototype = Object.create(Object3D.prototype);

    exports.Scene = Scene;
    exports.PerspectiveCamera = PerspectiveCamera;
    exports.Object3D = Object3D;
    exports.Plane = Plane;
    exports.Cube = Cube;
    exports.Sphere = Sphere;


    Object.defineProperty(exports, '__esModule', {
        value: true
    });
})));
