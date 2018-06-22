(function (){
  var avatar = document.getElementById('avatar');
  var avatarMask = document.getElementById('avatar-mask');
  var operateArea = document.getElementsByClassName('operate-area')[0];
  var canvasContainer = document.getElementsByClassName('canvas-container')[0];
  var image1 = document.getElementById('big');
  var image2 = document.getElementById('middle');
  var image3 = document.getElementById('small');
  var tarScalingController = document.getElementsByClassName('scaling-control')[0].children[1];

  var draging = false; // 拖动标志位
  var srcWidth = 0; // 源图片(srcImage)宽度
  var srcHeight = 0; // 源图片(srcImage)高度
  var avatarOffsetX = 0; // 目标图片横坐标偏移
  var avatarOffsetY = 0; // 目标图片横纵坐标偏移
  var maskOffsetX = 0;  // 目标遮罩横坐标偏移
  var maskOffsetY = 0; // 目标遮罩纵坐标偏移

  var lastScale = 1; // 记录上一次的缩放比例

  var tarWidth = 0; // 目标图片宽度
  var tarHeight = 0; // 目标图片宽度
  var initialTarWidth = 0;  // 初始化后的目标图片宽度
  var initialTarHeight = 0; // 初始化后的目标图片高度
  var boardMaskWidth = 200; // 遮罩宽度
  var boardMaskHeight = 200; 
  var boardAvatarWidth = 140; // 结果头像的宽度
  var boardAvatarHeight = 140;

  var upload = document.getElementById('upload'); // 待上传的图片
  var maskCtx = avatarMask.getContext('2d');
  var avatarCtx = avatar.getContext('2d');
  var srcImage = document.createElement('img');

  document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);

  function DOMContentLoaded() {
    upload.addEventListener('change',function() {
      var uploadImage = upload.files[0];
      srcImage.src = window.URL.createObjectURL(uploadImage);
    }, false );
  }

  srcImage.onload = function() {
    initDrawAvatar(srcImage);
    var imageUri = avatar.toDataURL('image/png');
    canvasContainer.onmousedown = function() {
      draging = true;
    };
    // 要扩大操作区域，好操作
    operateArea.onmouseup = function() {
      draging = false;
    };
    operateArea.onmouseleave = function() {
      draging = false;
    };
    operateArea.onmousemove = function(e) {
      if (draging) {
        reDrawOnMove(srcImage, e.movementX, e.movementY);
        var imageUri = avatar.toDataURL('image/png');
        image1.src = imageUri;
        image2.src = imageUri;
        image3.src = imageUri;
      }
    };
    image1.src = imageUri;
    image2.src = imageUri;
    image3.src = imageUri;
    tarScalingController.onchange = function(e) {
      imageUri = avatar.toDataURL('image/png');
      avatarCtx.clearRect(0, 0, boardAvatarWidth, boardAvatarHeight);
      reDrawOnScaling(srcImage, e.target.value);
      image1.src = imageUri;
      image2.src = imageUri;
      image3.src = imageUri;
    };
    tarScalingController.oninput = function(e) {
      imageUri = avatar.toDataURL('image/png');
      reDrawOnScaling(srcImage, e.target.value);
      image1.src = imageUri;
      image2.src = imageUri;
      image3.src = imageUri;
    };
  };

  function initDrawAvatar(image) {
    srcWidth = image.width;
    srcHeight = image.height;

    // 根据不同比例初始化目标尺寸
    if (srcWidth > srcHeight) {
      tarWidth = initialTarWidth = boardAvatarHeight * (srcWidth / srcHeight);
      tarHeight = initialTarHeight = boardAvatarHeight;
    } else {
      tarWidth = initialTarWidth = boardAvatarWidth;
      tarHeight = initialTarHeight = boardAvatarWidth * (srcHeight/ srcWidth);
    }

    // 计算初始化坐标
    maskOffsetX = (boardMaskWidth -tarWidth) / 2;
    maskOffsetY = (boardMaskHeight - tarHeight) / 2;
    
    avatarOffsetX = (boardAvatarWidth - tarWidth) / 2;
    avatarOffsetY = (boardAvatarHeight - tarHeight) / 2;

    // 从原图片的0,0坐标开始，将srcWidth, srcHeight这个尺寸的源图片，缩放为tarWidth, tarHeight这个尺寸，然后从缩放后图片的
    // avatarOffsetX, avatarOffsetY 坐标开始，画到相应的canvas中
    avatarCtx.drawImage(image, 0, 0, srcWidth, srcHeight, avatarOffsetX, avatarOffsetY, tarWidth, tarHeight);
    maskCtx.drawImage(image, 0, 0, srcWidth, srcHeight, maskOffsetX, maskOffsetY, tarWidth, tarHeight);
  }

  function reDrawOnMove(image, moveX, moveY) {
    avatarCtx.clearRect(0, 0, boardAvatarWidth, boardAvatarHeight);
    maskCtx.clearRect(0, 0, boardMaskWidth, boardMaskHeight);

    // 无论哪个reDraw函数，都要先行计算avatar的偏移量，来判断是否越界
    var newAvatarOffseX = avatarOffsetX + moveX;
    var newAvatarOffsetY = avatarOffsetY + moveY;

    // 移动后坐标超出x轴负方向边界...唉～形容不好这个边界
    if (newAvatarOffseX > 0) {
      avatarOffsetX = 0;
      maskOffsetX = (boardMaskWidth - boardAvatarWidth) / 2;
    } else if (newAvatarOffseX < boardAvatarWidth - tarWidth){// 移动后坐标超出x轴正方向边界,注意x为负
      // 保证图像位置在边沿处不越界
      avatarOffsetX = boardAvatarWidth - tarWidth;
      maskOffsetX = (boardMaskWidth + boardAvatarWidth) / 2 - tarWidth;// 负数
    } else {
      avatarOffsetX = newAvatarOffseX;
      maskOffsetX = maskOffsetX + moveX;
    }

    // 移动后坐标超出y轴负方向边界
    if (newAvatarOffsetY > 0) {
      avatarOffsetY = 0;
      maskOffsetY = (boardMaskHeight - boardAvatarHeight) / 2;
    } else if (newAvatarOffsetY < boardAvatarHeight - tarHeight){// 移动后坐标超出y轴正方向边界
      avatarOffsetY = boardAvatarHeight - tarHeight;
      maskOffsetY = (boardMaskHeight + boardAvatarHeight) / 2 - tarHeight;
    } else {
      avatarOffsetY = newAvatarOffsetY;
      maskOffsetY = maskOffsetY + moveY;
    }

    maskCtx.drawImage(image, 0, 0, srcWidth, srcHeight, maskOffsetX, maskOffsetY, tarWidth, tarHeight);
    avatarCtx.drawImage(image, 0, 0, srcWidth, srcHeight, avatarOffsetX, avatarOffsetY, tarWidth, tarHeight);
  }

  function reDrawOnScaling(image, scale) {
    avatarCtx.clearRect(0, 0, boardAvatarWidth, boardAvatarHeight);
    maskCtx.clearRect(0, 0, boardMaskWidth, boardMaskHeight);
    var diffWidth = initialTarWidth * (scale - lastScale);
    var diffHeight = initialTarHeight * (scale - lastScale);

    tarWidth = tarWidth + diffWidth;
    tarHeight = tarHeight + diffHeight;
    avatarOffsetX = avatarOffsetX - diffWidth / 2;
    // 由于js小数计算精确度的问题，会造成意想不到的avatarOffsetX > 0大于0的情况，这个数会非常小，但是他确实大于0
    // 保证图像位置在边沿处不越界
    if (avatarOffsetX > 0) {
      avatarOffsetX = 0;
      maskOffsetX = maskOffsetX - diffWidth / 2;
      maskOffsetX = (boardMaskWidth - boardAvatarWidth) / 2;
    } else if (avatarOffsetX < (boardAvatarWidth - tarWidth)) {
      avatarOffsetX = boardAvatarWidth - tarWidth;
      maskOffsetX = (boardMaskWidth + boardAvatarWidth) / 2 - tarWidth;// 负数
    } else {
      maskOffsetX = maskOffsetX - diffWidth/ 2;
    }

    // 保证图像位置在边沿处不越界
    avatarOffsetY = avatarOffsetY - diffHeight / 2;
    if (avatarOffsetY > 0) {
      avatarOffsetY = 0;
      maskOffsetY = (boardMaskHeight - boardAvatarHeight) / 2;
    } else if (avatarOffsetY < (boardAvatarHeight - tarHeight)) {
      //由于js小数计算精确度的问题，也会意外进入到这里，如果是意外进入maskOffsetY = maskOffsetY + diffHeight;就会过分的放大或缩小坐标
      // 导致出现错误，所以使用maskOffsetY = (boardMaskHeight + boardAvatarHeight) / 2 - tarHeight;不会出现错误
      // maskOffsetY = maskOffsetY + diffHeight; 原理是如果图像在边沿位置，也就是边沿不会缩放，对应的另外一端2倍缩放
      // 保证图像位置在边沿处不越界
      avatarOffsetY = boardAvatarHeight - tarHeight;
      maskOffsetY = (boardMaskHeight + boardAvatarHeight) / 2 - tarHeight;// 负数
    } else {
      maskOffsetY = maskOffsetY - diffHeight / 2;
    }
    // console.log((boardAvatarHeight - tarHeight));
    lastScale = scale;
    avatarCtx.drawImage(image, 0, 0, srcWidth, srcHeight, avatarOffsetX, avatarOffsetY, tarWidth, tarHeight);
    maskCtx.drawImage(image, 0, 0, srcWidth, srcHeight, maskOffsetX, maskOffsetY, tarWidth, tarHeight);
  }

})();