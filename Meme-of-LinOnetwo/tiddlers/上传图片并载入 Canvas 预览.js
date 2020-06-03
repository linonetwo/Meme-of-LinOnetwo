import ImageUploader from 'react-images-upload';

...

<ImageUploader
            singleImage={true}
            buttonText={props.currentPicture ? '处理中' : '上传'}
            onChange={(picture: File[]) => {
              props.setPicture(URL.createObjectURL(picture[0]));
            }}
            imgExtension={['.jpg', '.gif', '.png', '.gif']}
            label="点击上传待检测的8K照片"
            maxFileSize={5242880000}
          />
          
...

function useBackground(
  currentPic: string, // 把刚刚生成的 DataURL 放到这
  canvasRef: React.RefObject<HTMLCanvasElement>,
  currentPositionDelta,
  currentScaleRate,
  canvasStyleSet,
  setScale,
  removeWhiteBackground?: boolean,
) {
  const [currentImage, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    const markImage = new Image();
    markImage.src = currentPic;
    markImage.onload = () => {
      setImage(markImage);
    };
  }, [currentPic]);

  const [imgInit, setImgInit] = useState(false);
  useEffect(() => {
    if (canvasStyleSet && !!currentPic && !!canvasRef.current && currentImage) {
      const canvasContext = canvasRef.current.getContext('2d');
      if (!canvasContext) {
        throw new Error('Canvas2D Context creation failed. loading pic to canvas and beautify it');
      }
      if (canvasRef.current) {
        canvasContext.drawImage(
          currentImage,
          0,
          0,
          currentImage.width,
          currentImage.height,
          currentPositionDelta.x,
          currentPositionDelta.y,
          canvasRef.current.width * currentScaleRate,
          canvasRef.current.height * currentScaleRate,
        );
        // 把大于阈值的白色区域都设置成透明的，以便让页面背景显示出来
        if (removeWhiteBackground) {
          const threshold = 200;
          const imageData = canvasContext.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (
              imageData.data[i] >= threshold &&
              imageData.data[i + 1] >= threshold &&
              imageData.data[i + 2] >= threshold
            ) {
              imageData.data[i + 3] = 0;
            }
          }
          canvasContext.putImageData(imageData, 0, 0);
        }

        if (!imgInit) {
          // 在第一次加载时，记录下我们对图片做了什么样的拉伸，方便对标记的坐标也做同样的拉伸
          const scale = {
            x: canvasRef.current.width / currentImage.width,
            y: canvasRef.current.height / currentImage.height,
          };
          setScale(scale);
          setImgInit(true);
        }
      }
    }
  }, [currentPic, canvasRef, currentPositionDelta]);
  return imgInit;
}