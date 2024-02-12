const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1920
canvas.height = 1080


ctx.fillStyle = 'gray'
ctx.fillRect(0, 0, canvas.width, canvas.height)

const heroes = []
let player1Score = 0
let player2Score = 0

const heroData = [
    [//земля
    {
        
        "dmg": 35,
        "speed": 6,
        "radius": 15,
        "CD": 150
    },
    {},
    {},
    {}
    ],//вода
    [{
        "dmg": 7,
        "speed": 10,
        "radius": 10,
        "CD": 30
    },
    {},
    {},
    {}
    ],//воздух
    [{
        "dmg": 3,
        "speed": 25,
        "radius": 10,
        "CD": 15
    },
    {},
    {},
    {}
    ],//огонь
    [{
        "dmg": 10,
        "speed": 15,
        "radius": 10,
        "CD": 30
    },
    {},
    {},
    {}
    ],
]

class Hero {
    constructor({position = {x: 0, y: 0}, type, heroClass, imageSrc, frames = {maxX: 3, maxY: 3, currentX: 0, currentY: 0}, offset = {x: 0, y:0}}) {
        this.position = position
        this.type = type
        this.heroClass = heroClass
        this.projectiles = []
        this.direction = 0
        this.cast1CD = heroData[this.heroClass][0].CD
        this.cast2CD = heroData[this.heroClass][1].CD
        this.cast3CD = heroData[this.heroClass][2].CD
        this.cast4CD = heroData[this.heroClass][3].CD
        this.radius = 30
        this.width = 80

        this.health = 100 
        this.image = new Image()
        this.image.src = imageSrc

        this.frames = {
            maxX: frames.maxX,
            maxY: frames.maxY,
            currentX: frames.currentX,
            currentY: frames.currentY,
            elapsed: 0,
            hold: 5,
        }
        this.offset = offset

    }

    draw() {

        const cropWidth = this.image.width / this.frames.maxX
        const cropHeight = this.image.height / this.frames.maxY

        const crop = {
            position: {
                x: cropWidth * this.frames.currentX, 
                y: cropHeight * this.frames.currentY, 
            },
            width: cropWidth,
            height: cropHeight 
        }

         ctx.drawImage(
            this.image,
            crop.position.x, 
            crop.position.y, 
            crop.width, 
            crop.height, 
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            crop.width,
            crop.height
        )


        /*ctx.beginPath() 
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'red'
        ctx.fill() */

        ctx.fillStyle = 'red'
        ctx.fillRect(this.position.x - 30, this.position.y - 60, this.width - 20 , 5)


        ctx.fillStyle = 'green'
        ctx.fillRect(this.position.x - 30, this.position.y - 60, (this.width - 20) * this.health / 100 , 5)

    }

    update() {
        this.draw()

        if (this.cast1CD < heroData[this.heroClass][0].CD && this.cast1CD > 0) {
            this.cast1CD -= 1
        } else {
            this.cast1CD = heroData[this.heroClass][0].CD
        }
        if (this.cast2CD < 100 && this.cast1CD > 0) {
            this.cast2CD -= 1
        } else {
            this.cast2CD = 100
        }
        if (this.cast3CD < 100 && this.cast1CD > 0) {
            this.cast3CD -= 1
        } else {
            this.cast3CD = 100
        }
        if (this.cast4CD < 100 && this.cast1CD > 0) {
            this.cast4CD -= 1
        } else {
            this.cast4CD = 100
        }

        this.frames.elapsed++
        if (this.direction === 0) {
            this.frames.currentY = 0
            this.frames.currentX = 1
        } else if (this.direction === 1) {
            this.frames.currentY = 0
            this.frames.currentX = 2
        } else if (this.direction === 2) {
            this.frames.currentY = 1
            this.frames.currentX = 2
        } else if (this.direction === 3) {
            this.frames.currentY = 2
            this.frames.currentX = 2
        } else if (this.direction === 4) {
            this.frames.currentY = 1
            this.frames.currentX = 1
        } else if (this.direction === 5) {
            this.frames.currentY = 2
            this.frames.currentX = 0
        } else if (this.direction === 6) {
            this.frames.currentY = 1
            this.frames.currentX = 0
        } else if (this.direction === 7) {
            this.frames.currentY = 0
            this.frames.currentX = 0
        }

    }

    cast(projectileClass) {
        

        const projectileImageSrc = `./img/projectile${this.heroClass},${projectileClass}.png`

        this.projectiles.push(
            new Projectile({
                position: {
                    x: this.position.x, 
                    y: this.position.y
                },
                type: this.heroClass,
                projectileClass: projectileClass,
                direction: this.direction,
                imageSrc: projectileImageSrc,
                frames: {
                    maxX: 3,
                    maxY: 3,
                    currentX: 0,
                    currentY: 0
                },
                offset: {
                    x: 0,
                    y: 0
                }           
            })
            
        )
        
    }

}

const image = new Image()

image.src = './img/Background.png'

image.onload = () => {
    animate()  
}

let cancel = false;

function animate () {

    const animationId = requestAnimationFrame(animate) 

    ctx.drawImage(image, 0, 0)

    for (let i = heroes.length - 1; i >= 0; i--) {
        const hero = heroes[i]
        hero.draw()
    }
    if (cancel === true) {
        cancelAnimationFrame(animationId)
    }


    heroes.forEach((hero) => {

        hero.update()
        let heroIndex
        switch (hero.type) {
            case 0:
                heroIndex = 1
              break;
            case 1:
                heroIndex = 0
              break;
          }

        for (let i = hero.projectiles.length - 1; i >= 0; i--) {
            const projectile = hero.projectiles[i]

            projectile.update()       
            const xDifference = heroes[heroIndex].position.x - projectile.position.x
            const yDifference = heroes[heroIndex].position.y - projectile.position.y
            const distance = Math.hypot(xDifference, yDifference)
            if (distance < heroes[heroIndex].radius + projectile.radius) {
                hero.projectiles.splice(i, 1)
                heroes[heroIndex].health -= projectile.dmg


            } else if (projectile.position.x > 1920 ||
                projectile.position.x < 0 ||
                projectile.position.y > 1080 ||
                projectile.position.y < 0
            ) {
                hero.projectiles.splice(i, 1)
            }


        } 

        if (hero.health <= 0) {
            hero.health = 100;

            hero.position.x = startPosition[hero.type].x
            hero.position.y = startPosition[hero.type].y
            switch (hero.type) {
                case 0:
                    player1Score++
                    document.querySelector('.playersScore').innerHTML = `${player1Score} : ${player2Score}`
                  break;
                case 1:
                    player2Score++
                    document.querySelector('.playersScore').innerHTML = `${player1Score} : ${player2Score}`
                  break;
              }
              
            
        }
    })
}

let startPosition = [
    {
        "x":0 + 150,
        "y":0 + 250
    }, 
    {
        "x":1920 - 150,
        "y":1080 - 250
    }
]

function spawnHeroes(heroType, heroClass) {
        const heroImageSrc = `./img/hero${heroClass}.png`

        heroes.push( 
            new Hero({
                position: {
                    x: startPosition[heroType].x,
                    y: startPosition[heroType].y
                },
            type: heroType,
            heroClass: heroClass,
            imageSrc: heroImageSrc,
            frames: {
                maxX: 3,
                maxY: 3,
                currentX: 0,
                currentY: 0
            },
            offset: {
                x: -25,
                y: -50
            }

        }))
}

spawnHeroes(0, +prompt("Выберите класс героя1 (0-3)"))
spawnHeroes(1, +prompt("Выберите класс героя2 (0-3)"))

// передвижение героя


let pressed = new Set();
let pressed2 = new Set();

function checkPressedKeys() {

    document.addEventListener('keydown', function(event) {
        if (!pressed.has(event.code) && (event.code === 'KeyW' || event.code === 'KeyA' || event.code === 'KeyS' || event.code === 'KeyD' )) {
            pressed.add(event.code);


        } else if (!pressed2.has(event.code) && (event.code === 'ArrowUp' || event.code === 'ArrowRight' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' )) {
            pressed2.add(event.code);
        

        }

      


    }
    
);
    document.addEventListener('keyup', function(event) {
        pressed.delete(event.code);
        pressed2.delete(event.code);

    });



  }
checkPressedKeys(

);
document.addEventListener('keydown', function(event) {
    if (pressed.has(event.code)) {

    }

    if (event.code === 'KeyR' && heroes[0].cast1CD === heroData[heroes[0].heroClass][0].CD ) {
        heroes[0].cast(0)
        heroes[0].cast1CD--
    } else if (event.code === 'Numpad5' && heroes[1].cast1CD === heroData[heroes[1].heroClass][0].CD) {
        heroes[1].cast(0)
        heroes[1].cast1CD--
    }
})



let timerId = setInterval(() => {

    let xHeroDifference =  heroes[0].position.x - heroes[1].position.x 
    let yHeroDifference =  heroes[0].position.y - heroes[1].position.y 

    if (pressed.size > 1) {
        if ((pressed.has('KeyW') && pressed.has('KeyD') && !pressed.has('KeyA') && !pressed.has('KeyS')) &&
         heroes[0].position.y - heroes[0].radius > 0 &&
         heroes[0].position.x + heroes[0].radius < 1920
        ){
            if (
                (xHeroDifference > 60 || yHeroDifference < -60) ||
                (xHeroDifference < -60 || yHeroDifference > 60)
            ) {
                heroes[0].position.x += 0.7
                heroes[0].position.y += -0.7
            }

            heroes[0].direction = 1;
        } else if ((pressed.has('KeyD') && pressed.has('KeyS') && !pressed.has('KeyW') && !pressed.has('KeyA')) &&
            heroes[0].position.y + heroes[0].radius < 1080 &&
            heroes[0].position.x + heroes[0].radius < 1920
        ) {
            
            if (
                (xHeroDifference > 60 || yHeroDifference > 60) ||
                (xHeroDifference < -60 || yHeroDifference < -60)
            ) {
            heroes[0].position.x += 0.7
            heroes[0].position.y += 0.7
            }
            heroes[0].direction = 3;
        } else if ((pressed.has('KeyS') && pressed.has('KeyA') && !pressed.has('KeyW') && !pressed.has('KeyD')) &&
            heroes[0].position.y + heroes[0].radius < 1080 &&
            heroes[0].position.x - heroes[0].radius > 0
        )  {
            if (
                (xHeroDifference < -60 || yHeroDifference > 60) ||
                (xHeroDifference > 60 || yHeroDifference < -60)
            ) {
            heroes[0].position.x += -0.7
            heroes[0].position.y += 0.7
            }
            heroes[0].direction = 5;
        } else if ((pressed.has('KeyA') && pressed.has('KeyW') && !pressed.has('KeyD') && !pressed.has('KeyS'))  &&
            heroes[0].position.y - heroes[0].radius > 0 &&
            heroes[0].position.x - heroes[0].radius > 0
        )   {
            if (
                (xHeroDifference < -60 || yHeroDifference < -60) ||
                (xHeroDifference > 60 || yHeroDifference > 60)
            ) {
            heroes[0].position.x += -0.7
            heroes[0].position.y += -0.7
            }
            heroes[0].direction = 7;
        };

        
    } else if (pressed.size = 1) {
        if (pressed.has('KeyW')) {
            if ((Math.abs(xHeroDifference) > 58 || (yHeroDifference > 60 || yHeroDifference < 0)) && heroes[0].position.y - heroes[0].radius > 0) {
                heroes[0].position.y += -1;
            }
            heroes[0].direction = 0;
        } else if (pressed.has('KeyD')) {
            if ((Math.abs(yHeroDifference) > 58 || (xHeroDifference < -60 || xHeroDifference > 0)) && heroes[0].position.x + heroes[0].radius < 1920) {
                heroes[0].position.x += 1;
            }
            heroes[0].direction = 2;
        } else if (pressed.has('KeyS')) {
            if ((Math.abs(xHeroDifference) > 58 || (yHeroDifference < -60 || yHeroDifference > 0)) && heroes[0].position.y + heroes[0].radius < 1080) {
                heroes[0].position.y += 1;
            }
            heroes[0].direction = 4;
        } else if (pressed.has('KeyA')) {
            if ((Math.abs(yHeroDifference) > 58 || (xHeroDifference > 60 || xHeroDifference < 0)) && heroes[0].position.x - heroes[0].radius > 0) {
                heroes[0].position.x += -1;
            }
            heroes[0].direction = 6;
        };
    }

    if (pressed2.size > 1) {
        if (pressed2.has('ArrowUp') && pressed2.has('ArrowRight') && !pressed2.has('ArrowLeft') && !pressed2.has('ArrowDown') &&
            heroes[1].position.y - heroes[1].radius > 0 &&
            heroes[1].position.x + heroes[1].radius < 1920
        ) {
            if (
                (xHeroDifference > 60 || yHeroDifference < -60) ||
                (xHeroDifference < -60 || yHeroDifference > 60)
            ) {
                heroes[1].position.x += 0.7
                heroes[1].position.y += -0.7
            }
    
            heroes[1].direction = 1;
        } else if ((pressed2.has('ArrowRight') && pressed2.has('ArrowDown') && !pressed2.has('ArrowUp') && !pressed2.has('ArrowLeft')) &&
            heroes[1].position.y + heroes[1].radius < 1080 &&
            heroes[1].position.x + heroes[1].radius < 1920
        )  {
            
            if (
                (xHeroDifference > 60 || yHeroDifference > 60) ||
                (xHeroDifference < -60 || yHeroDifference < -60)
            ) {
            heroes[1].position.x += 0.7
            heroes[1].position.y += 0.7
            }
            heroes[1].direction = 3;
        } else if ((pressed2.has('ArrowDown') && pressed2.has('ArrowLeft') && !pressed2.has('ArrowUp') && !pressed2.has('ArrowRight')) &&
            heroes[1].position.y + heroes[1].radius < 1080 &&
            heroes[1].position.x - heroes[1].radius > 0
        )   {
            if (
                (xHeroDifference < -60 || yHeroDifference > 60) ||
                (xHeroDifference > 60 || yHeroDifference < -60)
            ) {
            heroes[1].position.x += -0.7
            heroes[1].position.y += 0.7
            }
            heroes[1].direction = 5;
        } else if ((pressed2.has('ArrowLeft') && pressed2.has('ArrowUp') && !pressed2.has('ArrowRight') && !pressed2.has('ArrowDown')) &&
            heroes[1].position.y - heroes[1].radius > 0 &&
            heroes[1].position.x - heroes[1].radius > 0
        )    {
            if (
                (xHeroDifference < -60 || yHeroDifference < -60) ||
                (xHeroDifference > 60 || yHeroDifference > 60)
            ) {
            heroes[1].position.x += -0.7
            heroes[1].position.y += -0.7
            }
            heroes[1].direction = 7;
        };
    
        
    } else if (pressed2.size = 1) {
        if (pressed2.has('ArrowDown')) {
            if ((Math.abs(xHeroDifference) > 58 || (yHeroDifference > 60 || yHeroDifference < 0)) && heroes[1].position.y + heroes[0].radius < 1080) {
                heroes[1].position.y += 1;
            }
            heroes[1].direction = 4;
        } else if (pressed2.has('ArrowLeft')) {
            if ((Math.abs(yHeroDifference) > 58 || (xHeroDifference < -60 || xHeroDifference > 0)) && heroes[1].position.x - heroes[0].radius > 0 ) {
                heroes[1].position.x += -1;
            }
            heroes[1].direction = 6;
        } else if (pressed2.has('ArrowUp')) {
            if ((Math.abs(xHeroDifference) > 58 || (yHeroDifference < -60 || yHeroDifference > 0)) && heroes[1].position.y - heroes[0].radius > 0) {
                heroes[1].position.y += -1;
            }
            heroes[1].direction = 0;
        } else if (pressed2.has('ArrowRight')) {
            if ((Math.abs(yHeroDifference) > 58 || (xHeroDifference > 60 || xHeroDifference < 0)) && heroes[1].position.x + heroes[0].radius < 1920) {
                heroes[1].position.x += 1;
            }
            heroes[1].direction = 2;
        };
    }

}, 1);

class Projectile {
    constructor({position = {x: 0, y: 0}, type, projectileClass, direction, imageSrc, frames = {maxX: 3, maxY: 3, currentX: 0, currentY: 0}, offset = {x: 0, y:0}}) {
        this.position = position
        this.velocity = {
            x: 0,
            y: 0
        }
        this.type = type
        this.projectileClass = projectileClass
        this.direction = direction
        this.dmg = heroData[this.type][this.projectileClass].dmg

        this.speed = heroData[this.type][this.projectileClass].speed
        this.speedOffset = Math.sqrt(2 * this.speed * this.speed) / 2
        this.radius = heroData[this.type][this.projectileClass].radius

        this.image = new Image()
        this.image.src = imageSrc

        this.frames = {
            maxX: frames.maxX,
            maxY: frames.maxY,
            currentX: frames.currentX,
            currentY: frames.currentY,
            elapsed: 0,
            hold: 5,
        }
        this.offset = offset


    }

    draw() {    
        const cropWidth = this.image.width / this.frames.maxX
        const cropHeight = this.image.height / this.frames.maxY



        const crop = {
            position: {
                x: cropWidth * this.frames.currentX, 
                y: cropHeight * this.frames.currentY, 
            },
            width: cropWidth,
            height: cropHeight 
        }

        ctx.drawImage(
            this.image,
            crop.position.x, 
            crop.position.y, 
            crop.width, 
            crop.height, 
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            crop.width,
            crop.height
        )

        /*
        ctx.beginPath() 
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'orange'
        ctx.fill()
        */
    }
    update() {
        this.draw()

        this.frames.elapsed++

        switch (this.direction) {
            case 0:
              this.position.y -= this.speed
              this.frames.currentY = 0
              this.frames.currentX = 1
              break;
            case 1:
              this.position.x += this.speedOffset
              this.position.y -= this.speedOffset
              this.frames.currentY = 0
              this.frames.currentX = 2
              break;
            case 2:
              this.position.x += this.speed
              this.frames.currentY = 1
              this.frames.currentX = 2
              break;
            case 3:
                this.position.x += this.speedOffset
                this.position.y += this.speedOffset 
                this.frames.currentY = 2
                this.frames.currentX = 2               
                break;
            case 4:
                this.position.y += this.speed
                this.frames.currentY = 1
                this.frames.currentX = 1
                break;
            case 5:
                this.position.x -= this.speedOffset
                this.position.y += this.speedOffset   
                this.frames.currentY = 2
                this.frames.currentX = 0             
                break;
            case 6:
                this.position.x -= this.speed
                this.frames.currentY = 1
                this.frames.currentX = 0
                break;
            case 7:
                this.position.x -= this.speedOffset
                this.position.y -= this.speedOffset   
                this.frames.currentY = 0
                this.frames.currentX = 0             
                break;
          }

    }
}




