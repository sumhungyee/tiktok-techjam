import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

// Will be served via API later
import item1 from '../assets/Pleated Skirt mimi momo.png';
import item2 from '../assets/SHEIN EZwear Cartoon & Slogan Graphic Crop Tee.png';
import item3 from "../assets/SHEIN EZwear Women's Drawstring Side Asymmetrical Hem Summer Tube Top.png";
import item4 from "../assets/SHEIN MOD Ladies' Fashionable Asymmetrical Strap Ruffle Top, Light Yellow, Ideal For Summer Vacation.png";
import item5 from "../assets/SHEIN MOD Women's Floral Print Shirred Wide Strap Tank Top.png";

const FabricCanvas = () => {
    const [canvas, setCanvas] = useState();

    useEffect(() => {
        const c = new fabric.Canvas("canvas", {
          height: 932,
          width: 430,
          backgroundColor: "white",
        });
    
        //fabric.Object.prototype.cornerStyle = "rect";
    
        setCanvas(c);
        return () => {
          c.dispose();
        };
      }, []);

    const addTop = (canvas) => {
        const items = [item2, item3, item4, item5];
        const randomItem = items[Math.floor(Math.random() * items.length)];

        fabric.Image.fromURL(randomItem, (img) => {
            img.set({
              left: 70,
              top: 100,
              angle: 0,
              padding: 0,
              cornersize: 10,
              hasRotatingPoint: true,

                scaleX: 0.3,
                scaleY: 0.3,

            });
            canvas.add(img);
          });
    };

    const addBottom = (canvas) => {
        const items = [item1];
        const randomItem = items[Math.floor(Math.random() * items.length)];

        fabric.Image.fromURL(randomItem, (img) => {
            img.set({
              left: 70,
              top: 400,
              angle: 0,
              padding: 0,
              cornersize: 10,
              hasRotatingPoint: true,

                scaleX: 0.3,
                scaleY: 0.3,

            });
            canvas.add(img);
          });
    };

    const deleteSelected = (canvas) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
        }
    }


    return (
    <div>
      <button onClick={() => addTop(canvas)}>Random Top</button>
      <button onClick={() => addBottom(canvas)}>Random Bottom</button>
      <button onClick={() => deleteSelected(canvas)}>Delete Selected</button>

      <canvas id="canvas" />
    </div>
    );
};

export default FabricCanvas;