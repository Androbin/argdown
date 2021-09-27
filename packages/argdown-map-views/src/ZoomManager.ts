import { IMapState, defaultMapState } from "./IMapState";
import { zoom, ZoomBehavior, zoomIdentity } from "d3-zoom";
import { Selection } from "d3-selection";
import defaultsDeep from "lodash.defaultsdeep";

export type OnZoomChangedHandler = (data: {
  size: { width: number; height: number };
  scale: number;
  position: { x: number; y: number };
}) => void;
export class ZoomManager {
  zoom?: ZoomBehavior<SVGSVGElement, {}>;
  svg?: Selection<SVGSVGElement, {}, null | HTMLElement, any>;
  svgGraph?: Selection<SVGGraphicsElement, {}, null | HTMLElement, any>;
  state: IMapState;
  moveToDuration: number;
  onZoomChanged?: OnZoomChangedHandler;
  graphIsBottomAligned: boolean;
  constructor(
    onZoomChanged?: OnZoomChangedHandler,
    graphIsBottomAligned: boolean = false,
    moveToDuration: number = 0.4
  ) {
    this.state = defaultsDeep({}, defaultMapState);
    this.onZoomChanged = onZoomChanged;
    this.moveToDuration = moveToDuration;
    this.graphIsBottomAligned = graphIsBottomAligned;
  }
  init(
    svg: Selection<SVGSVGElement, any, null | HTMLElement, any>,
    svgGraph: Selection<SVGGraphicsElement, any, null | HTMLElement, any>,
    width: number,
    height: number
  ) {
    this.state.size.width = width;
    this.state.size.height = height;

    this.svg = svg;
    this.svgGraph = svgGraph;
    const self = this;
    this.zoom = zoom<SVGSVGElement, {}>().on("zoom", function(event) {
      // eslint-disable-next-line
      self.svgGraph!.attr("transform", event.transform);
      self.state.scale = event.transform.k;
      self.state.position.x = event.transform.x;
      self.state.position.y = event.transform.y;
      if (self.onZoomChanged) {
        self.onZoomChanged({
          scale: self.state.scale,
          position: self.state.position,
          size: self.state.size
        });
      }
    });
    this.svg!.call(this.zoom! as any).on("dblclick.zoom", null);
  }
  showAllAndCenterMap() {
    if (!this.svg) {
      return;
    }
    let positionInfo = this.svg.node()!.getBoundingClientRect();
    const xScale = positionInfo.width / this.state.size.width;
    const yScale = positionInfo.height / this.state.size.height;
    const scale = Math.min(xScale, yScale);
    const x = (positionInfo.width - this.state.size.width * scale) / 2;
    const scaledHeight = this.state.size.height * scale;
    let y = (positionInfo.height - scaledHeight) / 2;
    if (this.graphIsBottomAligned) {
      y += scaledHeight;
    }
    this.setZoom(x, y, scale, 0);
  }
  resetZoom() {
    this.setZoom(
      this.state.position.x,
      this.state.position.y,
      this.state.scale,
      0
    );
  }
  moveTo(x: number, y: number) {
    this.setZoom(x, y, this.state.scale, this.moveToDuration);
  }
  moveToElement(element: SVGGraphicsElement) {
    let positionInfo = this.svg!.node()!.getBoundingClientRect();
    const point = convertCoordsL2L(
      this.svg!.node()!,
      element!,
      this.svgGraph!.node()!
    );
    let x = -point.x * this.state.scale + positionInfo.width / 2;
    let y = -point.y * this.state.scale + positionInfo.height / 2;

    this.moveTo(x, y);
  }
  setZoom = (x: number, y: number, scale: number, duration: number) => {
    if (!this.svg || !this.zoom) {
      return;
    }
    const self = this;
    this.svg
      .transition()
      .duration(duration)
      .call(
        (self.zoom! as any).transform,
        // eslint-disable-next-line
        zoomIdentity.translate(x, y).scale(scale)
      );
  };
}
export const convertCoordsL2L = (
  svg: SVGSVGElement,
  fromElem: SVGGraphicsElement,
  toElem: SVGGraphicsElement
) => {
  const matrixL2G = fromElem.getCTM()!;
  const matrixG2L = toElem.getCTM()!.inverse();
  const bBox = fromElem.getBBox();
  const point = svg.createSVGPoint();
  point.x = bBox.x + bBox.width / 2;
  point.y = bBox.y + bBox.height / 2;
  return point.matrixTransform(matrixL2G).matrixTransform(matrixG2L);
};
