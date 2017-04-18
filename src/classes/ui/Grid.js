export class Grid {

    constructor(cy) {

        this.cy = cy;

        this.container = document.querySelectorAll( '#cy' )[0]; 
        this.canvas = document.querySelectorAll( 'canvas' )[0];
        this.canvas.style.zIndex = 1;

        this.renderCount = 0;

/*
        this.container = document.querySelectorAll( '#cy' )[0]; 
        this.canvas = document.querySelectorAll( 'canvas' )[0].cloneNode(true);
        this.canvas.setAttribute('data-id', 'layer3-grid');

        this.canvas.style.zIndex = 10;
        this.container.appendChild(this.canvas);
*/

        // options
        this.options = {
            stackOrder: -1,
            gridSpacing: 40,
            strokeStyle: '#CCCCCC',
            lineWidth: 1.0,
            lineDash: [5,8],
            zoomDash: true,
            panGrid: true,
            snapToGrid: true,
            drawGrid: true
        };

        // event handlers
        console.log("add event handlers");
        var that = this;
        
        this.cy.on( 'zoom', function(evt){
          console.log( 'zoom triggered' );
          that.drawGrid();
        });

        this.cy.on( 'pan', function(evt){
          console.log( 'pan triggered' );
          that.drawGrid();
        });

        this.cy.on( 'render', function(evt){
          console.log( 'render triggered' );
          that.renderCount++;
          that.resizeCanvas();
          that.drawGrid();
        });

        this.cy.on( 'ready', function(evt){
          console.log( 'ready triggered' );
        });
    }

    resizeCanvas() {
        var canvasWidth = this.container.getBoundingClientRect().width;
        var canvasHeight = this.container.getBoundingClientRect().height;

        this.canvas.setAttribute( 'height', canvasHeight );
        this.canvas.setAttribute( 'width', canvasWidth );
    }

    clearGrid() {
        console.log("clearGrid");

        var canvasWidth = this.canvas.getBoundingClientRect().width;
        var canvasHeight = this.canvas.getBoundingClientRect().height;

        let ctx = this.canvas.getContext( '2d' );
        ctx.clearRect( 0, 0, canvasWidth, canvasHeight );
    }

    drawGrid() {
        console.log("drawGrid: " + this.renderCount);
        
        let ctx = this.canvas.getContext( '2d' );

        var pan = this.cy.pan();
        var zoom = this.cy.zoom();
        console.log("pan: " + JSON.stringify(pan));
        console.log("zoom: " + JSON.stringify(zoom));

        // calc alpha value of the stroke based on the zoom level
        let alpha = zoom < 1.0 ? 1.0 * zoom : 1.0;

        ctx.strokeStyle = 'rgba(150, 150, 150, ' + alpha + ')';
        ctx.lineWidth = this.options.lineWidth ; //* zoom;
        ctx.setLineDash( this.options.lineDash );

        var canvasWidth = this.canvas.getBoundingClientRect().width;
        var canvasHeight = this.canvas.getBoundingClientRect().height;

        console.log("canvasWidth: " + canvasWidth);
        console.log("canvasHeight: " + canvasHeight);



        var increment = this.options.gridSpacing * zoom;
        console.log(increment);

        var initialValueX = pan.x % increment;
        var initialValueY = pan.y % increment;

        ctx.lineDashOffset = -pan.y; // vermeide Flimmern
        
        for (let i = initialValueX; i < canvasWidth; i += increment) {
            ctx.beginPath();
            ctx.moveTo( i, 0 );
            ctx.lineTo( i, canvasHeight );
            ctx.stroke();
        }
        
        ctx.lineDashOffset = -pan.x; // vermeide Flimmern
        for (let i = initialValueY; i < canvasHeight; i += increment) {
            ctx.beginPath();
            ctx.moveTo( 0, i );
            ctx.lineTo( canvasWidth, i );
            ctx.stroke();
        }

    }

}