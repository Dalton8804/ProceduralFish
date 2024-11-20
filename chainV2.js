const TAO = Math.PI * 2;

class Spine {
    constructor(context, origin, jointRadii, jointCount, linksize, angleconstraint = TAO) {
        this.linksize = linksize;
        this.angleconstraint = angleconstraint;
        this.joints = [origin.copy()];
        this.angles = [0];
        this.jointCount = jointCount;
        this.jointRadii = jointRadii;

        if (!(this.jointCount > 2)) throw "Assertion Failed: Spine must have at least 3 joints";

        for (let i=1; i<this.jointCount; ++i) {
            this.joints[i] = (Vector.add(this.joints[i-1], new Vector(0, this.linksize)));
            this.angles[i] = (0);
        } 
    }

    resolveAngle(pos) {
        this.angles[0] = Vector.sub(pos, this.joints[0]).heading;
        this.joints[0] = pos;
        for (let i = 1; i < this.joints.length; ++i) {
            let currentAngle = Vector.sub(this.joints[i-1], this.joints[i]).heading;
            this.angles[i] = this.#constrainAngle(currentAngle, this.angles[i-1]);
            this.joints[i] = Vector.sub(this.joints[i-1], Vector.fromAngle(this.angles[i]).setMag(this.linksize));
        }
    }

    // resolveDistance(pos) {
    //     this.joints[0] = pos;
    //     for (let i = 1; i < this.joints.length; i++) {
    //         this.joints[i] = this.#constrainDistance(this.joints[i], this.joints[i-1]);
    //     }
    // }
    
    draw(context) {
        for (let i=0; i<this.joints.length-1; ++i) {
            this.#line(context, this.joints[i], this.joints[i+1]);
        }

        for (let i=0; i<this.joints.length; ++i) {
            this.#circle(context, this.joints[i], this.jointRadii[i]);
        }
    }

    #line(context, startJoint, endJoint) {
        context.beginPath();
        context.strokeStyle = foregroundColor;
        context.lineWidth = 2;
        context.moveTo(startJoint.x, startJoint.y);
        context.lineTo(endJoint.x, endJoint.y);
        context.stroke();
        context.closePath();
    }

    #circle(context, joint, jointRadius) {
        context.beginPath();
        context.arc(joint.x, joint.y, jointRadius, 0,  TAO);
        context.lineWidth = 2; // Adjust the width of the outline
        context.strokeStyle = foregroundColor;
        context.stroke();
        context.closePath();
    }

    #littlecircle(context, x, y) {
        context.beginPath();
        context.arc(x, y, 2, 0,  TAO);
        context.lineWidth = 2; // Adjust the width of the outline
        context.strokeStyle = "red";
        context.stroke();
        context.closePath();
    }

    #sidecircles(context, index) {
        let x, y;
        // if (index === 0) {
        //     x = this.#getPosX(this.joints[index], this.angles[index], 0, 100);
        //     y = this.#getPosY(this.joints[index], this.angles[index], 0, 100);
        //     this.#littlecircle(context, x, y);
        // }


        x = this.#getPosX(this.joints[index], this.angles[index], Math.PI/2, 0);
        y = this.#getPosY(this.joints[index], this.angles[index], Math.PI/2, 0);
        this.#littlecircle(context, x, y);
        

        x = this.#getPosX(this.joints[index], this.angles[index], -Math.PI/2, 0);
        y = this.#getPosY(this.joints[index], this.angles[index], -Math.PI/2, 0);
        this.#littlecircle(context, x, y);

    }

    // #constrainDistance(pos, anchor) {
    //     return Vector.add(anchor, Vector.sub(pos, anchor).setMag(this.linksize));
    // }

    #constrainAngle(angle, anchor) {
        let relAngleDiff = this.#relativeAngleDiff(angle, anchor);
        let a = this.angleconstraint;
        if (Math.abs(relAngleDiff) <= this.angleconstraint) 
            return this.#simplifyAngle(angle);

        if (relAngleDiff > this.angleconstraint) 
            return this.#simplifyAngle(anchor - this.angleconstraint);

        return this.#simplifyAngle(anchor + this.angleconstraint);
    }

    #relativeAngleDiff(angle, anchor) {
        angle = this.#simplifyAngle(angle + Math.PI - anchor);
        anchor = Math.PI;

        return anchor - angle;
    }

    #simplifyAngle(angle) {
        while(angle >= TAO) {
            angle -= TAO;
        }

        while(angle < 0) {
            angle += TAO;
        }

        return angle;
    }

    #getPosX(joint, angle, angleOffset, lengthOffset) {
        return joint.x + Math.cos(angle + angleOffset) * (32 + lengthOffset);
    }

    #getPosY(joint, angle, angleOffset, lengthOffset) {
        return joint.y + Math.sin(angle + angleOffset) * (32 + lengthOffset);
    }


}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.mag = this.#calcMag();
    }

    get mag() {
        return this._mag;
    }

    get heading() {
        return Math.atan2(this.y, this.x);
    }

    set mag(value) {
        this._mag = value;
    }

    setMag(value) {
        this.x = (this.x / this._mag) * value;
        this.y = (this.y / this._mag) * value;
        this._mag = value;
        return this;
    }

    static dist(vec1, vec2) {
        Vector.assertVector(vec1, "static dist.1");
        Vector.assertVector(vec2, "static dist.2");

        return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2));
    }

    static sub(vec1, vec2) {
        Vector.assertVector(vec1, "static sub.1");
        Vector.assertVector(vec2, "static sub.2");
        
        return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
    }

    static add(vec1, vec2) {
        Vector.assertVector(vec1, "static add.1");
        Vector.assertVector(vec2, "static add.2");

        return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
    }

    static fromAngle(angle) {
        if (typeof angle !== 'number') throw "Assertion Failed: Angle must be number";

        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    static assertVector(vec, methodName) {
        if (vec === undefined) throw "Assertion Failed: " + methodName + ": Vector is undefined";
        if (vec === null) throw "Assertion Failed: " + methodName + ": Vector is null";
        if (!(Object.hasOwn(vec, 'x') && Object.hasOwn(vec, 'y'))) throw "Assertion Failed: " + methodName + ": Object is not a Vector (has no x or y property)";
    }



    copy() {
        return new Vector(this.x, this.y);
    }

    #calcMag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

class Fish {
    constructor(context) {
        this.context = context;
        this.spine = new Spine(context, new Vector(midpoint_x, midpoint_y),[34, 40, 42, 41, 34, 32, 25, 19, 16, 10], 10, 32, Math.PI/6);
        this._target = this.#newTarget;

        this.bodycolor = "blue";
        this.fincolor = "light blue";
        this.speed = 4;
    }
    
    draw() {
        this.spine.draw(this.context);
    }

    resolve() {
        let headPos = this.spine.joints[0];
        if (Vector.dist(this._target, headPos) < 10)
            this._target = this.#newTarget;
        
        this.spine.resolveAngle(Vector.add(headPos, Vector.sub(this._target, headPos).setMag(this.speed)));
    }
    
    get #newTarget() {
        return new Vector(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
    }
}

let backgroundColor = "black";
let foregroundColor = "white";

const height = window.innerHeight;
const width = window.innerWidth;
const midpoint_x = width / 2;
const midpoint_y = height / 2;
const canvas = document.getElementById("myCanvas");
canvas.style.background = backgroundColor;
const ctx = canvas.getContext("2d");
canvas.width = width;
canvas.height = height;

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return {x: x, y: y}
}
let target = new Vector(midpoint_x-500, midpoint_y-200).setMag(16)

let trackMouse = false;


let fishList = [
    new Fish(ctx)
];

let paused = false;

let game = setInterval(() => {
    if (!paused) {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        fishList.forEach(fish => {
            fish.resolve();
            fish.draw();
        })
    }
}, 16)

canvas.addEventListener('click', event => { 
    // if (trackMouse) {
    //     let coords = getCursorPosition(canvas, event);
    //     target = new Vector(coords.x, coords.y);
    // }
    if (!paused) {
        paused = !paused;
    } else {
        console.log(getCursorPosition(canvas, event))
    }
}, false);
