function Game()
{
    this.gameLoop = null;
    var self = this;
    var keyPressed;
    var MapFile;
    
    // Scene management
    var GUI_Mode = 0;/* 0 = Game
                        1 = GUI
                        2 = Pause
                     */
                      
    var cur_layer = 0;/* 0 = Base
                         1 = Shadow
                         2 = Foreground
                     */
    
    // Timing
    var prevTime = Date.now();
    var delta = 0;
    var elapsedTime = 0;
    var frame = 0;
    var FPS = 0;
    var tickTime = 0;
    var ticks = 1;
    var seconds = 0;
    var paused = false;

    // Context
    var _canvas = null;
    var _buffer = null;
    var canvas = null;
    var buffer = null;

    // Graphics
    var terrain;
    terrain = new Image();
    terrain.src = ('Graphics/terrain.png');
    
    var GUI_Buttons;
    GUI_Buttons = new Image();
    GUI_Buttons.src = ('Graphics/GUI_Buttons.png');
    
    // Input
    var mouseX = 0;
	var mouseY = 0;
    var mouseClick = false;
    var mouseTile_x = 0;
    var mouseTile_y = 0;
    
    var Keys = [0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0];
	
      
    var keysDown = {};

    addEventListener("keydown", function(e)
    {
        keysDown[e.keyCode] = true;
        keyPressed = e.keyCode;
    }, false);

    addEventListener("keyup", function(e)
    {
        keysDown[e.keyCode] = false;
    }, false);
	
	addEventListener("mousemove", function(e)
    {
        getMousePos(_canvas, e);
    }, false);
    
	addEventListener("click", doMouseClick, false);
    
    addEventListener("mousedown", doMouseDown, false);
    
    addEventListener("mouseup", doMouseUp, false);
    
    function getMousePos(canvas, evt)
	{
		// get canvas position
		var obj = canvas;
		var top = 0;
		var left = 0;
		while (obj && obj.tagName != 'BODY')
        {
			top += obj.offsetTop;
			left += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	 
		// return relative mouse position
		mouseX = evt.clientX - left + window.pageXOffset;
		mouseY = evt.clientY - top + window.pageYOffset;
	}
	
    function doMouseClick(e)
	{
        switch(GUI_Mode)
        {
            case 0:
            {
                break;
            }
            case 1:
            {
                // Set current tiles selected
                for(var a = 0; a < design_frames.length; a++)
                {
                        if(mouseX >= design_frames[a].posX && mouseX <= design_frames[a].posX + design_frames[a].width &&
                           mouseY >= design_frames[a].posY && mouseY <= design_frames[a].posY + design_frames[a].height)
                        {
                            design_frames[a].SelectBox = true;
                            paint_tile.tileX = design_tiles[a].tileX;
                            paint_tile.tileY = design_tiles[a].tileY;
                            paint_tile.update();
                        }
                        else
                        {
                            design_frames[a].SelectBox = false;
                        }
                }
                
                for(var a = 0; a < design_buttons.length; a++)
                {
                        if(mouseX >= design_buttons[a].posX && mouseX <= design_buttons[a].posX + design_buttons[a].width &&
                           mouseY >= design_buttons[a].posY && mouseY <= design_buttons[a].posY + design_buttons[a].height)
                        {
                            design_buttons[a].SelectBox = true;
                            design_buttons[a].action();
                        }
                        else
                        {
                            design_buttons[a].SelectBox = false;
                        }
                }
                break;
            }
            case 2:
            {
                break;
            }
        }
    }
    
    function doMouseDown(e)
    {
        mouseClick = true;
    }
    
    function doMouseUp(e)
    {
        mouseClick = false;
    }
        
    /******************************************************/
    // Classes
    /******************************************************/  
    function mapTile(X, Y, Z, tX, tY)
    {
        this.posX = X;
        this.posY = Y;
        this.posZ = Z;
        this.width = 32;
        this.height = 32;
        this.tileWidth = 32;
        this.tileHeight = 32;
        this.isAutoTile = false;
        
        this.tileX = tX * this.tileWidth;
            if(this.tileX > 480){this.tileX = 480;}
            if(this.tileX < 0){this.tileX = 0;}
        this.tileY = tY * this.tileHeight;
            if(this.tileY > 480){this.tileY = 480;}
            if(this.tileY < 0){this.tileY = 0;}
        
        if(this.tileX == 0 && this.tileY == 0)
        {
            this.isAutoTile = true;
        }
        else
        {
            this.isAutoTile = false;
        }
        
        this.minX = this.posX;
        this.minY = this.posY;
        this.maxX = this.minX + this.width;
        this.maxY = this.minY + this.height;
        
        this.HighlightBox = false;
        this.SelectBox = false;
        
        this.update = function()
        {
            if(this.tileX == 0 && this.tileY == 0)
            {
                this.isAutoTile = true;
            }
            else
            {
                this.isAutoTile = false;
            }
            this.tileString = (this.tileX / 32) + "," + (this.tileY / 32) + ",";
        }
    }
    
    function map()
    {
        this.tiles = new Array(1500);
        this.mapString = "";
        if(typeof MapFile === 'undefined' || MapFile == null)
        {
            for(var z = 0; z < 3; z++)
            {
                for(var y = 0; y < 20; y++)
                {
                    for(var x = 0; x < 25; x++)
                    {
                        this.tiles[x + (y * 25) + ((25 * 20) * z)] = new mapTile(x * 32, y * 32, z, 5, 1);
                    }
                }
            }
            this.mapString = "";
            for(var a = 0; a < this.tiles.length; a++)
            {
                this.tiles[a].update();
                this.mapString = this.mapString + this.tiles[a].tileString;
            }
        }
        else
        {
            this.mapString = MapFile;
            this.mapLoad = this.mapString.split(",");
            this.mapLoadIndex = 0;
            
            for(var z = 0; z < 3; z++)
            {
                for(var y = 0; y < 20; y++)
                {
                    for(var x = 0; x < 25; x++)
                    {
                        this.tiles[x + (y * 25) + ((25 * 20) * z)] = new mapTile(x * 32, y * 32, z, this.mapLoad[this.mapLoadIndex], this.mapLoad[this.mapLoadIndex + 1]);
                        this.mapLoadIndex += 2;
                    }
                }
            }
            this.mapString = "";
            for(var a = 0; a < this.tiles.length; a++)
            {
                this.tiles[a].update();
                this.mapString = this.mapString + this.tiles[a].tileString;
            }
        }
        
        this.update = function()
        {
            this.mapString = "";
            for(var a = 0; a < this.tiles.length; a++)
            {
                this.tiles[a].update();
                this.mapString = this.mapString + this.tiles[a].tileString;
            }
        }
    }
    
    function GUI_Frame(X, Y, W, H)
    {
        this.posX = X;
        this.posY = Y;
        this.width = W;
        this.height = H;
        
        this.HighlightBox = false;
        this.SelectBox = false;
        this.isSelectable = true;
    }
    
    function GUI_Button(X, Y, tX, tY, Type)
    {
        this.type = Type; /* 0 = Save
                             1 = Open
                             2 = Toggle
                          */
        this.posX = X;
        this.posY = Y;
        this.width = 64;
        this.height = 32;
        this.tileWidth = this.width;
        this.tileHeight = this.height;
        this.tileX = tX * this.tileWidth;
        this.tileY = tY * this.tileHeight;
        
        this.minX = this.posX;
        this.minY = this.posY;
        this.maxX = this.minX + this.width;
        this.maxY = this.minY + this.height;
        
        this.HighlightBox = false;
        this.SelectBox = false;
        
        this.action = function()
        {
            switch(this.type)
            {
                case 0: // Save
                {
                    var map_name = prompt("Please enter map name", "cur_map");
                    if (map_name != null && map_name != "")
                    {
                        alert("Saving map as: " + map_name);
                    }
                    else
                    {
                        map_name = "cur_map";
                        alert("Saving map as: " + map_name);
                    }
                    
                    var data = {};
                    data['mapData'] = map.mapString;
                    saveMap("saveMap.php", data, "POST", map_name);
                    saveMap("saveMap.php", data, "POST", "cur_map");
                    
                    break;
                }
                
                case 1: // Open
                {
                    var map_name = prompt("Please enter map name", "cur_map");
                    if (map_name != null && map_name != "")
                    {
                        alert("Opening map: " + map_name);
                    }
                    else
                    {
                        map_name = "cur_map";
                        alert("Map does not exist!/nOpening map: " + map_name);
                    }
                    
                    loadMap("loadMap.php", "POST", map_name);
                    break;
                }
                
                case 2: // Toggle
                {
                    
                    if(cur_layer >= 2)
                    {
                        cur_layer ==0;
                    }
                    else
                    {
                        cur_layer++;
                    }
                }
            }
        }
    }
    
    function saveMap(path, params, method, mapName)
    {
        method = method || "post"; // Set method to post by default, if not specified.

        // The rest of this code assumes you are not using a library.
        // It can be made less wordy if you use one.
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", path);

        for(var key in params)
        {
            if(params.hasOwnProperty(key))
            {
                var cur_map_data = document.createElement("input");
                cur_map_data.setAttribute("type", "hidden");
                cur_map_data.setAttribute("name", key);
                cur_map_data.setAttribute("value", params[key]);

                form.appendChild(cur_map_data);
             }
        }
        
        var cur_map_name = document.createElement("input");
        cur_map_name.setAttribute("type", "hidden");
        cur_map_name.setAttribute("name", "mapName");
        cur_map_name.setAttribute("value", mapName);

        form.appendChild(cur_map_name);
        
        document.body.appendChild(form);
        form.submit();
    }

    function loadMap(path, method, mapName)
    {
        method = method || "post"; // Set method to post by default, if not specified.

        // The rest of this code assumes you are not using a library.
        // It can be made less wordy if you use one.
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", path);
        
        var cur_map_name = document.createElement("input");
        cur_map_name.setAttribute("type", "hidden");
        cur_map_name.setAttribute("name", "mapName");
        cur_map_name.setAttribute("value", mapName);

        form.appendChild(cur_map_name);
        
        document.body.appendChild(form);
        form.submit();
    }
    
    /******************************************************/

    /******************************************************/
    // Global Objects
    /******************************************************/  
    designerFrame = new GUI_Frame(576, 16, 208, 496);
    designerFrame.isSelectable = false;
    
    var design_frames = new Array(40); /*4 x 10*/
    for(var i = 0; i < 4; i++)
    {
        for(var j = 0; j < 10; j++)
        {
            design_frames[i + (j * 4)] = new GUI_Frame(592 + (i * 48), 32 + (j * 48), 32, 32);
        }
    }
    
    var design_tiles = new Array(40);
    for(var i = 0; i < 4; i++)
    {
        for(var j = 0; j < 10; j++)
        {
            design_tiles[i + (j * 4)] = new mapTile(592 + (i * 48), 32 + (j * 48), 0, i, j);
        }
    }
    
    var design_buttons = new Array(4);
    for(var i = 0; i < 2; i++)
    {
        design_buttons[i] = new GUI_Button(592 + (112 * i), 512, i, 0, i);
    }
    
    design_buttons[2] = new GUI_Button(664, 512, 0, 0, 2);
    design_buttons[2].width = 32;
    design_buttons[2].tileWidth = design_buttons[2].width;
    design_buttons[2].tileX = design_buttons[2].tileWidth * 5;
    
    design_buttons[3] = new GUI_Button(664, 512, 0, 0, 2);
    design_buttons[3].width = 32;
    design_buttons[3].tileWidth = design_buttons[3].width;
    design_buttons[3].tileX = design_buttons[3].tileWidth * 6;
    
    design_buttons[4] = new GUI_Button(664, 512, 0, 0, 2);
    design_buttons[4].width = 32;
    design_buttons[4].tileWidth = design_buttons[4].width;
    design_buttons[4].tileX = design_buttons[4].tileWidth * 7;
    
    var paint_tile = new mapTile(0, 0, 0, 0, 0);
    /******************************************************/  
    
    /******************************************************/
    // Initialization
    /******************************************************/
    
    this.Init = function(contents)
    {
        MapFile = contents;
        
        _canvas = document.getElementById('canvas');
        if(_canvas && _canvas.getContext)
        {
            canvas = _canvas.getContext('2d');

            _buffer = document.createElement('canvas');
            _buffer.width = _canvas.width;
            _buffer.height = _canvas.height;
            buffer = _buffer.getContext('2d');

            buffer.strokeStyle = "rgb(255, 255, 255)";
            buffer.fillStyle = "rgb(255, 255, 255)";
            buffer.font = "bold 25px sans-serif";
        }
        map = new map();
    }
    
    /******************************************************/

    /******************************************************/
    // Update
    /******************************************************/
    this.Update = function()
    {
        // Input
        self.doInput();
        self.getInput();
        self.mouseSelect();
        switch(GUI_Mode)
        {
            case 0:
            {
                if(mouseClick == true)
                {
                    if(paint_tile.isAutoTile == true)
                    {
                        
                    }
                    else
                    {
                        // Set current tiles selected
                        mouseTile_x = Math.floor((mouseX / 800) * 25);
                        if(mouseTile_x < 0){mouseTile_x = 0;}
                        if(mouseTile_x > 24){mouseTile_x = 24;}
                        
                        mouseTile_y = Math.floor((mouseY / 640) * 20);
                        if(mouseTile_y < 0){mouseTile_y = 0;}
                        if(mouseTile_y > 19){mouseTile_y = 19;}
                        
                        map.tiles[mouseTile_x + (mouseTile_y * 25) + ((25 * 20) * cur_layer)].tileX = paint_tile.tileX;
                        map.tiles[mouseTile_x + (mouseTile_y * 25) + ((25 * 20) * cur_layer)].tileY = paint_tile.tileY;
                        paint_tile.posZ = cur_layer;
                    }
                }
                break;
            }
            case 1:
            {
                break;
            }
            case 2:
            {
                break;
            }
        }
        map.update();
    }
    
    this.mouseSelect = function()
    {
        switch(GUI_Mode)
        {
            case 0:
            {
                // Set current tiles highlighted
                mouseTile_x = Math.floor((mouseX / 800) * 25);
                if(mouseTile_x < 0){mouseTile_x = 0;}
                if(mouseTile_x > 24){mouseTile_x = 24;}
                
                mouseTile_y = Math.floor((mouseY / 640) * 20);
                if(mouseTile_y < 0){mouseTile_y = 0;}
                if(mouseTile_y > 19){mouseTile_y = 19;}
                
                for(var z = 0; z < 3; z++)
                {
                    for(var y = 0; y < 20; y++)
                    {
                        for(var x = 0; x < 25; x++)
                        {
                            map.tiles[x + (y * 25) + ((25 * 20) * z)].HighlightBox = false;
                        }            
                    }
                }
                map.tiles[mouseTile_x + (mouseTile_y * 25) + ((25 * 20) * cur_layer)].HighlightBox = true;
                
                // Reset non-current tiles highlighted
                for(var a = 0; a < design_frames.length; a++)
                {
                    design_frames[a].HighlightBox = false;
                }  
                break;
            }
            case 1:
            {
                // Set current tiles highlighted
                for(var a = 0; a < design_frames.length; a++)
                {
                    if(mouseX >= design_frames[a].posX && mouseX <= design_frames[a].posX + design_frames[a].width &&
                       mouseY >= design_frames[a].posY && mouseY <= design_frames[a].posY + design_frames[a].height)
                    {
                        design_frames[a].HighlightBox = true;
                    }
                    else
                    {
                        design_frames[a].HighlightBox = false;
                    }
                }
                
                for(var a = 0; a < design_buttons.length; a++)
                {
                    if(mouseX >= design_buttons[a].posX && mouseX <= design_buttons[a].maxX &&
                       mouseY >= design_buttons[a].posY && mouseY <= design_buttons[a].maxY)
                    {
                        design_buttons[a].HighlightBox = true;
                    }
                    else
                    {
                        design_buttons[a].HighlightBox = false;
                    }
                }
                
                // Reset non-current tiles highlighted
                for(var y = 0; y < 20; y++)
                {
                    for(var x = 0; x < 25; x++)
                    {
                        map.tiles[x + (y * 25) + ((25 * 20) * cur_layer)].HighlightBox = false;
                    }            
                }
                break;
            }
            case 2:
            {
                
                break;
            }
        }
    }
    
    this.doInput = function()
    {
		//Do Keyboard Input
        if(keysDown[38] == true || keysDown[87] == true) // W || Up
        {if(Keys[0] == 0){Keys[0] = 1;}else if(Keys[0] == 1 || Keys[0] == 2){Keys[0] = 2;}}else if(keysDown[38] == false || keysDown[87] == false){if(Keys[0] == 1 || Keys[0] == 2){Keys[0] = 0;}}
        
        if(keysDown[37] == true || keysDown[65] == true) // A || Left
        {if(Keys[1] == 0){Keys[1] = 1;}else if(Keys[1] == 1 || Keys[1] == 2){Keys[1] = 2;}}else if(keysDown[37] == false || keysDown[65] == false){if(Keys[1] == 1 || Keys[1] == 2){Keys[1] = 0;}}

        if(keysDown[40] == true || keysDown[83] == true) // S || Down
        {if(Keys[2] == 0){Keys[2] = 1;}else if(Keys[2] == 1 || Keys[2] == 2){Keys[2] = 2;}}else if(keysDown[40] == false || keysDown[83] == false){if(Keys[2] == 1 || Keys[2] == 2){Keys[2] = 0;}}

        if(keysDown[39] == true || keysDown[68] == true) // D || Right
        {if(Keys[3] == 0){Keys[3] = 1;}else if(Keys[3] == 1 || Keys[3] == 2){Keys[3] = 2;}}else if(keysDown[39] == false || keysDown[68] == false){if(Keys[3] == 1 || Keys[3] == 2){Keys[3] = 0;}}

        if(keysDown[81] == true) // Q
        {if(Keys[4] == 0){Keys[4] = 1;}else if(Keys[4] == 1 || Keys[4] == 2){Keys[4] = 2;}}else if(keysDown[81] == false){if(Keys[4] == 1 || Keys[4] == 2){Keys[4] = 0;}}
        
        if(keysDown[69] == true) // E
        {if(Keys[5] == 0){Keys[5] = 1;}else if(Keys[5] == 1 || Keys[5] == 2){Keys[5] = 2;}}else if(keysDown[69] == false){if(Keys[5] == 1 || Keys[5] == 2){Keys[5] = 0;}}

        if(keysDown[48] == true) // 0
        {if(Keys[6] == 0){Keys[6] = 1;}else if(Keys[6] == 1 || Keys[6] == 2){Keys[6] = 2;}}else if(keysDown[48] == false){if(Keys[6] == 1 || Keys[6] == 2){Keys[6] = 0;}}

        if(keysDown[49] == true) // 1
        {if(Keys[7] == 0){Keys[7] = 1;}else if(Keys[7] == 1 || Keys[7] == 2){Keys[7] = 2;}}else if(keysDown[49] == false){if(Keys[7] == 1 || Keys[7] == 2){Keys[7] = 0;}}

        if(keysDown[50] == true) // 2
        {if(Keys[8] == 0){Keys[8] = 1;}else if(Keys[8] == 1 || Keys[8] == 2){Keys[8] = 2;}}else if(keysDown[50] == false){if(Keys[8] == 1 || Keys[8] == 2){Keys[8] = 0;}}

        if(keysDown[51] == true) // 3
        {if(Keys[9] == 0){Keys[9] = 1;}else if(Keys[9] == 1 || Keys[9] == 2){Keys[9] = 2;}}else if(keysDown[51] == false){if(Keys[9] == 1 || Keys[9] == 2){Keys[9] = 0;}}

        if(keysDown[52] == true) // 4
        {if(Keys[10] == 0){Keys[10] = 1;}else if(Keys[10] == 1 || Keys[10] == 2){Keys[10] = 2;}}else if(keysDown[52] == false){if(Keys[10] == 1 || Keys[10] == 2){Keys[10] = 0;}}

        if(keysDown[53] == true) // 5
        {if(Keys[11] == 0){Keys[11] = 1;}else if(Keys[11] == 1 || Keys[11] == 2){Keys[11] = 2;}}else if(keysDown[53] == false){if(Keys[11] == 1 || Keys[11] == 2){Keys[11] = 0;}}

        if(keysDown[54] == true) // 6
        {if(Keys[12] == 0){Keys[12] = 1;}else if(Keys[12] == 1 || Keys[12] == 2){Keys[12] = 2;}}else if(keysDown[54] == false){if(Keys[12] == 1 || Keys[12] == 2){Keys[12] = 0;}}

        if(keysDown[55] == true) // 7
        {if(Keys[13] == 0){Keys[13] = 1;}else if(Keys[13] == 1 || Keys[13] == 2){Keys[13] = 2;}}else if(keysDown[55] == false){if(Keys[13] == 1 || Keys[13] == 2){Keys[13] = 0;}}

        if(keysDown[56] == true) // 8
        {if(Keys[14] == 0){Keys[14] = 1;}else if(Keys[14] == 1 || Keys[14] == 2){Keys[14] = 2;}}else if(keysDown[56] == false){if(Keys[14] == 1 || Keys[14] == 2){Keys[14] = 0;}}

        if(keysDown[57] == true) // 9
        {if(Keys[15] == 0){Keys[15] = 1;}else if(Keys[15] == 1 || Keys[15] == 2){Keys[15] = 2;}}else if(keysDown[57] == false){if(Keys[15] == 1 || Keys[15] == 2){Keys[15] = 0;}}

        if(keysDown[32] == true) // Space
        {if(Keys[16] == 0){Keys[16] = 1;}else if(Keys[16] == 1 || Keys[16] == 2){Keys[16] = 2;}}else if(keysDown[32] == false){if(Keys[16] == 1 || Keys[16] == 2){Keys[16] = 0;}}
        
        if(keysDown[27] == true) // Escape
        {if(Keys[17] == 0){Keys[17] = 1;}else if(Keys[17] == 1 || Keys[17] == 2){Keys[17] = 2;}}else if(keysDown[27] == false){if(Keys[17] == 1 || Keys[17] == 2){Keys[17] = 0;}}
        
        if(keysDown[13] == true) // Enter
        {if(Keys[18] == 0){Keys[18] = 1;}else if(Keys[18] == 1 || Keys[18] == 2){Keys[18] = 2;}}else if(keysDown[13] == false){if(Keys[18] == 1 || Keys[18] == 2){Keys[18] = 0;}}
		
        if(keysDown[66] == true) // B
        {if(Keys[19] == 0){Keys[19] = 1;}else if(Keys[19] == 1 || Keys[19] == 2){Keys[19] = 2;}}else if(keysDown[66] == false){if(Keys[19] == 1 || Keys[19] == 2){Keys[19] = 0;}}
    }
    
    this.getInput = function()
    {
        if(Keys[4] == 1) // Q
        {
            if(GUI_Mode == 0)
            {
                GUI_Mode = 1;
            }
            else if(GUI_Mode == 1)
            {
                GUI_Mode = 0;
            }
        }
        if(Keys[7] == 1) // 1
        {
			cur_layer = 0;
        }
        if(Keys[8] == 1) // 2
        {
			cur_layer = 1;
        }
        if(Keys[9] == 1) // 3
        {
			cur_layer = 2;
        }
    }

    /******************************************************/

    /******************************************************/
    // Draw
    /******************************************************/
    this.Draw = function()
    {
        buffer.clearRect(0, 0, _buffer.width, _buffer.height);
        canvas.clearRect(0, 0, _canvas.width, _canvas.height);
    
        //Draw Code
        var x = _buffer.width / 2;
        var y = _buffer.height / 2;
        buffer.lineWidth = 1;
        
        // Background
        buffer.fillStyle = "rgb(0, 0, 0)";
        buffer.fillRect(0, 0, _buffer.width, _buffer.height);
        
        // Draw map
        self.drawMap();
        switch(GUI_Mode)
        {
            case 0:
            {
                break;
            }
            case 1:
            {
                // Draw GUI
                self.drawGUI();
                break;
            }
            case 2:
            {
                
                break;
            }
        }
        
        canvas.drawImage(_buffer, 0, 0);
    }
    
    this.drawMap = function()
    {
        for(var z = 0; z < 3; z++)
        {
            for(var x = 0; x < 25; x++)
            {
                for(var y = 0; y < 20; y++)
                {
                    buffer.drawImage(terrain,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].tileX,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].tileY,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].tileWidth,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].tileHeight,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].posX,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].posY,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].width,
                                     map.tiles[x + (y * 25) + ((25 * 20) * z)].height);
                                     
                    self.drawTileBox(map.tiles[x + (y * 25) + ((25 * 20) * z)]);
                }            
            }
        }
    }
    
    this.drawTileBox = function(tile)
    {
        if(tile.HighlightBox == true)
        {
            buffer.beginPath();
                buffer.fillStyle = "rgba(0, 192, 255, 0.25)";
                buffer.fillRect(tile.minX, tile.minY, tile.width, tile.height);
            buffer.closePath();
        }
        if(tile.SelectBox == true)
        {
            buffer.beginPath();
                buffer.fillStyle = "rgba(0, 192, 255, 0.5)";
                buffer.fillRect(tile.minX, tile.minY, tile.width, tile.height);
            buffer.closePath();
        }
    }
    
    this.drawGUI = function()
    {
        // Background
        buffer.beginPath();
            buffer.fillStyle = "rgba(165, 182, 56, 0.5)";
            buffer.fillRect(designerFrame.posX, designerFrame.posY, designerFrame.width, designerFrame.height + 48);
        buffer.closePath();
        
        // Frame
        buffer.beginPath();
            buffer.lineWidth = 5;
            buffer.strokeStyle = "rgba(167, 72, 96, 0.5)";
                buffer.moveTo(designerFrame.posX, designerFrame.posY);
                buffer.lineTo(designerFrame.posX + designerFrame.width, designerFrame.posY);
                buffer.lineTo(designerFrame.posX + designerFrame.width, designerFrame.posY + designerFrame.height + 48);
                buffer.lineTo(designerFrame.posX, designerFrame.posY + designerFrame.height + 48);
                buffer.lineTo(designerFrame.posX, designerFrame.posY);
            buffer.stroke();
        buffer.closePath();
        
        // Inner
        for(var a = 0; a < design_frames.length; a++)
        {
            buffer.beginPath();
                buffer.fillStyle = "rgba(180, 213, 229, 0.5)";
                buffer.fillRect(design_frames[a].posX, design_frames[a].posY, design_frames[a].width, design_frames[a].height);
            buffer.closePath();
        }
        
        // Tile image
        self.drawDesignTiles();
        
        for(var a = 0; a < design_frames.length; a++)
        {
            // Frame
            buffer.beginPath();
                buffer.lineWidth = 2;
                buffer.strokeStyle = "rgba(233, 214, 154, 0.5)";
                    buffer.moveTo(design_frames[a].posX, design_frames[a].posY);
                    buffer.lineTo(design_frames[a].posX + design_frames[a].width, design_frames[a].posY);
                    buffer.lineTo(design_frames[a].posX + design_frames[a].width, design_frames[a].posY + design_frames[a].height);
                    buffer.lineTo(design_frames[a].posX, design_frames[a].posY + design_frames[a].height);
                    buffer.lineTo(design_frames[a].posX, design_frames[a].posY);
                buffer.stroke();
            buffer.closePath();
            
            self.drawGUI_Box(design_frames[a]);
        }
        
        self.drawButtons();
    }
    
    this.drawGUI_Box = function(GUI_Box)
    {
        if(GUI_Box.HighlightBox == true)
        {
            buffer.beginPath();
                buffer.fillStyle = "rgba(0, 192, 255, 0.25)";
                buffer.fillRect(GUI_Box.posX, GUI_Box.posY, GUI_Box.width, GUI_Box.height);
            buffer.closePath();
        }
        if(GUI_Box.SelectBox == true)
        {
            buffer.beginPath();
                buffer.lineWidth = 5;
                buffer.strokeStyle = "rgba(167, 72, 96, 0.75)";
                    buffer.moveTo(GUI_Box.posX, GUI_Box.posY);
                    buffer.lineTo(GUI_Box.posX + GUI_Box.width, GUI_Box.posY);
                    buffer.lineTo(GUI_Box.posX + GUI_Box.width, GUI_Box.posY + GUI_Box.height);
                    buffer.lineTo(GUI_Box.posX, GUI_Box.posY + GUI_Box.height);
                    buffer.lineTo(GUI_Box.posX, GUI_Box.posY);
                buffer.stroke();
            buffer.closePath();
        }
    }
    
    this.drawDesignTiles = function()
    {
        for(var x = 0; x < 4; x++)
        {
            for(var y = 0; y < 10; y++)
            {
                buffer.drawImage(terrain,
                                 design_tiles[x + (y * 4)].tileX,
                                 design_tiles[x + (y * 4)].tileY,
                                 design_tiles[x + (y * 4)].tileWidth,
                                 design_tiles[x + (y * 4)].tileHeight,
                                 design_tiles[x + (y * 4)].posX,
                                 design_tiles[x + (y * 4)].posY,
                                 design_tiles[x + (y * 4)].width,
                                 design_tiles[x + (y * 4)].height);
            }            
        }
    }
    
    this.drawButtons = function()
    {
        for(var a = 0; a < 2; a++)
        {
            buffer.drawImage(GUI_Buttons,
                             design_buttons[a].tileX,
                             design_buttons[a].tileY,
                             design_buttons[a].tileWidth,
                             design_buttons[a].tileHeight,
                             design_buttons[a].posX,
                             design_buttons[a].posY,
                             design_buttons[a].width,
                             design_buttons[a].height);
        }
        
        switch(cur_layer)
        {
            case 0:
            {
                buffer.drawImage(GUI_Buttons,
                             design_buttons[2].tileX,
                             design_buttons[2].tileY,
                             design_buttons[2].tileWidth,
                             design_buttons[2].tileHeight,
                             design_buttons[2].posX,
                             design_buttons[2].posY,
                             design_buttons[2].width,
                             design_buttons[2].height);
                break;
            }
            
            case 1:
            {
                buffer.drawImage(GUI_Buttons,
                             design_buttons[3].tileX,
                             design_buttons[3].tileY,
                             design_buttons[3].tileWidth,
                             design_buttons[3].tileHeight,
                             design_buttons[3].posX,
                             design_buttons[3].posY,
                             design_buttons[3].width,
                             design_buttons[3].height);
                break;
            }
            
            case 2:
            {
                buffer.drawImage(GUI_Buttons,
                             design_buttons[4].tileX,
                             design_buttons[4].tileY,
                             design_buttons[4].tileWidth,
                             design_buttons[4].tileHeight,
                             design_buttons[4].posX,
                             design_buttons[4].posY,
                             design_buttons[4].width,
                             design_buttons[4].height);
                break;
            }
        }
        
        for(var b = 0; b < design_buttons.length; b++)
        {
            self.drawButtonBox(design_buttons[a]);
        }
    }
    
    this.drawButtonBox = function(button)
    {
        if(button.HighlightBox == true)
        {
            buffer.beginPath();
                buffer.fillStyle = "rgba(0, 192, 255, 0.25)";
                buffer.fillRect(button.minX, button.minY, button.width, button.height);
            buffer.closePath();
        }
        if(button.SelectBox == true)
        {
            buffer.beginPath();
                buffer.lineWidth = 5;
                buffer.strokeStyle = "rgba(167, 72, 96, 0.75)";
                    buffer.moveTo(button.posX, button.posY);
                    buffer.lineTo(button.posX + button.width, button.posY);
                    buffer.lineTo(button.posX + button.width, button.posY + button.height);
                    buffer.lineTo(button.posX, button.posY + button.height);
                    buffer.lineTo(button.posX, button.posY);
                buffer.stroke();
            buffer.closePath();
        }
    }
    
    /******************************************************/

    /******************************************************/
    // Run
    /******************************************************/
    this.Run = function()
    {	
        if(canvas != null)
        {
            self.gameLoop = setInterval(self.Loop, 1);
        }	
    }
    
    /******************************************************/
    
    /******************************************************/
    // Game Loop
    /******************************************************/
    this.Loop = function()
    {
        frame++;
        var curTime = Date.now();
        elapsedTime = curTime - prevTime;
        prevTime = curTime;

        delta = elapsedTime / 1000;

        tickTime += delta;
        if(tickTime >= (ticks / 20))
        {
            ticks++;
            if(ticks >= 20)
            {
                tickTime = 0;
                ticks = 0;
                seconds++;
            }
        }
        if(ticks % 5 == 0)
        {
            FPS = Math.floor(1 / delta);
        }
		
        self.Update();
        self.Draw();	
    }
    /******************************************************/
}