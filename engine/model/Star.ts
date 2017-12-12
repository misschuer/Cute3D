class Star {
    static count = 0;
	public angle = 0;
    public dist = 0;
    public rotationSpeed = 0;

	public r = 1;
    public g = 1;
    public b = 1;
 
    public twinkleR = 0;
    public twinkleG = 0;
    public twinkleB = 0;

    public x = 0;
    public y = 0;

    public id = 0;

	public constructor(x, y) {
		this.angle = 0;
        // this.dist = startingDistance;
        // this.rotationSpeed = rotationSpeed;
 
        // Set the colors to a starting value.
        this.id = Star.count ++;
        this.x = x;
        this.y = y;
        this.randomiseColors();
	}

	public randomiseColors():void {
		// Give the star a random color for normal
        // circumstances...
        if (this.id > 0) {
            this.r = Math.random();
            this.g = Math.random();
            this.b = Math.random();
        }
        // When the star is twinkling, we draw it twice, once
        // in the color below (not spinning) and then once in the
        // main color defined above.
        this.twinkleR = Math.random();
        this.twinkleG = Math.random();
        this.twinkleB = Math.random();
	}
}