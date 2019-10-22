var LibraryView = new function() {
	this.useHeader			= true;
	this.useNav				= false;
	this.useFooter			= false;
	this.useMultiWindows	= false;
	
	this.headerHeight		= 28;
	this.headerHide			= false;
	
	this.header;
	this.body;
	this.headerLogo;
	this.topMenu;
	
	this.windows			= new Array();
	this.windowsIndex		= 11;
	this.currentWindow;
	
	this.cursor;
	
	this.dragPointX;
	this.dragPointY;
	this.dragPointA;
	this.dragWindow;
	
	this.screenHeight;
	this.screenWidth;

	this.alerts 			= new Array();
	this.alertScreen
    
    this.init = function() {
		// Draw wallpaper
		this.wallpaper = new DIImageView('./System/Desk/Resources/Wallpaper/Blured/default.png', 'DIWallpaper');
        document.body.appendChild(this.wallpaper.body);


        this.workSpaceDock = new DIWorkSpaceDock('WorkSpaceDock');
		document.body.appendChild(this.workSpaceDock.body);
        this.workSpaceDock.didMoveToDesk();
        

        this.header = new DIView(false, 'header');
        document.body.appendChild(this.header.body);
        
        this.headerLogo = new DIImageView("./System/Desk/Resources/EDUspaceLogoWhite.svg", false, 'headerLogo');
		this.header.addChildView(this.headerLogo);
        //this.loadLogoAsInline();
        this.topMenu = new DIView(false, 'topMenu');
        this.header.addChildView(this.topMenu);



		this.body = new DIView(false, 'body');
		
		this.body.x = 64;
        this.body.y = 28;
        


        

        this.screenHeight = document.documentElement.clientHeight;
		this.screenWidth = document.documentElement.clientWidth;


        this.canvas = document.createElement('CANVAS');
		document.body.appendChild(this.canvas);
		this.canvas.style.display = "none";
        this.cursor=["auto","default","wait","pointer","text","vertical-text","copy","not-allowed","ns-resize","ew-resize"];
		
		// Init contextMenu
		this.contextMenu = new DIListView(this, this, 1, "DIContextMenu");
		this.contextMenu.cellHeight = 25;
        this.contextList = new Array();
        
		// Init desk menu
		this.listView = new DIView(false,"listview");
	
		this.listView.x = 64;
        this.listView.y = 28;
		this.listView.width = 200;
		this.listView.style= "height : 100%";
		
		console.log("LOG")
        this.listView.body.style.backgroundColor = "red";
		this.body.body.appendChild(this.listView.body);


        this.libraryPage = new DIView(false,"libraryPage") 
    
        this.libraryPage.x = 264;
        this.libraryPage.y = 28
        this.listView.body.style.backgroundColor = "blue";

        this.body.body.appendChild(this.libraryPage.body);
        document.body.appendChild(this.body.body);
    }


    this.startDrag = function(clipboard, view, x, y, originalX, originalY) {
		var i = 0;
		for(;i<Secretary.mainWorkSpace.apps.length;i++) {
			if(Secretary.mainWorkSpace.apps[i].allowDrag) {
				Secretary.mainWorkSpace.apps[i].dragStart(clipboard);
			}
		}
		this.dragEnded = false;
		
		document.body.appendChild(view.body);
		view.body.style.zIndex = 100000;
		
		var difX = originalX - x;
		var difY = originalY - y;
		view.x = x + difX;
		view.y = y + difY;
		
		this.lastDragApp = null;
		this.currentDragApp = null;
		
		this.dragEvent = new DeskEvent(document.body, "mousemove", function(evt) {
			// find where the cursor is on
			if(evt.clientY < LibraryView.headerHeight) {
				// client on header
			} else {
				if(evt.clientX < this.body.x) {
					// client on dock
				} else {
					var i = 0;
					var app;
					for(;i<Secretary.mainWorkSpace.apps.length;i++) {
						app = Secretary.mainWorkSpace.apps[i];
						if(app.allowDrag) {
							if((app.window.x + this.body.x) < evt.clientX && (app.window.x + app.window.width + this.body.x) > evt.clientX) {
								app.dragOn(evt.clientX,evt.clientY);
							}
						}
					}
				}
			}
			view.x = evt.clientX + difX;
			view.y = evt.clientY + difY;
			if(this.currentDragApp != this.lastDragApp) {
				if(this.lastDragApp)
					this.lastDragApp.dragLeft();
			}
			this.lastDragApp = this.currentDragApp;
			this.currentDragApp = null;
		}.bind(this), false);
		this.dragEvent.target.addEventListener(this.dragEvent.method,this.dragEvent.evtFunc,true);
		
		this.dropEvent = new DeskEvent(document.body, "mouseup", function(evt) {
			// find where the cursor is on
			if(evt.clientY < LibraryView.headerHeight) {
				// client on header
			} else {
				if(evt.clientX < this.body.x) {
					// client on dock
				} else {
					var i = 0;
					var app;
					for(;i<Secretary.mainWorkSpace.apps.length;i++) {
						app = Secretary.mainWorkSpace.apps[i];
						if(app.allowDrag) {
							if((app.window.x + this.body.x) < evt.clientX && (app.window.x + app.window.width + this.body.x) > evt.clientX) {
								app.dragEnd(true, clipboard, evt.clientX,evt.clientY);
							} else {
								app.dragEnd(false);
							}
						}
					}
				}
			}
			
			// gap -m-
			
			if(!this.dragEnded) {
				// non of the apps captured the drag
				view.body.style.transition = "all .3s ease";
				view.x = originalX;
				view.y = originalY;
				setTimeout(function() {
					view.delete();
					view = null;
				}, 300);
			} else {
				view.delete();
				view = null;
			}
			this.lastDragApp = null;
			this.currentDragApp = null;
			
			this.dragEvent.target.removeEventListener(this.dragEvent.method,this.dragEvent.evtFunc, true);
			this.dragEvent.stopped = true;
			this.dragEvent.delete();
			this.dragEvent = null;
			this.dropEvent.target.removeEventListener(this.dropEvent.method,this.dropEvent.evtFunc, false);
			this.dropEvent.stopped = true;
			this.dropEvent.delete();
			this.dropEvent = null;
			
			this.dropEsc.delete();
			this.dropEsc = null;
		}.bind(this), false); // use bubbling instead of capturing
		this.dropEvent.target.addEventListener(this.dropEvent.method,this.dropEvent.evtFunc, false);
		
		this.dropEsc = new DeskEvent(window, "keydown", function(evt) {
			if(evt.keyCode == 27) { // esc
				if(this.currentDragApp != null)
					this.currentDragApp.dragLeft();
				if(this.currentDragApp != this.lastDragApp) {
					if(this.lastDragApp)
						this.lastDragApp.dragLeft();
				}
				var i = 0;
				var app;
				for(;i<Secretary.mainWorkSpace.apps.length;i++) {
					app = Secretary.mainWorkSpace.apps[i];
					if(app.allowDrag) {
						app.dragEnd(false);
					}
				}
				// canceling drag
				view.body.style.transition = "all .3s ease";
				view.x = originalX;
				view.y = originalY;
				setTimeout(function() {
					view.delete();
					view = null;
				}, 300);
				this.lastDragApp = null;
				this.currentDragApp = null;
				this.dragEvent.target.removeEventListener(this.dragEvent.method,this.dragEvent.evtFunc, true);
				this.dragEvent.stopped = true;
				this.dragEvent.delete();
				this.dragEvent = null;
				this.dropEvent.target.removeEventListener(this.dropEvent.method,this.dropEvent.evtFunc, false);
				this.dropEvent.stopped = true;
				this.dropEvent.delete();
				this.dropEvent = null;
				
				this.dropEsc.delete();
				this.dropEsc = null;
			}
		}.bind(this));
    }
    this.loadLogoAsInline = function() { // load logo as inline svg file
		var ajax = new XMLHttpRequest();
		ajax.open("GET", this.headerLogo.imageSource);
		ajax.addEventListener('load', function(evt) {
			this.headerLogo.imageBody.remove();
			this.headerLogo.imageBody = document.createElement('SVG');
			this.headerLogo.body.appendChild(this.headerLogo.imageBody);
			//var str = evt.target.responseText.substr(evt.target.responseText.indexOf('<svg'));
			//this.headerLogo.imageBody.outerHTML = str;
			this.headerLogo.imageBody.outerHTML = evt.target.responseText;
			this.headerLogo.imageBody = this.headerLogo.body.children[0];
		}.bind(this));
		ajax.send();
    }
    

    this.closeWindow = function(window) {
		if(window == LibraryView.currentWindow)
            LibraryView.currentWindow = null;
		window.delete();
		window = null;
	}
}