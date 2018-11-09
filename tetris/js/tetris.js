/**
 * Created by Administrator on 2018/9/20.
 */
window.$ = HTMLElement.prototype.$ = function (selector) {
  return (this == window ? document : this).querySelectorAll(selector);
};

/*
 * 首先定义常亮
 * 应该是从0,0开始，但是这个左边和上边都有一定的距离
 * 0,0应当是修正后的位置，所以后面要加一个固定的修正。因此，初始化的时候就要保存在这个修正
 *
 *
 * */
//封装一个类  (初始化的东西都是放在这里面的)
var tetris = {
  rn: 20,
  cn: 10,
  csize: 26,//宽是26

  //左边和上边的修正
  offset_x: 15,//每个单元格左侧都要加15px
  offset_y: 15,//每个单元格上侧都要加15


  //所有的操作都要在一个大的背景来做
  pg: null, //保存游戏主界面对象

  //因为当前图形经常要用，所以就在全局里面存一份

  //专门保存正在移动的对象。就是在空中飘的那个，一般一次就只有一个在空中飘
  //因为需要很多操作，比如左移右移之类的，所以就在全局中存一份
  currShape: null,
  //在全局中定义一个属性专门保存下一张图片
  nextShape: null,
  //每隔多少秒就重绘一次
  interval: 200,
  //当定时器关闭需要一个变量
  timer: null,
  //定义一个wall，保存下方停止的方块
  wall: [],
  //定义游戏的状态
  state: 1,
  STATE_RUNNING: 1,//游戏正在运行
  STATE_GAMEOVER: 0,//游戏结束
  STATE_PAUSE: 2,//游戏中停
  IMG_GAMEOVER: "img/game-over.png",
  IMG_PAUSE: "img/pause.png",
  SCORES: [0, 10, 50, 80, 200],//定义5档积分
  score: 0,//定义总分
  lines: 0,//定义行数

  //在游戏初始化之前根据游戏的状态为游戏添加不同的图片
  paintState: function () {
    var img = new Image();
    //运用switch语句
    switch (this.state) {
      case  this.STATE_GAMEOVER:
        img.src = this.IMG_GAMEOVER;
        break;
      case this.STATE_PAUSE :
        img.src = this.IMG_PAUSE;
      //break;因为就两个状态，所以不用加break
    }
    this.pg.appendChild(img);
  },

  //初始化函数(一个方法）//这里面相当于都是存初始化的东西
  init: function () {
    //this.pg里存的是一个元素。首先要获得所有的内容
    this.pg = $(".playground")[0];//获取的是div里所有的内容
    //创建一个o图形的对象，存在currShape属性中
    //当前的currShape就保存一个实例对象
    //在一个方法中调用另一个方法用this.
    this.currShape = this.randomShape();
    //在创建当前对象的随机对象的时候也要创建下一个对象的随机对象
    this.nextShape = this.randomShape();
    //初始化wall。wall中数据根据行数创建--> 目前有20行，因此wall的数据也是20!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!要等于空数组
    for (var i = 0; i < this.rn; this.wall[i++] = []);
    this.score =0;
    this.state = 1;
    this.lines = 0;
    //调用paintShape，专门绘制当前图形的方法
    this.paintShape();
    //创建一个定时器
    this.timer = setInterval(function () {
      //需要重画，所以调用重画的函数
      //然后调用图像的下落方法
      tetris.drop();
      //定时器里的this是window，因此不能用this
      tetris.paint();
    }, this.interval);
    //为页面注册键盘按下事件
    document.onkeydown = function () {
      var e = window.event || arguments[0];
      switch (e.keyCode) {
        //因为这里面的this是window
        case 37://左
          tetris.moveL();
          break;
        case 39://右
          tetris.moveR();
          break;
        case 40://下
          tetris.drop();
          break;
        case 38:
          tetris.rotateR();
          break;
        case 90://按Z的时候
          tetris.rotateL();
          break;
        case 80:
          tetris.pause();
          break;
        case 81:
          tetris.gameOver();
          break;
        case 67:
          tetris.myContinue();
          break;//暂停后开始游戏C
        case 83:
         //如果游戏是结束状态，就要恢复初始化
          if(this.state == this.STATE_GAMEOVER){
            tetris.init();
          }//end if
      }//end switch

    };
  },
  gameOver: function () {
    //直接游戏状态就是结束
    this.state = this.STATE_GAMEOVER;
    clearInterval(this.timer);
    timer = null;
    //清除定时器了，就要重画一遍
    this.paint();
  },
  pause: function () {
    //只有只在运行的时候才能停止
    if (this.state == this.STATE_RUNNING) {
      this.state = this.STATE_PAUSE;
    }
  },

  myContinue: function () {
    //如果状态是中停的话，按c就重新开始
    if (this.state == this.STATE_PAUSE) {
      this.state = this.STATE_RUNNING;
    }
  },
  rotateR: function () {
    if (this.state == this.STATE_RUNNING) {
      this.currShape.rotateR();
      if (this.outOfBounds() || this.hit()) {
        this.currShape.rotateL();
      }
    }
  },
  rotateL: function () {
    if (this.state == this.STATE_RUNNING) {
      this.currShape.rotateL();
      if (this.outOfBounds() || this.hit()) {
        this.currShape.rotateR();
      }
    }
  },
  //定义右移的方法
  moveR: function () {
    if (this.state == this.STATE_RUNNING) {
      this.currShape.moveR();
      if (this.outOfBounds() || this.hit()) {
        this.currShape.moveL();
      }
    }
  },
  moveL: function () {
    if (this.state == this.STATE_RUNNING) {
      this.currShape.moveL();
      if (this.outOfBounds() || this.hit()) {
        this.currShape.moveR();
      }
    }
  },

  //绑定两个方法---是否出界或者碰撞到
  outOfBounds: function () {
    //获取所有的单元格
    var cells = this.currShape.cells;
    for (var i = 0; i < cells.length; i++) {
      //判断单元格是否出界(它的col小于0，大于等于rn)
      if (cells[i].col < 0 || cells[i].col >= this.cn) {
        return true;
      }
    }
    return false;
  },
  hit: function () {
    var cells = this.currShape.cells;
    for (var i = 0; i < cells.length; i++) {
      //判断是否撞击，就是和wall中相同的位置
      if (this.wall[cells[i].row][cells[i].col]) {
        return true;
      }
    }
    return false;
  },

  //定义一个方法---为两个span绑定事件
  paintScore: function () {
    $("span")[0].innerHTML = this.score;
    $("span")[1].innerHTML = this.lines;
  },

  //定义一个下落的方法---因为要判断什么时候下落
  drop: function () {
    if (this.state == this.STATE_RUNNING){

      if (this.canDrop()) {
        //如果为true的话就调用下落的方法
        tetris.currShape.drop();
      } else {
        //如果是false，就调用land方法，把数组放入到空数组中
        this.landIntoWall();

        //消行,
        //消除行，并且保存起来
        var ln = this.deleteLines();
        //积分
        //行数对应着下标
        this.score += this.SCORES[ln];
        this.lines += ln;


        //判断只有当wall中没有相等的才随机产生
        //如果当前游戏没有结束
        if (!this.isGameOver()) {
          //  console.log(this);//Object的实例对象
          //当前的图形是由下一次的图形决定
          this.currShape = this.nextShape;
          //下一次的图形是由随机数对象产生
          this.nextShape = this.randomShape();
        } else {
          //如果游戏结束的话，就清除定时器
          clearInterval(this.timer);
          timer = null;
          //游戏结束应该调用游戏结束的状态
          this.state = this.STATE_GAMEOVER;
          this.paint();
        }
      }
    }
  },

  //消行
  //检查wall中每一行是否删除
  deleteLines: function () {
    //遍历wall中的每一行（只是一维普通遍历，这里一定是20*10.所以不用length；
    for (var row = 0, lines = 0; row < this.rn; row++) {
      //如果当前行满了
      if (this.isFull(row)) {
        //删除当前行
        this.deleteL(row);
        //删除的行数+1
        lines++;
      }
    }
    return lines;//!!!!!!!!!!!!!!!!要返回
  },
  //判断指定行是否已满
  isFull: function (row) {
    //取出wall中的第row行，存在line变量中
    var line = this.wall[row];
    for (var c = 0; c < this.cn; c++) {
      //只要当前cell格子无效就返回false
      if (!line[c]) {//第row行的第几个格子==this.wall[row][c]
        return false;//false就说明没有满
      }
    }
    return true;
  },
  //删除指定行----二维数组的遍历
  deleteL: function (row) {
    this.wall.splice(row, 1);//删除指定行
    this.wall.unshift([]);//顶部压入空行
    //从第row行开始向上遍历，如果当前格只要有效，他们的row就++
    for (var r = row; r > 0; r--) {
      //从0开始遍历每个单元格
      for (var c = 0; c < this.cn; c++) {
        //判断当前行的当前格是否有效
        if (this.wall[r][c]) {
          this.wall[r][c].row++;
        }
      }
    }
  },


  //定义游戏结束的方法
  isGameOver: function () {
    //获取nextShape中所有的cell，存在变量cells中
    var cells = this.nextShape.cells;
    //遍历cells中的每个cell
    for (var i = 0; i < cells.length; i++) {
      //取出wall中和当前cell相同的row，相同col格
      //这里的意思就是当前格的row和col去wall中找有没有相同的位置有没有格
      //这里的cells[i].row是这个循环中的cells[i].row，然后去wall中找
      var cell = this.wall[cells[i].row][cells[i].col];

      if (cell) {
        return true;
      }
    }
    return false;
  },


  //定义一个墙的方法，因为当前落下的图形的时候，墻的相同位置也要存储
  landIntoWall: function () {
    //1.遍历当前图形中每个cells数组中每个cells
    var cells = this.currShape.cells;
    for (var i = 0; i < cells.length; i++) {
      //  2.每遍历一个ceLl，就把cell对象放入wall中相同row，col的位置---二维数组
      //cells[i]这是当然的对象的行
      //cells[i]:当前的列
      //这样就可以让它放在完全相同的位置-----输出来是两个数组。一个放第一排，一个放第二排
      this.wall[cells[i].row][cells[i].col] = cells[i];
    }
  },
  //定义一个判断是否能下降的方法
  canDrop: function () {
    //遍历当前图形的cells方法中的row等于最后一行的时候就可以停止了
    var cells = this.currShape.cells;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].row == this.rn - 1) {
        return false;
      }
      //wall中，当前cell的下一行位置有效---图形落在下面有图形的地方的话，就不会往下继续落了
      if (this.wall[cells[i].row + 1][cells[i].col]) {
        return false;
      }
    }
    //遍历结束，返回true
    return true;
  },

  //定义一个重画的方法---因为后面很多都要用到
  paint: function () {
    //console.log(this); ---Object
    //重绘之前先删除所有的图片
    this.pg.innerHTML = this.pg.innerHTML.replace(/<img(.*?)>/g, "");
    //重新画图形
    this.paintShape();
    //重新画墙
    this.paintWall();
    //调用下一次的图形
    this.paintNext();
    //画分数
    this.paintScore();
    //状态图
    this.paintState();
  },

  //下一个图形，也就是右上角的图形
  paintNext: function () {
    //遍历nextShape对象中cells数组中每个cell
    var cells = this.nextShape.cells;
    for (var i = 0; i < cells.length; i++) {
      //保存固定的值
      var r = cells[i].row + 1;
      var c = cells[i].col + 11;
      var x = c * this.csize + this.offset_x;
      var y = r * this.csize + this.offset_y;
      var img = new Image();
      img.src = cells[i].img;//设置为当前的img属性
      img.style.left = x + "px";
      img.style.top = y + "px";
      this.pg.appendChild(img);
    }
  },
  //当打印新的图形的时候，墙也要打印出来，不然就会出现新图形出现，旧图形消失
  paintWall: function () {
    //遍历二维数组wall中的每一个cell
    //这个数组里面有20个数据
    //二维数组外层循环遍历行，内层循环遍历列
    for (var r = 0; r < this.rn; r++) {
      for (var c = 0; c < this.cn; c++) {
        //当前cell在一个二维数组中，怎么获得当前的cell---->二维数组中怎么获得一个元素
        //至少写两个中括号下标
        //当前行的当前单元格用cell存一下
        var cell = this.wall[r][c];
        //判断如果cell存在的话---
        if (cell) {
          var x = cell.col * this.csize + this.offset_x;
          var y = cell.row * this.csize + this.offset_y;
          //console.log(x + "===="+y);
          //image可以直接new ：直接new Images()。image也是一个对象
          var img = new Image();
          //设置img对象的src = 当前cell的img属性
          img.src = cell.img;//设置为当前的img属性
          img.style.left = x + "px";
          img.style.top = y + "px";
          this.pg.appendChild(img);
        }
      }
    }
  },

  //定义一个随机功能函数，就是随机new一个图形，new出图形直接访问
  randomShape: function () {
    //因为图片是从0开始算的。所以相当于是产生1-6之间的数
    switch (parseInt(Math.random() * 4)) {
      case 0: return new O();
      case 1: return new I();
      case 2: return new T();
      case 3: return new S();
       //case 4: return new J();
       //case 5: return new Z();
       //case 6: return new L();
    }
  },

  //写功能函数,专门绘制当前图形的方法：就是飘的那个操作
  paintShape: function () {
    //console.log(this);  当前的this是Object的实例对象
    //paintShape中都有一个cells数组。图形绘制要一个格一个格的画
    //遍历currentShape中cells数组中的每一个cell
    //因为currShape存在全局的，方法可以调用外面的属性
    var cells = this.currShape.cells;
    for (var i = 0; i < cells.length; i++) {
      //console.log(cells[i].col + "=====" + cells[i].row);
      //计算当前cell的横纵坐标
      //计算的方法是坐标乘它本身的宽度，然后加上默认值
      //this.csize相当于就是全局中定义的变量。
      //因为已经有了对象，所以可以直接点出属性
      var x = cells[i].col * this.csize + this.offset_x;
      var y = cells[i].row * this.csize + this.offset_y;
      //console.log(x + "===="+y);
      //image可以直接new ：直接new Images()。image也是一个对象
      var img = new Image();
      //设置img对象的src = 当前cell的img属性
      img.src = cells[i].img;//设置为当前的img属性
      img.style.left = x + "px";
      img.style.top = y + "px";
      this.pg.appendChild(img);
    }

  }
};


window.onload = function () {
  tetris.init();//调用的是这个封装的类里的初始化函数
};


/*
 * 现在要在另一个js中专门建立单元格的类型，构造函数
 * 在画图形的方法里继续写：
 * cell的x坐标：cell的col坐标*csize + offsetx
 * cell的纵坐标
 * 每一个小方块都是一个image.因此要创建一个image对象
 *image可以直接new ： 直接new Images()
 *        //设置img对象的src = 当前cell的img属性
 *          设置img对象的left值为x,
 *         设置img对象的top值为y,
 *         将img对象追加到pg中。。。
 *
 *
 * 目前初始化方法中的paintShape已经可以把图形画出来了。但是游戏开始的时候，这个图形应该是随机的
 *
 *  现在产生一个随机图形的方法。
 *      在方法里面定义一个switch case 语句。随机产生图形。不用加break。
 *      因为return 直接就退出方法了。记住#@在全局中currShape 要改变。调用随机数
 *
 *
 * */

/*
 所有的游戏都是后台操作数据，前台刷新页面
 * 做下落的操作。其实就是挨个下落每个cell.
 * 首先每个单元格都有下落的操作
 * 1.---->格的下落:在cell的函数（每个单元格）中添加一个方法，如果cell的原型没有drop的方法
 * 就添加drop方法。然后让row下落（就是row+1)---->这个drop方法只负责改数据（还是需要paint重画数据）
 * 下落应该是所有图形的公共方法。。shape函数和cell函数没有关系
 * 2.----->图形的下落：就在图形函数的方法中也添加一个下落的方法
 *    1.让一个图形下落。因此应该遍历调用每一个cell的row
 *    2.调用当前cell对象的drop方法
 *    思路----回到tertris中
 *     俄罗斯方块是一直在动，不用停下。没有出现多个动画叠加的效果
 * 3.在tetris中定义一个drop的方法，
 *
 *  下面的两个变成放在定时器中的函数中了 。。下面的两个都是通过对象调用
 *    因为刚打开的时候要有图片，因此要先调用画图的花房
 *  1.paint方法每次都会在新的位置重新画一次。所以应该调用当前图形的paintShape方法
 *       //应该是先画出来，至少画一次再下落。
 *     2.调用当前图像的drop方法
 *
 *4.在全局里面定义一个interval 默认1s重绘一次
 *  要关的话还要定义一个变量
 *5.在init方法中定义一个定时器，定义一个函数，调用下落方法。
 *
 *
 * 注意：一个图形往下落，但是上面的那些图形是不会删的。只是重绘
 *
 * 问题：怎么删除先前的图形。因为是追加的，所以新加的4个方块是在最下面的
 * 在新的追加之前，先删除。
 *
 *
 *
 * 一、首先。因为后面要一直paint（重绘所有格子/分数），图形、方块、分数。等等。所以先写一个巨大的paint方法
 *   1.在绘制之前先删除旧的图片---->结尾的4个images--->利用正则表达式来删除
 *     正则表达式直接匹配出最后的4个images，然后替换成新的字符串
 *     正则表达式:
 *     /<img xxxx>{4}$/  $:以什么结尾  ?:0个到1个
 *     /<img.*> :!!不能这么写。.*不会找出后四个。直接找出一个然后后面的也会有。这叫贪婪模式（正则表达式一般趋向于最大长度匹配）
 *     要用<img.*?>{4}
 *   在绘制之前不能删除所有img，因为在未来还有旁边的
 *   this.pg.innerHTML = this.pg.innerHTML.replace(/(<img(.*?)>)/{4},"")
 *   前面必须写等号，因为代表将后面4个抹掉以后，将新的重新传进去
 *   问题！要加括号，不然{4}匹配到的就是>
 *
 *
 *  2 .就要调用绘制的图形。然后把定时器中的paintShape改掉。
 *
 *二、定一个drop的大方法---
 *   在drop方法的时候判断能否下落，
 *   （能下落）---调用当前图片的下落方法
 *   否则怎么样。。。
 *   把旧的方块删除，同时方块下落的时候能停住
 *
 *
 * 三、定义canDrop的方法，判断是否可继续下落
 *
 * 首先要在全局定义一个数据cells；保存所有停止的方块----先不忙写
 *     在当前形状本身的四个单元格中，没有任何单元格的row的属性等于rn-1（就是最后一行）
 *     //遍历当前图形中的cells，只要发现任意一个cell的row等于rn-1.就返回false
 *     为什么是rn-1.因为row里面存的是下标，是从0开始的、rn存的是总行。
 *     row到了rn-1就不能再往下面走了。。
 *     遍历结束就返回true
 *
 * */


/*
 * 方法里面调用全局要加this
 *
 * */
/*
 * 现在的阶段是方块可以自动向走，并且可以停下。
 * 这四个格应该转到一个数组里当做背景墙去绘制
 * 空中飘的是一个图形对象，落在地上堆在一块的也是一个数组去保存所有的方块
 * 现在要做的：就是一个图形落下来，保存在数组里，然后让下一个图形继续往下落
 * 当一个图形落在不能在下落的时候，就把图形放在数组中
 * 在Tetris里添加一个方法。
 * 1.在属性当中定义一个空数组wall：所有停止下落的下方的方块
 * 2。增加一个新的方法landIntoWall --->依次将cell中的格放在数组里
 *   1.遍历当前图形中每个cells数组中每个cell
 *
 *
 *   2.每遍历一个ceLl，就把cell对象放入wall中相同row，col的位置---二维数组
 *   3.现在要重新回去判断drop，如果不能下落的话，将图形放入墙中。调用landIntowall方法
 *      测试的话，就直接测试每一行。
 *···   ===================================
 * 3.1现在要重新生成一个新图形，放入currshape中。（随机就是新产生新图形）
 *问题：现在是新图形产生，旧图形消失了？
 * 原因:因为只写了打印当前图形的方法
 * 而实际上在当前图形到底后就换成新图形了，
 * 旧图形就打不出来了，所以应该把wall的方法打印出来
 *解决方案：定义一个方法paintWll//负责打印所有落地的墙中的格
 *思路和打印图形的思路差不多，只不过这个没有空格，
 * 因此只用打印只有单元格的地方
 * 1.遍历二维数组wall中的每个格
 *2.如果当前cell有效---不是null和undefined，就可以像打印图形一样打印这个旧图形
 *
 * 现在可以将paint中所有的img全部抹掉---->改变正则表达式，然后重新画一遍。（每次都要删除所有的img格子，再重绘
 * 俄罗斯游戏方块要求每次动画播一次就要重绘一次。
 * 1.重新画图形，2.重新画墙
 *
 * 3.2 问题：现在下落的所有方块虽然能够绘出来，但是被盖住了。后面盖住前面
 *     原因：在canDrop这个方法中并没有判断完整===只遍历了当前格子是否到了最后一行
 *     但是格子也可能在中间停，只要currShape中任意一个cell的下方有wall中的格，就该停了
 *
 *     代码：在candrop中也是来一个判断
 *
 *
 *
 *
 *  整个墙如果堆满的话是一个20*10的二维数组
 *
 *   分析：整个界面是一个20*10的界面。需要先把整个wall做成一个空的
 *        包含20个空数组的二维数组。因为wall本身是一个数组，wall代表了每一行
 *         在每一行当中还有10个格，所以我们就建上10个空的数组等着接这些单元格
 */
/*
 * 相当于初始化每一行
 * 1.在初始化方法中，重画之前。将wall数组初始化为rn个空数组对象。
 * 有几个rn，就加几个wall(空数组）：现在每行都是空数组。只有图形到底不动了，才把每一个按照格所标的行号和列号放在数组中
 *
 * */
//右边的图形就是下一次图形
/*
 * 每次旁边都会出现下一次会出现的图形----游戏界面右上角绘制下一个Shape
 * 定义一个方法paintNext:
 *--
 * -三、现在就涉及到一个概念，在绘制图形的时候，在drop方法中。不是直接给currentShape生成，
 *   1.而是先给nextShape生成随机图像---然后把nextShape给currentShape
 *   谁站在currshape的位置，就是在绘制谁
 *  二、 2.在初始化的时候也要随机生成一个nextShape.
 *   3.在本方法中的固定位置是行+1，列+11.。。和paintShape一样
 *      只不过是遍历nextShape。。在最开始设置横纵坐标的时候就要先定义固定值。
 *  四、 4.在paint里调用这个方法。
 *
 * 一、在全局属性中定义nextShape--专门保存下一个图形对象
 *
 *
 *
 * */

//设置游戏的状态
/*
 * 现在方块的下落和方块的随机生成都已经完成
 * 现在考虑gameover 的方法
 * 1.在下落的方法中
 *   当方块已经到顶的时候，不需要再随机生成新的图片了
 *   因此需要加一个判断--->如果游戏没结束才随机交换生成图片
 *2.在drop方法的下面定义一个isgameover--->判断当前游戏是否结束
 *  判断nextshape中的每个cell出现在wall中的的相同位置有没有格
 *   1.获取nextShape中的所有cell，存在cells
 *   2、遍历cells中每个cell
 *   3.取出wall中和当前cell相同row,col位置的格
 *   4.只要碰到有效的，就返回true
 *   5，没挡住就是false
 *
 *
 * 现在的情况是如果到顶了就没有再走了，但是没有给信号
 * drop方法里面判断如果游戏结束的话就清除定时器并且定时器清空
 *      ======修改它的状态,清除定时器就是游戏结束，因此应该改成游戏结束的状态
 *      然后还要在paint一下，因为前面已经定时器了(手动绘制一次）
 *
 *
 *
 *
 * 在属性里面要定义状态--状态下还有三种状态
 * state：1    -----保存游戏当前的状态
 * state_running 1  ---游戏正在运行
 * state_gameover 0    游戏结束
 * state_pause 2        游戏暂停
 *
 *
 * =====还是将图片统一化管理
 * 存在属性里添加一个img_gameover :....图片地址
 * 属性里添加一个img_pause
 *
 *
 *
 *
 * 定义一个函数====根据现在的游戏状态创建对应的图片
 * paintState----
 * new一个img
 * 用switch case 来做下面的
 * 如果当前状态是gameover,那么就要将
 * 如果是pause 就调用上面的图片的地址
 * 将img追加到pg中
 *
 * ======在paint中调用这个函数，这个应该是在最后
 * */

//开始玩游戏---左移右移
/*
 * 左右移动需要改shape,打开图形的js.
 * cell函数目前只有drop
 * 复制三遍--改状态，右移col++
 *
 *图形函数里也要复制三遍
 *
 * 左移和右移相当于就是图形的移动--->每个单元格的移动（所以要给cell和shape增加左移右移的办法）
 *
 *
 *
 * tetris的方法：
 * 事件的绑定会写在init方法中
 * 所以在init的后面写两个方法
 * moveR
 *   1.调用当前图形的右移方法
 *   2.判断
 *moveL
 *    1. 调用左移方法
 *    2.判断===如果验证不通过就调用moveR方法
 *       判断的条件---两个封装方法任意一方就不通过
 *
 *
 * 封装两个方法outOfBounds//检查当前图形是否越界
 *     只要当前shape中任意一个单元格的col<0或者>=cn
 *     循环遍历每个单元格
 *     判断是否出界和碰撞---是的话就是返回 true.直接退出循环了
 *
 *
 * hit://检查当前图形是否碰撞
 *   遍历，判断在wall中是否有相同位置是否有格子--是的话就是ture.
 *
 *   drop,在candrop中已经做了
 *
 *   在初始化方法中定义键盘按下的功能--用switch来做
 *   这里面不能用window。这里必须写明Tetris。
 *
 *
 * 左移的原理：
 * 1.先左移一次，判断是否越界。如果任意一个格子col小于0了或者大于等于cn就是越界了
 *
 *
 *
 *
 *
 *
 * */

//消行
/*
 *当一个格子已经在下落的时候调用landIntoWall的时候就消行
 * 在调用landIntoWall的时候消行积分
 *
 * 一、在drop方法下面定义一个deleteLines方法----检查所有的行是否消除
 *     遍历wall中的每一行，定义lines变量存本次共删除的行数
 *       如果当前行是满的---通过isFull（row）判断
 *         删除当前行---调用deleteL(row)
 *         每删除一行，lines就要++
 *      返回lines！！！！！！！！！！！！！！！！！！！！！
 *  为什么不在全局定义：
 *     因为本次判断删了一行和两行得分是不一样的，所以要根据每次deleteLINe的行数
 *      先用临时的局部变量保存本次删除的行数。每删除一行，局部的变量就++
 * 二、定义isFull-----判断指定行是否已满  参数 row(行）
 *    取出wall中的第row行，存在line变量中
 *    遍历line中每个cell
 *       只要发现当前cell无效，就立刻返回false
 *     如果遍历结束都没有返回false，就返回true
 *
 *三、deleteL方法---删除指定行，并移除下移之上的所有cell
 *    现在经过上面的判断，已经知道行号了（row)..问题是怎么把每个格都删掉
 *    在wall数组里删，不能删img.因为会重绘。在数组中把子数组删除就可以了
 *    1.删除指定行
 *    2、顶部压入新的空行
 *    3.遍历-倒循环（到1就可以了）
 *        从row行开始，向上遍历每一行
 *        从0开始遍历当前行的每个格
 *          如果当前格有效
 *            将当前格
 *
 *   4.下落完，结束之前---消行(this.deleteLines，并返回本次消除的行数
 *
 * */
//--积分
/*
 * 在全局属性中增加一个SCORES的属性（包含0 10 50 80 200）===分数的档位
 * score:0===刚开始都是0 当前总分
 * lines:0===当前总行数
 *在drop里面积分的话
 * deleteLines和下标对应在一起
 * this.score+= this.SCORES[ln] :ln的下标对应着的就是分数
 * this.lines+=ln
 *
 * 在drop上面写一个paintScore方法 ---负责找到两个span
 * 第一个span中放this.score
 * 第二个span放this.lines；
 *
 * paint方法中--在状态之前调用，状态习惯最后写
 *
 *
 * */


//旋转后台数据

/*
 *所有旋转的图形，应该有一个参照的原点单元格
 * I的旋转：只有两个状态，以第二个为参照点。左边的移到同列，行+1
 * 第三个和第四个都移到同行+1，同行+2
 *
 * T：
 * 初始状态：左边这个和参照的格的row相同，col-1
 *          右边这个row不变，col+1
 *          下面是col不变，row+1
 * 第一种状态，左边的到上面，row-1,同列
 *            右边到下面，row+1,同列
 *            下面到左边。同行。col-1
 *
 *   所有的单元格都参照一个格来定，
 *
 *   打开shape.js
 *   定义状态类型方法State(8个参数）
 *
 *
 *   调用自己的构造函数之前先调用父类型的。这样所有的子类型都可以调用父类型
 *
 *   怎么确定参照格：
 *
 *   1.要给图形这个方法加一个参数orgi(参照格的下标）
 *       因为shape多传了一个参数，而每次下面的方法在call它的时候
 *       就要传入这个参照格的索引
 *   2.o可以不写
 *   3.z的参照格是2
 *   4.L的参照格是1，J也是1
 *  所有的默认状态都是0，因为有可能会转过来
 *
 * 旋转的状态是所有图形的一个初始状态。
 * 增加方法。
 *    判断不是o的话{
 *    首先应该将statei++;每次statei就改变一个状态
 *    然后如果大于等于length，就回到初始状态
 *     获得下一个状态对象
 *     获得参照格的位置的横纵坐标（orgr,orgc)
 *     遍历当前图形中的每个cell
 *     按照state中的偏移量，设置每个cell的新位置
 *
 *     .后面不能带运算符。可以用[]
 *
 *
 * 问题：o不适用，
 * Object.getPrototypeOf(this)
 *   获取当前对象的原型，当前对象不等于O.prototype
 *
 *  或者当前的constructor!=o;
 *
 *
 *
 *
 *
 *
 * */
//旋转开始
/*38---右  90 --L
 *在键盘按下的事件中也不能直接用，要判断是否碰撞和越界
 * 就和moveR和moveL的方法一样
 *
 *
 *
 * */

//什么状态什么是
/*
 * P80：暂停
 * Q81：结束游戏
 * C：暂停后，继续游戏
 * S:83 //游戏结束后，重新开始
 * 定义四个方法  continue是关键字
 *
 *在drop中增加一个总的判断，只有状态等于running 的时候才继续
 * 原理：就是一直在相同的位置不停的刷新
 * pause：只有等于running的时候才能暂停
 * 只有暂停情况下，才能恢复状态
 *停止：直接gameover了然后停了定时器。然后再重画一次
 * 问题：当停止的时候依然可以变形和左移优异
 *   四大方法只有在状态等于运行的时候才运行
 *
 *
 * */


/*
 * 1.二维数组遍历：
 * 外层循环遍历行
 *2.二维数组中取出元素
 *
 * 3.判断一个对象是怎么创建出来的，就要用原型
 *    或者constructor
 *
 *
 * js当中一切都是对象，所有对象的底层都是关联数组，都可以通过[]下标的位置去访问
 * */
