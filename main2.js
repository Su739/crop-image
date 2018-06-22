var avatar = document.getElementById('avatar');
var avatarMask = document.getElementById('avatar-mask');
var operateArea = document.getElementsByClassName('operate-area')[0];
var canvasContainer = document.getElementsByClassName('canvas-container')[0];
var image = document.getElementById('source-img');
var tarScalingController = document.getElementsByClassName('scaling-control')[0].children[0];

var draging = false;
var srcDivideTar = 1; //源尺寸与目标尺寸的比值
var srcWidth = 0; // 源图片(srcImage)宽度
var srcHeight = 0;
var avatarOffsetX = 0; // 源图片横坐标偏移
var avatarOffsetY = 0;
var maskOffsetX = 0;
var maskOffsetY = 0;

var lastScale = 1;

var tarWidth = 0; // 目标宽度，drawImage 9 个参数中的第 8 个， 缩放时就是改变他
var tarHeight = 0;
var initialTarWidth = 0;
var initialTarHeight = 0;
var boardMaskWidth = 200; // 图片预览尺寸
var boardMaskHeight = 200;
var boardAvatarWidth = 140;
var boardAvatarHeight = 140;

drawingBoardState = {
  draging: false,
  srcDivideTar: 1, //缩放比例,由源宽度(或者高度)与目标宽度(高度)的比值决定，显然同一图片源是不变的
  srcWidth: 0, // 源图片(srcImage)宽度
  srcHeight: 0,
  avatarOffsetX: 0, // 源图片横坐标偏移
  avatarOffsetY: 0,
  tarWidth: 0, // 目标宽度，drawImage 9 个参数中的第 8 个， 缩放时就是改变他
  tarHeight: 0
};

const canvasInitialValue = {
  boardAvatarWidth: 140, // 图片预览尺寸
  boardAvatarHeight: 140,
  boardMaskWidth: 200,
  boardMaskHeight: 200
};

var upload = document.getElementById('upload');
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
  initDrawAvatar(avatarCtx, srcImage);
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
      image.src = imageUri;
    }
  };
  var imageUri = avatarMask.toDataURL('image/png');
  image.src = imageUri;
  tarScalingController.onchange = function(e) {
    avatarCtx.clearRect(0, 0, boardAvatarWidth, boardAvatarHeight);
    reDrawOnScaling(srcImage, e.target.value);
  };
  tarScalingController.oninput = function(e) {
    reDrawOnScaling(srcImage, e.target.value);
  };
};

function initDrawAvatar(avatarCtx, image) {
  srcWidth = image.width;
  srcHeight = image.height;

  if (srcWidth > srcHeight) {
    tarWidth = initialTarWidth = boardAvatarHeight * (srcWidth / srcHeight);
    tarHeight = initialTarHeight = boardAvatarHeight;
  } else {
    tarWidth = initialTarWidth = boardAvatarWidth;
    tarHeight = initialTarHeight = boardAvatarWidth * (srcHeight/ srcWidth);
  }

  srcDivideTar = (srcWidth / tarWidth);

  maskOffsetX = ((tarWidth - boardMaskWidth) / 2) * srcDivideTar;
  maskOffsetY = ((tarHeight - boardMaskHeight) / 2) * srcDivideTar;
  
  avatarOffsetX = ((tarWidth - boardAvatarWidth) / 2) * srcDivideTar;
  avatarOffsetY = ((tarHeight - boardAvatarHeight) / 2) * srcDivideTar;

  avatarCtx.drawImage(image, avatarOffsetX, avatarOffsetY, srcWidth, srcHeight, 0, 0, tarWidth, tarHeight);
  if (maskOffsetX > 0) {// y必然小于等于0
    maskCtx.drawImage(image, 0, 0, srcWidth, srcHeight, -maskOffsetX / srcDivideTar, (boardMaskHeight - tarHeight) / 2, tarWidth, tarHeight);
  } else {
    maskCtx.drawImage(image, 0, 0, srcWidth, srcHeight, (boardMaskWidth - tarWidth) / 2 , -maskOffsetY / srcDivideTar, tarWidth, tarHeight);
  }
}

function reDrawOnMove(image, moveX, moveY) {
  avatarCtx.clearRect(0, 0, boardAvatarWidth, boardAvatarHeight);
  maskCtx.clearRect(0, 0, boardMaskWidth, boardMaskHeight);

  var newAvatarOffseX = avatarOffsetX - moveX * srcDivideTar;
  var newAvatarOffsetY = avatarOffsetY - moveY * srcDivideTar;
  maskOffsetX = maskOffsetX - moveX * srcDivideTar;
  maskOffsetY = maskOffsetY - moveY * srcDivideTar;

  // 移动后坐标超出x轴负方向边界...唉～形容不好这个边界
  if (newAvatarOffseX < 0) {
    avatarOffsetX = 0;
    maskOffsetX = (boardAvatarWidth - boardMaskWidth) / 2 * srcDivideTar;
  } else if (avatarOffsetX - moveX * srcDivideTar  > srcWidth - boardAvatarWidth * srcDivideTar){// 移动后坐标超出x轴正方向边界
    avatarOffsetX = srcWidth - boardAvatarWidth * srcDivideTar;
    maskOffsetX = (boardAvatarWidth - boardMaskWidth) / 2 * srcDivideTar;
  } else {
    avatarOffsetX = newAvatarOffseX;
  }

  // 移动后坐标超出y轴负方向边界
  if (newAvatarOffsetY < 0) {
    avatarOffsetY = 0;
    maskOffsetY = (boardAvatarHeight - boardMaskHeight) / 2 * srcDivideTar;
  } else if (newAvatarOffsetY  > srcHeight - boardAvatarHeight * srcDivideTar){// 移动后坐标超出y轴正方向边界
    avatarOffsetY = srcHeight - boardAvatarHeight * srcDivideTar;
    maskOffsetY = (boardAvatarHeight - boardMaskHeight) / 2 * srcDivideTar;
  } else {
    avatarOffsetY = newAvatarOffsetY;
  }

  console.log(maskOffsetX);
  if (maskOffsetX < 0 && maskOffsetY < 0) {
    maskCtx.drawImage(image, 0, 0, srcWidth, srcHeight, -maskOffsetX / srcDivideTar, -maskOffsetY / srcDivideTar, tarWidth, tarHeight);
  }
  
  avatarCtx.drawImage(image, avatarOffsetX, avatarOffsetY, srcWidth, srcHeight, 0, 0, tarWidth, tarHeight);
}

function reDrawOnScaling(image, scale) {
  var lastSrcDivideTar = srcDivideTar;
  avatarCtx.clearRect(0, 0, boardAvatarWidth, boardAvatarHeight);
  maskCtx.clearRect(0, 0, boardMaskWidth, boardMaskHeight);

  tarWidth = tarWidth + initialTarWidth * (scale - lastScale);
  tarHeight = tarHeight + initialTarHeight * (scale - lastScale);

  srcDivideTar = srcWidth / tarWidth;
  
  avatarOffsetX = (avatarOffsetX / lastSrcDivideTar + initialTarWidth * (scale - lastScale) / 2) * srcDivideTar;
  if (avatarOffsetX < 0) {
    avatarOffsetX = 0;
  } else if (avatarOffsetX > (srcWidth - boardAvatarWidth * srcDivideTar)) {
    avatarOffsetX = (avatarOffsetX / srcDivideTar + initialTarWidth * (scale - lastScale) / 2) * srcDivideTar;
    
    if (avatarOffsetX < 0) {
      avatarOffsetX = 0;
    }
  } 
  
  avatarOffsetY = (avatarOffsetY / lastSrcDivideTar + initialTarHeight * (scale - lastScale) / 2) * srcDivideTar;
  if (avatarOffsetY < 0) {
    avatarOffsetY = 0;
  } else if (avatarOffsetY > (srcHeight - boardAvatarHeight * srcDivideTar)) {
    avatarOffsetY = (avatarOffsetY / srcDivideTar + initialTarHeight * (scale - lastScale) / 2) * srcDivideTar;
    if (avatarOffsetY < 0) {
      avatarOffsetY = 0;
    }
  } 
  // avatarOffsetX = avatarOffsetX * scale;

  // avatarOffsetY = avatarOffsetY + (initialTarHeight * (scale - lastScale) * srcDivideTar / 2);
  lastScale = scale;
  avatarCtx.drawImage(image, avatarOffsetX, avatarOffsetY, srcWidth, srcHeight, 0, 0, tarWidth, tarHeight);
  // avatarCtx.drawImage(avatarMask, avatarOffsetX + 30 , avatarOffsetY +30, );
}

