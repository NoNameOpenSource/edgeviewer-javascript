class DICollectionView extends DIView{
    constructor(className,idName,dataSource,delegate,cellClickType,layout,maxRowItem){
        if(!className)
			className='DICollectionView';
		super(className, idName);
		if(dataSource) {
			this.dataSource = dataSource;
			//initialize Data
			//this.reloadData();
		}
		if(delegate)
			this.delegate = delegate;
        this.cellClickType = cellClickType;
        if(layout)
            this.layout = layout;
        if(!maxRowItem)
            maxRowItem = 4;
        
		if(cellClickType == 0) {
		} else if(cellClickType == 1) {
			this.event = new DeskEvent(this.body, "click", this.clicked.bind(this));
		} else if(cellClickType == 2) {
			this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
		}
		this.cellHeight = 0;
        this.selectedIndex = -1;
        this.reloadTicket = 0;
    }

    reloadData(){
		this.reloadTicket += 1;
		var ticket = this.reloadTicket;
		this.clearChildViews();
		this.selected=null;
		this.selectedIndex=-1;
		var length = this.dataSource.numberOfRows(this);
		for(var i=0; i<length; i++) {
			if(this.reloadTicket == ticket)
				this.addChildView(this.dataSource.cellAtRow(this,i));
			else
				break;
		}
	}

    addItem(){

    }

    putInSleep() {
		if(this.event)
			this.event.stop();
		super.putInSleep();
	}
	
	wakeUp() {
		if(this.event)
			this.event.resume();
		super.wakeUp();
    }
    


}