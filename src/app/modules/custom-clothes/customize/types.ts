import { fabric } from 'fabric';

export type TFabricObject = fabric.Object &
  fabric.Textbox &
  fabric.Polyline &
  fabric.Image &
  fabric.Circle &
  fabric.Group & {
    id: string;
    idRelated: string;
    isControl: string;
    position: string;
    sides: number;
    diameter: number;
    flipped: boolean;
    initialAngle: number;
    initialScale: number;
    clipName: string;
    pseudoCharSpacing: number;
    idDesign: string;
    radio: number;
    clipFor: string;
    isBorderAux: boolean;
    filters: TFabricFilter[];
    _objects: TFabricObject[];
    shadow: fabric.Shadow;
    fill: string;
  };

type TFabricFilter = fabric.IBaseFilter & fabric.IBlendColorFilter;

export type TFabricCanvas = Omit<fabric.Canvas, '_objects'> & {
  _objects: TFabricObject[];
};

export type TControlAndObject = {
  selected: TFabricObject;
  controlled: TFabricObject;
};

export type TTextSelectionEvent = {
  element: TFabricObject;
  maxWidth?: number;
};

export type TCanvas = {
  version: string;
  objects: TFabricObject[];
  heightArea?: number;
  widthArea?: number;
};

export type TUpdateCanvas = {
  index: number;
  canvas?: TCanvas;
  heightArea?: number;
  widthArea?: number;
};
