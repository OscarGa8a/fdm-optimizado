import { fabric } from 'fabric';
import 'fabric-customise-controls';

export default function runConfiguration() {
  (function (fabric) {
    /*
     * TextCurved object for fabric.js
     * @author Arjan Haverkamp (av01d)
     * @date January 2018
     */

    fabric.TextCurved = fabric.util.createClass(fabric.Object, {
      type: 'text-curved',
      diameter: 250,
      charSpacing: 0,
      text: '',
      flipped: false,
      fill: '#000',
      fontFamily: `'Arial'`,
      fontSize: 24, // in px
      fontWeight: 'normal',
      fontStyle: '', // "normal", "italic" or "oblique".
      cacheProperties: fabric.Object.prototype.cacheProperties.concat(
        'diameter',
        'charSpacing',
        'flipped',
        'centeredScaling',
        'lockScalingFlip',
        'fill',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'strokeStyle',
        'strokeWidth'
      ),
      strokeStyle: null,
      strokeWidth: 0,

      // initialize: function (text, options) {
      initialize(options: any) {
        options || (options = {});
        this.text = options.text;
        this.callSuper('initialize', options);
        this.set('lockUniScaling', true);
        this.set('centeredScaling', true);
        this.set('lockScalingFlip', true);

        // Draw curved text here initially too, while we need to know the width and height.
        const canvas = this.getCircularText();
        this._trimCanvas(canvas);
        this.set('width', canvas.width);
        this.set('height', canvas.height);
      },

      _getFontDeclaration() {
        return [
          // node-canvas needs "weight style", while browsers need "style weight"
          fabric.isLikelyNode ? this.fontWeight : this.fontStyle,
          fabric.isLikelyNode ? this.fontStyle : this.fontWeight,
          this.fontSize + 'px',
          fabric.isLikelyNode ? '"' + this.fontFamily + '"' : this.fontFamily,
        ].join(' ');
      },

      _trimCanvas(canvas: any) {
        var ctx = canvas.getContext('2d'),
          w = canvas.width,
          h = canvas.height,
          pix = { x: [], y: [] },
          n: any,
          imageData = ctx.getImageData(0, 0, w, h),
          fn = (a, b) => {
            return a - b;
          };

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (imageData.data[(y * w + x) * 4 + 3] > 0) {
              pix.x.push(x);
              pix.y.push(y);
            }
          }
        }
        pix.x.sort(fn);
        pix.y.sort(fn);
        n = pix.x.length - 1;

        w = pix.x[n] - pix.x[0];
        h = pix.y[n] - pix.y[0];
        const cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

        canvas.width = w;
        canvas.height = h;
        ctx.putImageData(cut, 0, 0);
      },

      // Source: http://jsfiddle.net/rbdszxjv/
      getCircularText() {
        var text = this.text,
          diameter = this.diameter,
          flipped = this.flipped,
          charSpacing = this.charSpacing,
          fill = this.fill,
          inwardFacing = true,
          startAngle = 0,
          canvas = fabric.util.createCanvasElement(),
          ctx = canvas.getContext('2d'),
          cw, // character-width
          x, // iterator
          clockwise = -1; // draw clockwise for aligned right. Else Anticlockwise'
        if (flipped) {
          startAngle = 180;
          inwardFacing = false;
        }

        startAngle *= Math.PI / 180; // convert to radians

        // Calc heigt of text in selected font:
        const d = document.createElement('div');
        d.style.fontFamily = this.fontFamily;
        d.style.whiteSpace = 'nowrap';
        d.style.fontSize = this.fontSize + 'px';
        d.style.fontWeight = this.fontWeight;
        d.style.fontStyle = this.fontStyle;
        d.textContent = text;
        document.body.appendChild(d);
        const textHeight = d.offsetHeight;
        document.body.removeChild(d);

        canvas.width = canvas.height = diameter;
        ctx.font = this._getFontDeclaration();

        // Reverse letters for center inward.
        if (inwardFacing) {
          text = text.split('').reverse().join('');
        }

        // Setup letters and positioning
        ctx.translate(diameter / 2, diameter / 2); // Move to center
        // @ts-ignore
        startAngle += Math.PI * !inwardFacing; // Rotate 180 if outward
        ctx.textBaseline = 'middle'; // Ensure we draw in exact center
        ctx.textAlign = 'center'; // Ensure we draw in exact center

        // rotate 50% of total angle for center alignment
        for (x = 0; x < text.length; x++) {
          cw = ctx.measureText(text[x]).width;
          startAngle +=
            ((cw + (x === text.length - 1 ? 0 : charSpacing)) /
              (diameter / 2 - textHeight) /
              2) *
            -clockwise;
        }

        // Phew... now rotate into final start position
        ctx.rotate(startAngle);

        // Now for the fun bit: draw, rotate, and repeat
        for (x = 0; x < text.length; x++) {
          cw = ctx.measureText(text[x]).width; // half letter
          // rotate half letter
          ctx.rotate((cw / 2 / (diameter / 2 - textHeight)) * clockwise);
          // draw the character at "top" or "bottom"
          // depending on inward or outward facing

          // Stroke
          if (this.strokeStyle && this.strokeWidth) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.strokeWidth;
            ctx.miterLimit = 2;
            ctx.strokeText(
              text[x],
              0,
              (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2)
            );
          }

          // Actual text
          ctx.fillStyle = fill;
          ctx.fillText(
            text[x],
            0,
            (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2)
          );

          ctx.rotate(
            ((cw / 2 + charSpacing) / (diameter / 2 - textHeight)) * clockwise
          ); // rotate half letter
        }
        return canvas;
      },

      _set(key: any, value: any) {
        switch (key) {
          case 'scaleX':
            this.fontSize *= value;
            this.diameter *= value;
            this.width *= value;
            this.scaleX = 1;
            if (this.width < 1) {
              this.width = 1;
            }
            break;

          case 'scaleY':
            this.height *= value;
            this.scaleY = 1;
            if (this.height < 1) {
              this.height = 1;
            }
            break;

          default:
            this.callSuper('_set', key, value);
            break;
        }
      },

      _render(ctx: any) {
        const canvas = this.getCircularText();
        this._trimCanvas(canvas);

        this.set('width', canvas.width);
        this.set('height', canvas.height);

        ctx.drawImage(
          canvas,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );

        this.setCoords();
      },

      toObject(propertiesToInclude: any) {
        return this.callSuper(
          'toObject',
          [
            'text',
            'diameter',
            'charSpacing',
            'flipped',
            'fill',
            'fontFamily',
            'fontSize',
            'fontWeight',
            'fontStyle',
            'strokeStyle',
            'strokeWidth',
            'styles',
          ].concat(propertiesToInclude)
        );
      },
    });

    fabric.TextCurved.fromObject = (object: any, callback: any, forceAsync: any) => {
      return fabric.Object._fromObject(
        'TextCurved',
        object,
        callback,
        forceAsync,
        'text-curved'
      );
    };
  })(typeof fabric !== 'undefined' ? fabric : require('fabric').fabric);

  // @ts-ignore
  fabric.util.makeBoundingBoxFromPoints = (points: any) => {
    // console.log('makeBoundigBoxFromPoints');
    const minX = fabric.util.array.min(points, 'x'),
      maxX = fabric.util.array.max(points, 'x'),
      width = Math.abs(minX - maxX),
      minY = fabric.util.array.min(points, 'y'),
      maxY = fabric.util.array.max(points, 'y'),
      height = Math.abs(minY - maxY);

    return {
      left: minX,
      top: minY,
      width: width,
      height: height,
    };
  };

  fabric.Polygon.prototype.getBoundingRect = function() {
    const matrix = this.calcTransformMatrix();
    // @ts-ignore
    let points = this.points;
    const offsetX = this.pathOffset.x;
    const offsetY = this.pathOffset.y;
    points = points.map((p: any) => {
      return fabric.util.transformPoint(
        // @ts-ignore
        { x: p.x - offsetX, y: p.y - offsetY },
        matrix
      );
    });
    // @ts-ignore
    return fabric.util.makeBoundingBoxFromPoints(points);
  };

  fabric.Triangle.prototype.getBoundingRect = function name() {
    const matrix = this.calcTransformMatrix();
    let points = [
      { x: -this.width / 2, y: this.height / 2 },
      { x: this.width / 2, y: this.height / 2 },
      { x: 0, y: -this.height / 2 },
      { x: 0, y: 0 },
    ];
    points = points.map((p) => {
      // @ts-ignore
      return fabric.util.transformPoint(p, matrix);
    });
    // @ts-ignore
    return fabric.util.makeBoundingBoxFromPoints(points);
  };

  fabric.Circle.prototype.getBoundingRect = function() {
    const matrix = this.calcTransformMatrix();
    let points = [
      { x: -this.width / 2, y: 0 },
      { x: this.width / 2, y: 0 },
      { x: 0, y: -this.height / 2 },
      { x: 0, y: this.height / 2 },
      { x: 0, y: -this.height / 2 },
      { x: 0.433 * this.width, y: this.height / 4 },
      { x: -0.433 * this.width, y: this.height / 4 },
      { y: 0.433 * this.height, x: this.width / 4 },
      { y: -0.433 * this.height, x: this.width / 4 },
      { y: -0.433 * this.height, x: -this.width / 4 },
      { y: 0.433 * this.height, x: -this.width / 4 },
      { x: 0.433 * this.width, y: -this.height / 4 },
      { x: -0.433 * this.width, y: -this.height / 4 },
    ];
    points = points.map((p) => {
      // @ts-ignore
      return fabric.util.transformPoint(p, matrix);
    });
    // @ts-ignore
    return fabric.util.makeBoundingBoxFromPoints(points);
  };
}
