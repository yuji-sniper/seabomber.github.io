'use strict';

{
  // キャンバス
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;


// 背景
const SEA_LINE = 120;

function backgroundDraw() {
  ctx.beginPath();
  const f = ctx.createRadialGradient(CANVAS_WIDTH / 2, SEA_LINE, 0, CANVAS_WIDTH / 2, SEA_LINE, CANVAS_WIDTH / 2);
  f.addColorStop(0, 'rgb(163, 165, 28)');
  f.addColorStop(0.3, 'orange');
  f.addColorStop(1, 'blueviolet');
  ctx.fillStyle = f;
  ctx.fillRect(0, 0, CANVAS_WIDTH, SEA_LINE);
  
  ctx.beginPath();
  const g = ctx.createLinearGradient(0, SEA_LINE, 0, CANVAS_HEIGHT);
  g.addColorStop(0, 'blue');
  g.addColorStop(1, 'rgb(14, 6, 58)');
  ctx.fillStyle = g;
  ctx.fillRect(0, SEA_LINE, CANVAS_WIDTH, CANVAS_HEIGHT);

  // // ハイスコアラインの確認
  // ctx.beginPath();
  // ctx.moveTo(0, HISCORE_LINE);
  // ctx.lineTo(CANVAS_WIDTH, HISCORE_LINE);
  // ctx.stroke();
}


// 一度遊んだかどうか
let played = false;


// 効果音たち
// 爆発
let expSound = new Audio('sound/bomb1.mp3');
expSound.volume = 0.2;
// 被弾
let hitSound = new Audio('sound/cancel2.mp3');
hitSound.volume = 0.2;
// 爆弾
let bombSound = new Audio('sound/puyon1.mp3');
bombSound.volume = 0.2;
// ゲームオーバー
let gbSound = new Audio('sound/powerdown07.mp3');
gbSound.volume = 0.1;
// スタート
let startSound = new Audio('sound/start.mp3');
startSound.volume = 0.7;
// 回復
let healSound = new Audio('sound/heal.mp3');
healSound.volume = 0.3;


// スコア関連
const SCORE = 100;
const SCORE_2 = 200;
const HISCORE_LINE = 380;


// ゲームオーバー
let gameOver = true;


// キーボードイベント
let keyRight = false;
let keyLeft = false;
let keySpace = false;
let keyEnter = false;
let keyEsc = false;
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);
function keydown(e) {
  if (e.keyCode == 39 && !gameOver) {keyRight = true;}
  if (e.keyCode == 37 && !gameOver) {keyLeft = true;}
  if (e.keyCode == 32 && !gameOver) {keySpace = true;}
  if (e.keyCode == 13 && gameOver) {keyEnter = true;}
  if (e.keyCode == 27 && !gameOver) {keyEsc = true;}
}
function keyup(e) {
  if (e.keyCode == 39) {keyRight = false;}
  if (e.keyCode == 37) {keyLeft = false;}
  if (e.keyCode == 32) {keySpace = false;}
  if (e.keyCode == 13) {keyEnter = false;}
  if (e.keyCode == 27) {keyEsc = false;}
}


// ランダム
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// ボートの設定
const BOAT_WIDTH = 50;
const BOAT_HEIGHT = 20;
const RELOAD_INTVL = 42;
// const RELOAD_INTVL = 15;
const BOMB_MAX = 6;
const BOMB_R = 10;


// 敵の設定
let ENEMY_INTERVAL = 0;
const NO_HIT_X = 10;
const NO_HIT_Y = 15;


// アイテムの設定
const HEAL_WIDTH = 50;
const HEAL_HEIGHT = 51;
const INFINIT_WIDTH = 48;
const INFINIT_HEIGHT = 48;
const INFINIT_TIME = 600;


// ボートクラス
class Boat {
  
  constructor() {
    this.x = CANVAS_WIDTH / 2; 
    this.y = SEA_LINE - BOAT_HEIGHT / 2;
    this.vx = 4;
    this.life = 3;
    this.bombInterval = 0;
    this.bombLeft = BOMB_MAX;
    this.reloadIntvl = RELOAD_INTVL;
    this.color = 'brown';
    this.score = 0;
    this.damaged = false;
    this.noDamageTime = 0;
    this.infinityTime = 0;
    this.healCount = 15;
  }

  draw() {
    // ボートの描画
    if (this.noDamageTime == 0 || this.noDamageTime % 2 == 0) {
      const img1 = document.createElement('img');
      img1.src = 'img/bbb.png';
      ctx.drawImage(img1, this.x - BOAT_WIDTH / 2, SEA_LINE - 25);
    }
    // 手持ち爆弾の描画
    if (this.infinityTime > 0) {
      ctx.font = 'normal 15px Verdana';
      ctx.fillStyle = 'black';
      ctx.fillText('∞', 10, 16);
    } else {
      for (let i = 0; i < this.bombLeft; i++) {
        ctx.beginPath();
        ctx.arc(15 * i + 10, 10, 5, 0, 2 * Math.PI)
        ctx.fillStyle = 'black';
        ctx.fill();
      }
    }
    // ライフの描画
    for (let i = 0; i < this.life; i++) {
      const lifeImg = document.createElement('img');
      lifeImg.src = 'img/life.png';
      ctx.drawImage(lifeImg, 550 + i * 15, 5);
    }
    // 連射モードゲージの描画
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(30, 8, this.infinityTime / 4, 5)
    // 被弾したときの描画
    if (this.damaged == true) {
      ctx.beginPath();
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  update(){
    // 爆弾操作
    if (keySpace == true && this.bombInterval == 0 && this.bombLeft > 0) {
      bombs.push(new Bomb(this.x, this.y));
      if (this.infinityTime > 0) {
        this.bombLeft = BOMB_MAX;
        this.bombInterval = 8;
      } else {
        this.bombLeft--;
        this.bombInterval = 15;
      }
      // 効果音
      bombSound.currentTime = 0;
      bombSound.play();
      if (this.bombLeft == 0) {
        this.reloadIntvl = 100;
      } else {
        this.reloadIntvl = RELOAD_INTVL;
      }
    } 
    if (this.infinityTime > 0) {
      this.infinityTime--;
    }
    if (this.bombInterval > 0) {
      this.bombInterval--;
    }
    if (this.reloadIntvl > 0 && this.bombLeft < BOMB_MAX) {
      this.reloadIntvl--;
    } else {
      this.reloadIntvl = RELOAD_INTVL;
      if (this.bombLeft < BOMB_MAX) {
        this.bombLeft++;
      }
    }
    // 左右操作
    if (keyRight == true) {
      if (this.x >= CANVAS_WIDTH - BOAT_WIDTH / 2) {return;}
      this.x += this.vx;
    }
    if (keyLeft == true) {
      if (this.x <= BOAT_WIDTH / 2) {return;}
      this.x -= this.vx;
    }
    // 被弾のリセット
    if (this.damaged == true) {
      this.damaged = false;
    }
    // 当たり判定
    for (let i = 0; i < enemyBombs.length; i++) {
      if (enemyBombs[i].x > this.x - BOAT_WIDTH / 2 + 3
          && enemyBombs[i].x < this.x + BOAT_WIDTH / 2 - 3
          && enemyBombs[i].y > this.y - enemyBombs[i].r
          && enemyBombs[i].y < SEA_LINE + enemyBombs[i].r
          && this.noDamageTime == 0) {
            enemyBombs[i].del = true;
            if (this.life > 0) {
              this.life--;
              this.damaged = true;
              // ノーダメージタイム開始
              this.noDamageTime = 80;
              hitSound.currentTime = 0;
              hitSound.play();
            }
      }
    }
    // ノーダメージタイム
    if (this.noDamageTime > 0) {
      this.noDamageTime--;
    }
    // ゲームオーバー
    if (this.life == 0) {
      gameOver = true;
      gbSound.play();
    }
  }
}


// 爆弾クラス
class Bomb {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = BOMB_R;
    // this.vy = 3;
    this.vy = 10;
    this.del = false;
  }

  draw() {
    ctx.beginPath();
    let g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, 'rgb(158, 143, 143)');
    g.addColorStop(1, 'black');
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.y += this.vy;
    if (this.y > CANVAS_HEIGHT + this.r) {
      this.del = true;
    }
  }
}


// 敵クラス
class Enemy {

  constructor() {
    let eneSrcs = [
      ['img/ene011.png', 'img/ene01.png'],
      ['img/ene022.png', 'img/ene02.png'],
      ['img/ene033.png', 'img/ene03.png'],
      // ['img/pen2.png', 'img/pen2.png'],
    ];
    let eneHW = [
      [70, 70],
      [75, 70],
      [59, 70],
      // [200, 200],
    ];
    this.eneNum = rand(0, eneSrcs.length - 1);
    this.randRL = rand(0, 1);
    this.imgSrc = eneSrcs[this.eneNum][this.randRL];
    this.height = eneHW[this.eneNum][0];
    this.width = eneHW[this.eneNum][1];
    let xInit = [-this.width, CANVAS_WIDTH];
    this.x = xInit[this.randRL];
    this.y = rand(SEA_LINE + 100, CANVAS_HEIGHT - this.height);
    this.vx = rand(1, 5);
    this.del = false;
    this.shot = 0;
    // this.hasHeal = rand(1, 15);   /*回復を持っているかどうか*/
    this.hasInfinity = rand(1,20);
    this.shotTime1 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime2 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime3 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime4 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime5 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime6 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime7 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime8 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime9 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime10 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    this.shotTime11 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
    // this.shotTime12 = rand(0, (CANVAS_WIDTH + this.width) / this.vx);
  }

  draw() {
    const eneImg = document.createElement('img');
    eneImg.src = this.imgSrc;
    ctx.drawImage(eneImg, this.x, this.y);
  }

  update() {
    this.randRL == 0 ? this.x += this.vx : this.x -= this.vx;
    this.shot++;
    if (!gameOver) {
      if (this.shot == this.shotTime1 || this.shot == this.shotTime2 
          || this.shot == this.shotTime3 || this.shot == this.shotTime4
          || this.shot == this.shotTime5 || this.shot == this.shotTime6
          || this.shot == this.shotTime7 || this.shot == this.shotTime8
          || this.shot == this.shotTime9 || this.shot == this.shotTime10
          || this.shot == this.shotTime11) {
        enemyBombs.push(new EnemyBomb(this.x, this.y, this.width));
      }
    }
    if (this.x < -this.width || this.x > CANVAS_WIDTH) {
      this.del = true;
    }
    // 当たり判定
    let delBomb = 0;
    for (let i = 0; i < bombs.length; i++) {
      if (bombs[i].x >= this.x - bombs[i].r + NO_HIT_X
          && bombs[i].x <= this.x + this.width + bombs[i].r - NO_HIT_X
          && bombs[i].y >= this.y - bombs[i].r + NO_HIT_Y 
          && bombs[i].y <= this.y + this.height + bombs[i].r - NO_HIT_Y) {
        delBomb++;
        // スコア加算
        if (this.y >= HISCORE_LINE && delBomb < 2) {
          boat.score += SCORE_2;
        } else if (delBomb < 2) {
          boat.score += SCORE;
        }
        // 回復カウントを減らす
        if (boat.life == 1) {
          boat.healCount--;
        }
        // 回復アイテムのプッシュ
        if (boat.healCount == 0 && boat.life == 1 && heals.length == 0) {
          heals.push(new Heal(bombs[i].x, bombs[i].y));
        }
        // if (this.hasHeal == 1 && boat.life == 1 && heals.length == 0) {
        //   heals.push(new Heal(bombs[i].x, bombs[i].y));
        // }
        // 連射アイテムのプッシュ
        if (this.hasInfinity == 1 && boat.infinityTime == 0 && infinities.length == 0) {
          infinities.push(new Infinity(bombs[i].x, bombs[i].y));
        }
        // スコア表示を配列に追加
        scores.push(new Score(this.x, this.y, this.y));
        // 敵の爆発を配列に追加
        explodes.push(new Explode(this.x, this.y, this.width, this.height));
        // 爆発の効果音
        expSound.currentTime = 0;
        expSound.play();
        // 敵と爆弾の削除
        bombs[i].del = true;
        this.del = true;
      } 
    }
  }
}


// 敵の爆弾
class EnemyBomb {

  constructor(enemy_x, enemy_y, enemy_width) {
    this.x = enemy_x + enemy_width / 2;
    this.y = enemy_y;
    this.r = 7;
    this.vy = rand(1, 3);
    this.del = false;
  }

  draw() {
    ctx.beginPath();
    let g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, 'white');
    g.addColorStop(1, 'red');
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.y -= this.vy;
    if (this.y < -this.r) {
      this.del = true;
    }
  }
}


// 回復クラス
class Heal {

  constructor(x, y) {
    this.x = x - HEAL_WIDTH / 2;
    this.y = y;
    this.v = 2;
    this.del = false;
  }

  draw() {
    const healImg = document.createElement('img');
    healImg.src = 'img/heal.png';
    ctx.drawImage(healImg, this.x, this.y);
  }

  update() {
    this.y -= this.v
    if (this.y < -HEAL_HEIGHT) {
      this.del = true;
    }
    if (this.x > boat.x - BOAT_WIDTH / 2 - HEAL_WIDTH + 5
        && this.x < boat.x + BOAT_WIDTH / 2 - 5
        && this.y > SEA_LINE - BOAT_HEIGHT - HEAL_HEIGHT + 3
        && this.y < SEA_LINE - 5) {
      this.del = true;
      healSound.currentTime = 0;
      healSound.play();
      if (boat.life < 3) {
        boat.life++;
      }
    }
  }
}


// 連射クラス
class Infinity {

  constructor(x, y) {
    this.x = x - INFINIT_WIDTH / 2;
    this.y = y;
    this.v = 2;
    this.del = false;
  }

  draw() {
    const infinitImg = document.createElement('img');
    infinitImg.src = 'img/infinity.png';
    ctx.drawImage(infinitImg, this.x, this.y);
  }

  update() {
    this.y -= this.v
    if (this.y < -INFINIT_HEIGHT) {
      this.del = true;
    }
    if (this.x > boat.x - BOAT_WIDTH / 2 - INFINIT_WIDTH + 5
        && this.x < boat.x + BOAT_WIDTH / 2 - 5
        && this.y > SEA_LINE - BOAT_HEIGHT - INFINIT_HEIGHT + 3
        && this.y < SEA_LINE - 5) {
      this.del = true;
      healSound.currentTime = 0;
      healSound.play();
      boat.infinityTime += INFINIT_TIME;
    }
  }
}


// 爆発クラス
class Explode {

  constructor(x, y, w, h) {
    this.w = w;
    this.h = h;
    this.x = x + w / 2 - 48;
    this.y = y + h / 2 - 48;
    this.n = 0;
    this.del = false;
  }

  draw() {
    const expImg = document.createElement('img');
    expImg.src = 'img/explode.png';
    ctx.drawImage(expImg, this.n * 96, 0, 96, 96, this.x, this.y, 96, 96);
  }

  update() {
    if (this.n == 7) {
      this.del = true;
    }
    this.n++;
  }
}


// スコアのクラス
class Score {

  constructor(x, y, ene_y) {
    this.x = x;
    this.y = y + 20;
    this.ene_y = ene_y;
    this.count = 30;
    this.del = false;
  }

  draw() {
    ctx.font = 'bold 20px Verdana';
    ctx.fillStyle = 'white';
    if (this.ene_y >= HISCORE_LINE) {
      ctx.fillText('+' + SCORE_2, this.x, this.y);
    } else {
      ctx.fillText('+' + SCORE, this.x, this.y);
    }
  }

  update() {
    if (this.count == 0) {
      this.del = true;
    }
    this.count--;
    this.y--;
  }

}
 


// インスタンスたち
let boat = new Boat();
let enemies = [];
let bombs = [];
let enemyBombs = [];
let heals = [];
let explodes = [];
let scores = [];
let infinities = [];


// ゲーム初期化
function gameInit() {
  backgroundDraw();
  // boat.draw();
  // enemies.push(new Enemy());
  setInterval(gameLoop, 1000/60);
}
window.onload = function() {
  gameInit();
}



// 最初の画面
function gameStartDraw() {
  ctx.font = 'bold 50px Verdana';
  let a = '「enter」を押して';
  let b = 'スタート！';
  let aw = ctx.measureText(a).width;
  let bw = ctx.measureText(b).width;
  ctx.fillStyle = 'white';
  ctx.fillText(a, CANVAS_WIDTH / 2 - aw / 2, CANVAS_HEIGHT / 2 - 40);
  ctx.fillText(b, CANVAS_WIDTH / 2 - bw / 2, CANVAS_HEIGHT / 2 + 20);
  
  ctx.font = 'bold 20px Verdana';
  ctx.fillStyle = 'greenyellow';
  let c = '「←」「→」で操作';
  let d = '「space」で弾発射';
  let e = '「esc」でやり直す';
  let cw = ctx.measureText(c).width;
  let dw = ctx.measureText(d).width;
  let ew = ctx.measureText(e).width;
  ctx.fillText(c, CANVAS_WIDTH / 2 - cw / 2, CANVAS_HEIGHT / 2 + 80);
  ctx.fillText(d, CANVAS_WIDTH / 2 - dw / 2, CANVAS_HEIGHT / 2 + 120);
  ctx.fillText(e, CANVAS_WIDTH / 2 - ew / 2, CANVAS_HEIGHT / 2 + 160);
  
}



// ゲームオーバー
function gameOverDraw() {
  ctx.font = 'bold 50px Verdana';
  let u = 'スコア: ' + boat.score;
  let uw = ctx.measureText(u).width;
  ctx.fillStyle = 'yellow';
  ctx.fillText(u, CANVAS_WIDTH / 2 - uw / 2, CANVAS_HEIGHT / 2 + 70);

  ctx.font = 'bold 50px Verdana';
  let t = 'GAME OVER';
  let tw = ctx.measureText(t).width;
  ctx.fillStyle = 'white';
  ctx.fillText(t, CANVAS_WIDTH / 2 - tw / 2, CANVAS_HEIGHT / 2 - 80);

  ctx.font = 'normal 30px Verdana';
  let s = '「enter」を押してリトライ ';
  let sw = ctx.measureText(s).width;
  ctx.fillStyle = 'white';
  ctx.fillText(s, CANVAS_WIDTH / 2 - sw / 2, CANVAS_HEIGHT / 2 - 30);
}


// 情報
function debugDraw() {
  ctx.font = 'bold 15px Verdana';
  ctx.fillStyle = 'black';
  ctx.fillText('SCORE: ' + boat.score, 10, 35);
  // ctx.fillText('healCount: ' + boat.healCount, 10, 55);
  // ctx.fillText('インフィニティ: ' + boat.infinityTime, 10, 55);
  // ctx.fillText('ノーダメタイム: ' + boat.noDamageTime, 10, 55);
  // ctx.fillText('heal: ' + heals.length, 10, 55);
  // ctx.fillText('ライフ: ' + boat.life, 10, 75);
  // ctx.fillText('played: ' + played, 10, 55);
  // ctx.fillText('スコア表示: ' + scores.length, 10, 55);
  // ctx.fillText('爆発: ' + explodes.length, 10, 55);
  // ctx.fillText('敵の爆弾: ' + enemyBombs.length, 10, 55);
  // ctx.fillText('リロード: ' + boat.reloadIntvl, 10, 75);
  // ctx.fillText('敵の数: ' + enemies.length, 10, 95);
  // ctx.fillText('ゲームオーバー: ' + gameOver, 10, 115);
  // ctx.fillText('R: ' + keyRetry, 10, 135);
}


// ゲームループ
function gameLoop() {
  backgroundDraw();
  if (!gameOver) {
    // 敵のランダム出現
    if (ENEMY_INTERVAL > 0) {
      ENEMY_INTERVAL--;
    }
    if (ENEMY_INTERVAL == 0 && !gameOver) {
      enemies.push(new Enemy());
      ENEMY_INTERVAL = rand(50, 90);/*............. 敵の発生頻度 */
    }
    // （移動・変化）
    boat.update();
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].update();
      if (enemies[i].del == true) {
        enemies.splice(i, 1);
      }
    }
    for (let i = 0; i < bombs.length; i++) {
      bombs[i].update();
      if (bombs[i].del == true) {
        bombs.splice(i, 1);
      }
    }
    for (let i = 0; i < enemyBombs.length; i++) {
      enemyBombs[i].update();
      if (enemyBombs[i].del == true) {
        enemyBombs.splice(i, 1);
      }
    }
    for (let i = 0; i < explodes.length; i++) {
      explodes[i].update();
      if (explodes[i].del == true) {
        explodes.splice(i, 1);
      }
    }
    for (let i = 0; i < scores.length; i++) {
      scores[i].update();
      if (scores[i].del == true) {
        scores.splice(i, 1);
      }
    }
    for (let i = 0; i < heals.length; i++) {
      heals[i].update();
      if (heals[i].del == true) {
        heals.splice(i, 1);
      }
    }
    for (let i = 0; i < infinities.length; i++) {
      infinities[i].update();
      if (infinities[i].del == true) {
        infinities.splice(i, 1);
      }
    }
    // （描画）
    boat.draw();
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].draw();
    }
    for (let i = 0; i < heals.length; i++) {
      heals[i].draw();
    }
    for (let i = 0; i < infinities.length; i++) {
      infinities[i].draw();
    }
    for (let i = 0; i < bombs.length; i++) {
      bombs[i].draw();
    }
    for (let i = 0; i < enemyBombs.length; i++) {
      enemyBombs[i].draw();
    }
    for (let i = 0; i < explodes.length; i++) {
      explodes[i].draw();
    }
    for (let i = 0; i < scores.length; i++) {
      scores[i].draw();
    }
    // デバッグ
    debugDraw();
  }
  // ゲームオーバー
  if (gameOver && played) {
    gameOverDraw();
  } else if (gameOver && !played) {
    gameStartDraw();
  }
  // ゲームスタート・リトライ
  if (gameOver && keyEnter) {
    gameOver = false;
    played = true;
    boat = new Boat();
    enemies = [];
    bombs = [];
    enemyBombs = [];
    explodes = [];
    scores = [];
    heals = [];
    infinities = [];
    startSound.play();
  }
  // プレイ中にスタート画面に戻る
  if (!gameOver && keyEsc) {
    gameOver = true;
    played = false;
  }
}

}