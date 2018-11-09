/**
 * Created by Administrator on 2018/9/20.
 */
//封装一个专门表示小单元格的类型
function Cell(row, col, img) {
  this.row = row;
  this.col = col;
  this.img = img;//保存每个图形应该用的图片
  //判断cell中有没有这个drop下落的方法
  if (!Cell.prototype.drop) {
    //如果没有就在原型当中添加方法
    Cell.prototype.drop = function () {
      //所有的单元格都有下落的操作
      //在原型方法中定义一个下落的数据（后台操作数据）
      this.row++;
    }
  }
  if (!Cell.prototype.moveR) {
    //如果没有就在原型当中添加方法
    Cell.prototype.moveR = function () {
      //所有的单元格都有下落的操作
      //在原型方法中定义一个下落的数据（后台操作数据）
      this.col++;
    }
  }
  if (!Cell.prototype.moveL) {
    //如果没有就在原型当中添加方法
    Cell.prototype.moveL = function () {
      //所有的单元格都有下落的操作
      //在原型方法中定义一个下落的数据（后台操作数据）
      this.col--;
    }
  }
}

//封装一个状态.因为有4个格子，因为横纵加起来就是8个
function State(r0, c0, r1, c1, r2, c2, r3, c3) {
  this.r0 = r0;
  this.c0 = c0;
  this.r1 = r1;
  this.c1 = c1;
  this.r2 = r2;
  this.c2 = c2;
  this.r3 = r3;
  this.c3 = c3;
}

//I 03 04  05 06
function I() {
  Shape.call(this, "img/I.png", 1);
  if (!Shape.prototype.isPrototypeOf(I.prototype)) {
    Object.setPrototypeOf(I.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    new Cell(0, 3, this.img), new Cell(0, 4, this.img), new Cell(0, 5, this.img), new Cell(0, 6, this.img)
  ];
  //有两个状态就调用两次
  this.states[0] = new State(0, -1, 0, 0, 0, 1, 0, 2);//定义下标的偏移量
  //[0] [1]   [2]   [3]
  this.states[1] = new State(-1, 0, 0, 0, 1, 0, 2, 0);
}

//打印第二个图形T 03 04 05 14
function T() {
  Shape.call(this, "img/T.png", 1);
  if (!Shape.prototype.isPrototypeOf(T.prototype)) {
    Object.setPrototypeOf(T.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    new Cell(0, 3, this.img), new Cell(0, 4, this.img), new Cell(0, 5, this.img),
    new Cell(1, 4, this.img)
  ];
  this.states[0] = new State(0, -1, 0, 0, 0, 1, 1, 0);
  this.states[1] = new State(-1, 0, 0, 0, 1,0, 0,-1);
  this.states[2] = new State(0, 1, 0, 0, 0, -1, -1, 0);
  this.states[3] = new State(1, 0, 0, 0, -1, 0, 0, 1);
}

//S 04 05 13 14
function S() {
  Shape.call(this, "img/S.png",3);//O在任何情况都是这个图片
  //如果shape不是o的父对象,那就设置为父对象
  if (!Shape.prototype.isPrototypeOf(S.prototype)) {
    Object.setPrototypeOf(S.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    new Cell(0, 4, this.img), new Cell(0, 5, this.img), new Cell(1, 3, this.img), new Cell(1, 4, this.img)
  ];
  this.states[0] = new State(-1,0, -1,1, 0,-1, 0,0);
  this.states[1] = new State(0,1, 1,1, -1,0, 0,0);
}

//封装所有图形的父类型 shape,比如所有图形都有公共方法，就把这图形加
//在shape里
function Shape(img, orgi) {
  //所有图形在new的时候都会call一下shape，写在shape里相当于就是写在子类型里了
  //所有的图形都有自己的图片
  this.img = img;
  //保存当前图形参照格在cells数组的索引
  this.orgi = orgi;
  //这个是定死
  this.states = [];// 保存所有图形的状态--
  this.statei = 0;//默认所有图形的初始状态是0，当在new的时候直接就调用了
  //所有的图形都有下落的操作
  if (!Shape.prototype.drop) {
    Shape.prototype.drop = function () {
      //要让一个图片下落，首先应该得到每个单元格的纵坐标
      for (var i = 0; i < this.cells.length; i++) {
        //为什么可以调用，因为cell当中new了的
        //调用cell对象的drop方法（也就是让每一个纵坐标+1）
        this.cells[i].drop();
      }
    };
  }
  if (!Shape.prototype.moveR) {
    Shape.prototype.moveR = function () {
      //要让一个图片下落，首先应该得到每个单元格的纵坐标
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].moveR();
      }
    };
  }
  if (!Shape.prototype.moveL) {
    Shape.prototype.moveL = function () {
      //要让一个图片下落，首先应该得到每个单元格的纵坐标
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].moveL();
      }
    };
  }
  //判断下落的条件---向右转
  if (!Shape.prototype.rotateR) {
    Shape.prototype.rotateR = function () {
      if (this.constructor != O) {
        this.statei++;//每转一次就要变到下一个状态
       //什么时候这个statei回到初始状态
        this.statei >= this.states.length && (this.statei = 0);
        //获得下一个状态
        var state = this.states[this.statei];
        //获取当前格的横纵坐标//调用要加this!!!!
        var orgr = this.cells[this.orgi].row;
        var orgc = this.cells[this.orgi].col;
        //遍历当前图形中的每个cell
        //按state 中的偏移量，设置每个cell的新位置 --就是原点位置加上偏移量
        for (var i = 0; i < this.cells.length; i++) {
          this.cells[i].row = orgr + state["r" + i];
          this.cells[i].col = orgc + state["c" + i];
        }
      }
    }
  }
  //向左转，逆向.往回转
  if (!Shape.prototype.rotateL) {
    Shape.prototype.rotateL = function () {
      if (this.constructor != O) {
        this.statei--;
        //如果小于0的话就超了，小于0的话，下标就是等于数组的长度-1
        this.statei < 0 && (this.statei = this.states.length - 1);
        //获得下一个状态
        var state = this.states[this.statei];
        //获取当前格的横纵坐标
        var orgr = this.cells[this.orgi].row;
        var orgc = this.cells[this.orgi].col;
        //遍历当前图形中的每个cell
        //按state 中的偏移量，设置每个cell的新位置 --就是原点位置加上偏移量
        for (var i = 0; i < this.cells.length; i++) {
          this.cells[i].row = orgr + state["r" + i];
          this.cells[i].col = orgc + state["c" + i];
        }
      }
    }
  }

}

/*
 * 下面所有的代码相当于就是定义每个对象的坐标，然后将他们的__proto__设置为Shape
 * */


//打印第一个图形o，就是方块---->O的数据结构
function O() {
  //O既然是shape的子类型，那么就要调用它
  //现在只要new这个O，就添加个图片这个属性
  //这句代码的意思就是可以调用shape的函数、这是用的相对路径
  Shape.call(this, "img/O.png");//O在任何情况都是这个图片
  //如果shape不是o的父对象,那就设置为父对象
  if (!Shape.prototype.isPrototypeOf(O.prototype)) {
    Object.setPrototypeOf(O.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    //这里new了一个cell.说明它是cell的构造函数，可以用cell中的方法，同时
    //shape是他的父元素，它也可以用shape的方法
    new Cell(0, 4, this.img), new Cell(0, 5, this.img),
    new Cell(1, 4, this.img), new Cell(1, 5, this.img)
  ];
}



//Z 03 04 14 15
function Z() {
  Shape.call(this, "img/Z.png");//O在任何情况都是这个图片
  //如果shape不是o的父对象,那就设置为父对象
  if (!Shape.prototype.isPrototypeOf(Z.prototype)) {
    Object.setPrototypeOf(Z.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    new Cell(0, 3, this.img), new Cell(0, 4, this.img), new Cell(1, 4, this.img), new Cell(1, 5, this.img)
  ];
}
//L 03 04 14 15
function L() {
  Shape.call(this, "img/L.png");//O在任何情况都是这个图片
  //如果shape不是o的父对象,那就设置为父对象
  if (!Shape.prototype.isPrototypeOf(L.prototype)) {
    Object.setPrototypeOf(L.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    new Cell(0, 3, this.img), new Cell(0, 4, this.img), new Cell(0, 5, this.img), new Cell(1, 3, this.img)
  ];
}
//J 03 04 05 15
function J() {
  Shape.call(this, "img/J.png");//O在任何情况都是这个图片
  //如果shape不是o的父对象,那就设置为父对象
  if (!Shape.prototype.isPrototypeOf(J.prototype)) {
    //设置J是shape的父元素
    Object.setPrototypeOf(J.prototype, Shape.prototype);
  }
  //一个图形有几个cell组成（4个）
  //用一个cells的数组来保存所有O的图片；o出现应该是从正中间出来
  this.cells = [
    //从中间出来，所以用的是中间的坐标
    //调用cell，传3个参数(横坐标(col)，纵坐标(row)，图片）
    new Cell(0, 3, this.img), new Cell(0, 4, this.img), new Cell(0, 5, this.img), new Cell(1, 5, this.img)
  ];
}

