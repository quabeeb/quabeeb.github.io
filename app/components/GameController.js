(function ()
{
    'use strict';
    var app = angular.module('quabeebwebapp');

    app.controller('GameController', ['$window', '$document', function($window, $document)
    {
      var game = function()
      {
        var self = this;
        var highscore = 0;

        self.init = function()
        {
          self.score = 0;
        self.canvas = document.getElementById('canvas');
        self.ctx = self.canvas.getContext('2d');
        self.paused = true;
        self.started = false;
        self.increments = 0;
        self.timesteps = 250;
        self.blockWidth = 100;
        self.blockHeight = 100;

        self.ROTATIONS = //[L,RL,Z,RZ,T]
          [
            [
              [
                [0,0,0],
                [1,1,1],
                [1,0,0]
              ],
              [
                [0,1,0],
                [0,1,0],
                [0,1,1]
              ],
              [
                [0,0,1],
                [1,1,1],
                [0,0,0]
              ],
              [
                [1,1,0],
                [0,1,0],
                [0,1,0]
              ]
          ],
            [
              [
                [0,0,0],
                [1,1,1],
                [0,0,1]
              ],
              [
                [0,1,1],
                [0,1,0],
                [0,1,0]
              ],
              [
                [1,0,0],
                [1,1,1],
                [0,0,0]
              ],
              [
                [0,1,0],
                [0,1,0],
                [1,1,0]
              ]
          ],
            [
              [
                [0,1,1],
                [1,1,0],
                [0,0,0]
              ],
              [
                [1,0,0],
                [1,1,0],
                [0,1,0]
              ],
              [
                [0,0,0],
                [0,1,1],
                [1,1,0]
              ],
              [
                [0,1,0],
                [0,1,1],
                [0,0,1]
              ]
          ],
            [
              [
                [1,1,0],
                [0,1,1],
                [0,0,0]
              ],
              [
                [0,1,0],
                [1,1,0],
                [1,0,0]
              ],
              [
                [0,0,0],
                [1,1,0],
                [0,1,1]
              ],
              [
                [0,0,1],
                [0,1,1],
                [0,1,0]
              ]
          ],
            [
              [
                [0,1,0],
                [1,1,1],
                [0,0,0]
              ],
              [
                [0,1,0],
                [1,1,0],
                [0,1,0]
              ],
              [
                [0,0,0],
                [1,1,1],
                [0,1,0]
              ],
              [
                [0,1,0],
                [0,1,1],
                [0,1,0]
              ]
          ]
        ];

          self.wall =
          {
            topLeftX:0,
            topLeftY:0,
            topRightX:0,
            topRightY:0,
            botLeftX:0,
            botLeftY:0,
            botRightX:0,
            botLeftX:0
          };

          self.wallBlank =
          {
            topLeftX:0,
            topLeftY:0,
            xPos:0,
            yPos:0,
            blockSize:0,
            rmn:0, //rotation matrix number (0 = L, 1 = RL ... )
            rotation:0,
            matrix:0
          }

          self.piece =
          {
            topLeftX:0,
            topLeftY:0,
            xPos:0,
            yPos:0,
            rmn:0, //rotation matrix number (0 = L, 1 = RL ... )
            rotation:0,
            matrix:0
          };

          self.ctx.fillStyle = 'black'
          self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
        self.ctx.font = '48px sans-serif';
        self.ctx.textAlign = "center";
        self.ctx.fillText('Tetris Wall', self.canvas.width/2, self.canvas.height/2-50);
        self.ctx.fillText('Press \'s\' to start the game', self.canvas.width/2, self.canvas.height/2+50);

        newLevel();
      };

      function newLevel()
      {
        self.wall.topLeftX = self.wall.botLeftX = Math.floor(Math.random() * 3 + 1) * self.blockWidth;
        self.wall.topLeftY = self.wall.topRightY= Math.floor(Math.random() * 3 + 1) * self.blockHeight;
        self.wall.topRightX = self.wall.topLeftX + self.blockWidth*2;
        self.wall.botLeftY = self.wall.topLeftY + self.blockWidth*2;
        self.wallXSize = self.wall.topRightX - self.wall.topLeftX;
        self.wallYSize = self.wall.botLeftY - self.wall.topLeftY;

        self.piece.rmn = Math.floor(Math.random() * 5);
        self.piece.rotation = Math.floor(Math.random() * 4);
        self.piece.matrix = self.ROTATIONS[self.piece.rmn][self.piece.rotation];
        self.piece.xPos = Math.floor(Math.random() * 3 + 1)
        self.piece.yPos = Math.floor(Math.random() * 3 + 1)
        self.piece.topLeftX = self.piece.xPos * self.blockWidth;
        self.piece.topLeftY = self.piece.yPos * self.blockHeight;

        self.wallBlank.rmn = self.piece.rmn;
        self.wallBlank.rotation = Math.floor(Math.random() * 4);
        self.wallBlank.matrix = self.ROTATIONS[self.wallBlank.rmn][self.wallBlank.rotation];
        self.wallBlank.xPos = Math.floor(Math.random() * 3 + 1);
        self.wallBlank.yPos = Math.floor(Math.random() * 3 + 1);
        self.wallBlank.blockSize = self.wallXSize/6;

        let r = Math.floor(Math.random() * 150);
        let g = Math.floor(Math.random() * 50);
        let b = Math.floor(Math.random() * 150);

        self.wallColor = "rgb(" + r + "," + g + "," + b + ")";
        self.wallBlankColor = "rgb(" + Math.floor(Math.random() * 100 + 150) + "," + Math.floor(Math.random() * 100 + 150) + "," + Math.floor(Math.random() * 100 + 150) + ")";
        self.pieceColor = "rgba(" + Math.floor(Math.random() * 100) + "," + (150-g) + "," + Math.floor(Math.random() * 50) + ",.6)";

        self.wallXSize = self.wall.topRightX - self.wall.topLeftX;
        self.wallYSize = self.wall.botLeftY - self.wall.topLeftY;

        //calculates the ratio of the x's
        let xRatio = (self.canvas.width-self.wall.topRightX)/(self.wall.topLeftX);
        let yRatio = (self.canvas.height-self.wall.botLeftY)/(self.wall.topLeftY);

        self.leftXInc = self.wall.topLeftX/self.timesteps;
        self.topYInc = self.wall.topLeftY/self.timesteps;

        self.rightXInc = self.leftXInc*xRatio;
        self.botYInc = self.topYInc*yRatio;

        self.increments = 0;
        updateScores();
      };

      function increment()
      {
        self.wall.topLeftX  = self.wall.botLeftX = self.wall.topLeftX - self.leftXInc;
        self.wall.topRightX = self.wall.botRightX = self.wall.topRightX + self.rightXInc;
        self.wall.topLeftY  = self.wall.topRightY = self.wall.topLeftY - self.topYInc;
        self.wall.botLeftY  = self.wall.botRightY = self.wall.botLeftY + self.botYInc;

        self.wallXSize = self.wall.topRightX - self.wall.topLeftX;
        self.wallYSize = self.wall.botLeftY - self.wall.topLeftY;

        self.wallBlank.xBlockSize = self.wallXSize/6;
        self.wallBlank.yBlockSize = self.wallYSize/6;
      };

      function noCollision()
      {
        if(self.piece.xPos == self.wallBlank.xPos && self.piece.yPos == self.wallBlank.yPos && self.piece.rotation == self.wallBlank.rotation)
        {
            return true;
        }
        else if(self.piece.rmn == 2 || self.piece.rmn == 3)
        {
          if(self.piece.xPos == self.wallBlank.xPos)
          {
            if(self.piece.rotation == 1 && self.wallBlank.rotation == 3)
            {
              if(self.piece.yPos == self.wallBlank.yPos+1)
              {
                return true;
              }
              else
              {
                return false;
              }
            }
            else if(self.piece.rotation == 3 && self.wallBlank.rotation == 1)
            {
              if(self.piece.yPos == self.wallBlank.yPos-1)
              {
                return true;
              }
              else
              {
                return false;
              }
            }

            return false;
          }
          else if(self.piece.yPos == self.wallBlank.yPos)
          {
            if(self.piece.rotation == 0 && self.wallBlank.rotation == 2)
            {
              if(self.piece.xPos == self.wallBlank.xPos+1)
              {
                return true;
              }
              else
              {
                return false;
              }
            }
            else if(self.piece.rotation == 2 && self.wallBlank.rotation == 0)
            {
              if(self.piece.xPos == self.wallBlank.xPos-1)
              {
                return true;
              }
              else
              {
                return false;
              }
            }
          }
          else
          {
            return false;
          }

        }
        else
        {
          return false;
        }
      };

      function updateScores()
      {
        highscore = Math.max(highscore, self.score)
        document.getElementById("highscore").innerText = "High Score: " + highscore;
        document.getElementById("score").innerText = "Score: " + self.score;
      };

      function wallLoop()
      {
        if(!self.paused)
        {
          if(self.increments < self.timesteps)
          {
            increment();
            self.increments = self.increments + 1;
          }
          else
          {
            if(noCollision())
            {
              self.score++;
              self.timesteps = Math.max(Math.round(self.timesteps*.95), 75);
              newLevel();
            }
            else
            {
              self.paused = true;
              self.started = false;
              self.init();
              return;
            }
          }

          var framesPerSecond = 60;
          setTimeout(function()
          {
                requestAnimationFrame(wallLoop);

            //background
            self.ctx.fillStyle = self.wallBlankColor;
            self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

            //wall
            self.ctx.fillStyle = self.wallColor;
            self.ctx.fillRect(self.wall.topLeftX, self.wall.topLeftY, self.wallXSize, self.wallYSize);

            //wall blank
            let xpos = self.wall.topLeftX + self.wallBlank.xPos*self.wallBlank.xBlockSize;

            //wall blank
            self.ctx.fillStyle = self.wallBlankColor;
            for(let x = 0; x < 3; x++)
            {
              let ypos = self.wall.topLeftY + self.wallBlank.yPos*self.wallBlank.yBlockSize;

              for(let y = 0; y < 3; y++)
              {
                if(self.wallBlank.matrix[x][y] == 1)
                {
                  self.ctx.fillRect(xpos, ypos, self.wallBlank.xBlockSize+(.9*x), self.wallBlank.yBlockSize+(.9*y));
                }
                ypos += (self.wallBlank.yBlockSize - .5);
              }
              xpos += (self.wallBlank.xBlockSize - .5);
            }

            //piece
            self.ctx.fillStyle = self.pieceColor;
            for(let x = 0; x < 3; x++)
            {
              for(let y = 0; y < 3; y++)
              {
                if(self.piece.matrix[x][y] == 1)
                {
                  self.ctx.fillRect(self.piece.topLeftX + self.blockHeight*x, self.piece.topLeftY + self.blockHeight*y, self.blockWidth, self.blockHeight);
                }
              }
            }

            }, 1000 / framesPerSecond);
        }
      };

      function handleRotate()
      {
        self.piece.matrix = self.ROTATIONS[self.piece.rmn][self.piece.rotation];
      };

        document.addEventListener("keydown", function(event)
        {
          var granularity = 100;
          if(event.code == "ArrowUp" && !self.paused)
          {
            self.piece.yPos = self.piece.yPos-1;
            self.piece.topLeftY = self.piece.topLeftY-granularity;
          }
          else if(event.code == "ArrowLeft" && !self.paused)
          {
            self.piece.xPos = self.piece.xPos-1;
            self.piece.topLeftX = self.piece.topLeftX-granularity;
          }
          else if(event.code == "ArrowDown" && !self.paused)
          {
            self.piece.yPos = self.piece.yPos+1;
            self.piece.topLeftY = self.piece.topLeftY+granularity;
          }
          else if(event.code == "ArrowRight" && !self.paused)
          {
            self.piece.xPos = self.piece.xPos+1;
            self.piece.topLeftX = self.piece.topLeftX+granularity;
          }
          else if(event.code == "KeyX" && !self.paused)
          {
            self.piece.rotation = ((self.piece.rotation+1) % 4);
            handleRotate();
        }
          else if(event.code == "KeyZ" && !self.paused)
          {
            self.piece.rotation = ((self.piece.rotation-1 % 4) + 4) % 4;
            handleRotate();

          }
          else if(event.code == "KeyP" && self.started)
          {
            self.paused = !self.paused;
            wallLoop();
          }
          else if(event.code == "KeyS" && !self.started)
          {
            self.started = true;
            self.paused = false;
            wallLoop();
          }
        });

        window.addEventListener("keydown", function(event)
        {
          if(event.code == "ArrowUp" || event.code == "ArrowLeft" || event.code == "ArrowDown" || event.code == "ArrowRight")
          {
            event.preventDefault();
          }
        });
      }

      var g = new game();
      g.init();

  }]);
})();
