
class SpineV1 {
    constructor(joints, anchor, linksize) {
        this.jointWidthArr = joints;
        this.anchor = anchor;
        this.linksize = linksize;
        this.joints = [];

        if (!(this.jointWidthArr.length > 2)) throw "Assertion Failed: Spine must have at least 3 joints";
        this.joints[0] = new Joint(anchor, this.jointWidthArr[0]);

        for (let i=1; i<this.jointWidthArr.length; ++i) {
            this.joints[i] = new Joint({x: this.joints[i-1].position.x + linksize, y: this.joints[i-1].position.y}, this.jointWidthArr[i]);
        } 
    }

    get headPosition() {
        return this.joints[0].position;
    }

    update(pos) {
        this.joints[0].position = pos;
        for (let i=1; i< this.joints.length; ++i) {
            this.joints[i].position = this.constrainDistance(this.joints[i].position, this.joints[i-1].position)
        }
    }
    
    draw(context, targetPos) {
        for (let i=0; i<this.joints.length; ++i) {
            this.joints[i].draw(context)
            this.joints[i].drawParametric(context, this.headPosition, targetPos)
        }
    }

    constrainDistance(joint1, joint2) {
        // subtract
        let temp = {x: joint1.x - joint2.x, y: joint1.y - joint2.y};
        // normalize
        temp = this.normalize(temp);
        
        // ultiply by linksize
        temp = {x: temp.x * this.linksize, y: temp.y * this.linksize};
        
        // add anchor
        return {x: temp.x + joint2.x, y: temp.y + joint2.y};
    }
    
    normalize(jointPosition) {
        const magnitude = Math.sqrt(jointPosition.x * jointPosition.x + jointPosition.y * jointPosition.y);
        
        if (magnitude === 0) {
            throw new Error("Cannot normalize a zero-length vector.");
        }
        
        return {
            x: jointPosition.x / magnitude,
            y: jointPosition.y / magnitude
        };
    }
}

class Joint {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }
    
    draw(context) {      
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.lineWidth = 2; // Adjust the width of the outline
        ctx.strokeStyle = foregroundColor;
        ctx.stroke();
        context.closePath();
    }

    getSides(headPosition, targetPos) {
        let sides = [];
        let tempPos;
        if (this.position != headPosition) {
            tempPos = {x: this.position.x - headPosition.x, y: this.position.y - headPosition.y};
        } else {
            tempPos = {x: this.position.x - targetPos.x, y: this.position.y - targetPos.y};
        }

        let theta = this.heading(tempPos) + Math.PI / 2;
        sides[0] = {x: this.position.x + this.radius * Math.cos(theta), y: this.position.y + this.radius * Math.sin(theta)};

        theta = this.heading(tempPos) - Math.PI / 2;
        sides[1] = {x: this.position.x + this.radius * Math.cos(theta), y: this.position.y + this.radius * Math.sin(theta)};

        return sides
    }

    drawParametric(context, headPosition, targetPos) {
        let sides = this.getSides(headPosition, targetPos);
        sides.forEach(side => {
            context.beginPath();
            context.arc(side.x, side.y, 2, 0, Math.PI * 2);
            ctx.lineWidth = 2; // Adjust the width of the outline
            ctx.strokeStyle = "red";
            ctx.stroke();
            context.closePath();
        })
    }

    heading(pos) {
        return Math.atan(pos.y / pos.x);
    }
}

class Fish {
    constructor(context, target) {
        this.context = context;
        this.target = target;
        this.spine = new SpineV1([34, 40, 42, 41, 34, 32, 25, 19, 16, 10], {x: midpoint_x, y: midpoint_y}, 30);
        this.target = this.newTarget
        this.speed = 5;
    }
    
    draw() {
        this.spine.draw(this.context, this.target);
    }

    update() {
        if (Math.abs(this.spine.headPosition.x - this.target.x) < 20 && Math.abs(this.spine.headPosition.y - this.target.y) < 20) 
            this.target = this.newTarget

        let tempX = this.target.x - this.spine.headPosition.x;
        let tempY = this.target.y - this.spine.headPosition.y;
        let normalizedMovementDirection = this.spine.normalize({x: tempX, y: tempY})
        let movementDirection = {
            x: normalizedMovementDirection.x * this.speed + this.spine.headPosition.x, 
            y: normalizedMovementDirection.y * this.speed + this.spine.headPosition.y
        }
        this.spine.update(movementDirection);   
    }
    
    get newTarget() {
        return {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight};
    }
}

let backgroundColor = "white";
let foregroundColor = "black";

const height = window.innerHeight;
const width = window.innerWidth;
const midpoint_x = width / 2;
const midpoint_y = height / 2;
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = width;
canvas.height = height;
ctx.fillStyle = "red";

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return {x: x, y: y}
}
let target = {x: midpoint_x - 1000, y: midpoint_y}


let fishList = [
    new Fish(ctx, target), 
    new Fish(ctx, target), 
    new Fish(ctx, target), 
    new Fish(ctx, target)
];

canvas.addEventListener('mouseclick', function(e) {
    new Joint(getCursorPosition(canvas, e), 10).draw(ctx);
})

let game = setInterval(() => {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    fishList.forEach(fish => {
        fish.update();
        fish.draw();
        new Joint(fish.target, 10).draw(ctx);
    })
}, 20)