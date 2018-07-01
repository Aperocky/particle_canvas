var canvas = $("#game")[0];
console.log(canvas);

// Initialize Game.
const canvaswidth = 400;
const canvasheight = 600;
var radius = 10;
const startnum = 3;
const speed = 5;
var hardmode = false;

canvas.width = canvaswidth;
canvas.height = canvasheight;

const c = canvas.getContext('2d');
const audio = new Audio('twilight.mp3');
audio.loop = true;
const hitsound = new Audio('hitnew.mp3');
hitsound.volume = 0.5;

// Initial play button realign
const playb = $("#play");
const replay = $("#again");
const result = $("#result");
const memo = $("#memo");
const hard = $("#hard");

function initcontent(){
    let parentoffset = $(".col-lg-10").offset();
    let resultoffset = $("#game").offset();
    console.log(resultoffset);
    hard.css({
        left: canvaswidth / 2 + resultoffset.left - parentoffset.left - 60,
        top: canvasheight / 2 + resultoffset.top - parentoffset.top - 50,
    });
    playb.css({
        left: canvaswidth / 2 + resultoffset.left - parentoffset.left - 35,
        top: canvasheight / 2 + resultoffset.top - parentoffset.top - 100,
    });
    replay.css({
        left: canvaswidth / 2 + resultoffset.left - parentoffset.left - 35,
        top: canvasheight / 2 + resultoffset.top - parentoffset.top - 100,
    });
    memo.css({
        left: 0,
        top: canvasheight / 2 + resultoffset.top - parentoffset.top,
    });
    result.css({
        left: 0,
        top: canvasheight / 2 + resultoffset.top - parentoffset.top + 100,
    });
}
initcontent();

// Define the ball object.
class Circle{
    constructor(){
        this.x = Math.random() * (canvaswidth - 2 * radius) + radius;
        this.y = Math.random() * (canvasheight - 2 * radius) + radius;
        var direction = Math.random() * 2 * Math.PI;
        this.vx = speed * Math.cos(direction);
        this.vy = speed * Math.sin(direction);
        this.color = "blue";
    }

    draw(c){
        c.beginPath();
        c.arc(this.x, this.y, radius, 0, Math.PI * 2, 0);
        c.fillStyle = this.color;
        c.fill();
    }

    move(boundary = true){
        this.x += this.vx;
        this.y += this.vy;
        if(boundary){
            if (this.x > canvaswidth - radius || this.x < radius){
                this.vx = -this.vx;
                if (this.x > canvaswidth - radius){
                    this.x = canvaswidth - radius;
                }
                if (this.x < radius){
                    this.x = radius;
                }
            }
            if (this.y > canvasheight - radius || this.y < radius) {
                this.vy = -this.vy;
                if (this.y > canvasheight - radius) {
                    this.y = canvasheight - radius;
                }
                if (this.y < radius) {
                    this.y = radius;
                }
            }
        }
    }
}

var mouseball = {
    x: 200,
    y: 300,
    draw(c) {
        c.beginPath();
        c.arc(this.x, this.y, radius, 0, Math.PI * 2, 0);
        c.fillStyle = "red";
        c.fill();
    }
}

var ballarr = [];
var readying = [];

function initgame(){
    window.start = new Date();
    window.startanimate = true;
    for(var i = 0; i < startnum; i++){
        let ball = new Circle();
        ball.draw(c);
        ballarr.push(ball);
    }
    (function inianimate(){
        if(!startanimate){
            return false;
        }
        requestAnimationFrame(inianimate);
        c.clearRect(0, 0, canvaswidth, canvasheight);
        for (var i = 0; i < ballarr.length; i++) {
            ball = ballarr[i];
            ball.draw(c);
        }
        mouseball.draw(c);
    })();
}

canvas.addEventListener('mousemove',
    function(event) {
        var offset = $(this).offset();
        mouseball.x = event.pageX - offset.left;
        mouseball.y = event.pageY - offset.top;
        // console.log(mouseball);
        mouseball.x = (mouseball.x < radius) ? radius : mouseball.x;
        mouseball.x = (mouseball.x > canvaswidth - radius) ? canvaswidth - radius : mouseball.x;
        mouseball.y = (mouseball.y < radius) ? radius : mouseball.y;
        mouseball.y = (mouseball.y > canvasheight - radius) ? canvasheight - radius : mouseball.y;
    }
)

function collision(ballarr){
    for (var i = 0; i < ballarr.length; i++) {
        // Check if collided with mouseball
        var dist = (ballarr[i].x - mouseball.x) ** 2 + (ballarr[i].y - mouseball.y) ** 2
        if (dist < 400) {
            console.log("you have crashed!!");
            alive = false;
            audio.pause();
        }
        for (var j = i + 1; j < ballarr.length; j++) {
            var dist = (ballarr[i].x - ballarr[j].x) ** 2 + (ballarr[i].y - ballarr[j].y) ** 2
            if (dist < 400) {
                hitsound.cloneNode(true).play();
                var d_rel = [ballarr[i].x - ballarr[j].x, ballarr[i].y - ballarr[j].y];
                var v_rel = [ballarr[i].vx - ballarr[j].vx, ballarr[i].vy - ballarr[j].vy];
                dist = Math.sqrt(dist);
                // Remove collision
                ballarr[i].x += d_rel[0] * (1 - dist / 20) / 2;
                ballarr[i].y += d_rel[1] * (1 - dist / 20) / 2;
                ballarr[j].x -= d_rel[0] * (1 - dist / 20) / 2;
                ballarr[j].y -= d_rel[1] * (1 - dist / 20) / 2;
                // Momentum Vector of the center of Mass
                var v_cm = [(ballarr[i].vx + ballarr[j].vx) / 2, (ballarr[i].vy + ballarr[j].vy) / 2]
                var dd_rel = d_rel[0] ** 2 + d_rel[1] ** 2;
                var vd_rel = v_rel[0] * d_rel[0] + v_rel[1] * d_rel[1];
                var v_rel = [2 * d_rel[0] * vd_rel / dd_rel - v_rel[0], 2 * d_rel[1] * vd_rel / dd_rel - v_rel[1]];
                ballarr[i].vx = v_cm[0] + v_rel[0] / 2;
                ballarr[i].vy = v_cm[1] + v_rel[1] / 2;
                ballarr[j].vx = v_cm[0] - v_rel[0] / 2;
                ballarr[j].vy = v_cm[1] - v_rel[1] / 2;
            }
        }
    }
}

function animate(){
    startanimate = false;
    if(!alive){
        endGame();
        return false;
    }
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvaswidth,canvasheight);
    for (var i = 0; i < ballarr.length; i++){
        ball = ballarr[i];
        ball.move();
        ball.draw(c);
    }
    for (var i = 0; i < readying.length; i++) {
        c.fillStyle = "black";
        c.textAlign = "center";
        c.font = "30px sans-serif";
        c.fillText(ballnum + " Balls", canvaswidth/2, canvasheight/2);
        ball = readying[i];
        ball.draw(c);
    }
    mouseball.draw(c);
    // Bounce balls.
    collision(ballarr);
}

function addBall(){
    if(!alive){
        return false;
    }
    let ball = new Circle();
    ballnum = ballnum + 1;
    console.log(ballnum);
    readying.push(ball);
    function merge(){
        ballarr.push.apply(ballarr, readying);
        readying = [];
    }
    setTimeout(merge, 2000);
    setTimeout(addBall, ballnum * 2000);
}

function startGame(){
    window.ballnum = startnum;
    alive = true;
    ballarr = []
    initgame();
    audio.play();
    setTimeout(animate, 2000)
    setTimeout(addBall, ballnum * 2000);
}

function endGame() {
    endtime = new Date();
    elapsed = endtime - window.start;
    handball = new Circle();
    handball.x = mouseball.x;
    handball.y = mouseball.y;
    handball.vx = handball.vy = 0;
    handball.color = "red";
    ballarr.push(handball);
    var large = (hardmode) ? " large" : "";
    result.html("You made it to " + ballnum + large + " balls, lasted " + Math.floor(elapsed / 1000) + " seconds");
    result.show();
    hard.show();
    memo.show();
    replay.show();
    (function endanimate() {
        if (alive) {
            return false;
        }
        requestAnimationFrame(endanimate);
        c.clearRect(0, 0, canvaswidth, canvasheight);
        var i = ballarr.length;
        ballarr = ballarr.filter(function (ball) {
            return ball.y < canvasheight + radius;
        })
        for (var i = 0; i < ballarr.length; i++) {
            ballarr[i].vy += 0.3;
            ballarr[i].move(boundary = false);
            ballarr[i].draw(c);
        }
        collision(ballarr);
    })();
}

replay.click(function(){
    hardmode = false;
    startGame();
    memo.hide();
    replay.hide();
    result.hide();
    hard.hide();
})

hard.click(function () {
    hardmode = true;
    radius = 20;
    startGame();
    memo.hide();
    replay.hide();
    result.hide();
    hard.hide();
})

playb.click(function () {
    startGame();
    memo.hide();
    playb.hide();
})

