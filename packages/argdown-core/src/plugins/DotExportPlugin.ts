import * as _ from "lodash";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { RelationType, ArgdownTypes, IMapNode, IGroupMapNode } from "../model/model";
import { IArgdownRequest, IArgdownResponse } from "../index";
import { validateColorString } from "../utils";

export interface IDotSettings {
  useHtmlLabels?: boolean;
  graphname?: string;
  lineLength?: number;
  graphVizSettings?: { [name: string]: string };
  colorNodesByTag?: boolean;
  argumentFontColor?: string;
  statementFontColor?: string;
  groupFontColor?: string;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[DotExportPlugin]]
     */
    dot?: IDotSettings;
  }
  interface IArgdownResponse {
    /**
     * Exported dot version of argument map
     *
     * Provided by the [[DotExportPlugin]]
     */
    dot?: string;
    /**
     * Temporary counter for groups used by the [[DotExportPlugin]]
     */
    groupCount?: number;
  }
}
const defaultSettings: IDotSettings = {
  useHtmlLabels: true,
  graphname: "Argument Map",
  lineLength: 25,
  graphVizSettings: {
    rankdir: "BT", //BT | TB | LR | RL
    concentrate: "false",
    ratio: "auto",
    size: "10,10"
  },
  colorNodesByTag: true
};
/**
 * Exports map data to dot format.
 * The result ist stored in the [[IDotResponse.dot]] response object property.
 *
 * Depends on data from: [[MapPlugin]]
 */
export class DotExportPlugin implements IArgdownPlugin {
  name: string = "DotExportPlugin";
  defaults: IDotSettings;
  constructor(config?: IDotSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): IDotSettings {
    if (request.dot) {
      return request.dot;
    } else {
      request.dot = {};
      return request.dot;
    }
  }
  prepare: IRequestHandler = (request, response) => {
    if (!response.map) {
      throw new ArgdownPluginError(this.name, "No map property in response.");
    }
    if (!response.statements) {
      throw new ArgdownPluginError(this.name, "No statements property in response.");
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "No arguments property in response.");
    }
    if (!response.relations) {
      throw new ArgdownPluginError(this.name, "No relations property in response.");
    }
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
    if (request.color) {
      settings.statementFontColor = settings.statementFontColor || request.color.statementFontColor || "#000000";
      settings.argumentFontColor = settings.argumentFontColor || request.color.argumentFontColor || "#000000";
      settings.groupFontColor = settings.groupFontColor || request.color.groupFontColor || "#000000";
    } else {
      settings.statementFontColor = settings.statementFontColor || "#000000";
      settings.argumentFontColor = settings.argumentFontColor || "#000000";
    }
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);

    response.groupCount = 0;
    let dot = 'digraph "' + settings.graphname + '" {\n\n';
    if (settings.graphVizSettings) {
      const keys = Object.keys(settings.graphVizSettings);
      for (let key of keys) {
        const value = settings.graphVizSettings[key];
        dot += key + ' = "' + value + '";\n';
      }
    }

    for (let node of response.map!.nodes) {
      dot += this.exportNodesRecursive(node, response, settings);
    }

    dot += "\n\n";
    const edges = response.map!.edges;
    for (let edge of edges) {
      let attributes = `type="${edge.relationType}", `;
      switch (edge.relationType) {
        case RelationType.SUPPORT:
          attributes += `color="green"`;
          break;
        case RelationType.ENTAILS:
          attributes += `color="green"`;
          break;
        case RelationType.UNDERCUT:
          attributes += `color="purple"`;
          break;
        case RelationType.ATTACK:
          attributes += `color="red"`;
          break;
        case RelationType.CONTRARY:
          attributes += `color="red", dir="both"`;
          break;
        case RelationType.CONTRADICTORY:
          attributes += ` color="red", dir="both", arrowtail="diamond" arrowhead="diamond"`;
          break;
      }
      dot += `  ${edge.from.id} -> ${edge.to.id} [${attributes}];\n`;
    }
    dot += "\n}";

    response.dot = dot;
    return response;
  };
  exportNodesRecursive(node: IMapNode, response: IArgdownResponse, settings: IDotSettings): string {
    let dot = "";
    response.groupCount = response.groupCount === undefined ? 0 : response.groupCount;
    if (node.type === ArgdownTypes.GROUP_MAP_NODE) {
      const groupNode: IGroupMapNode = <IGroupMapNode>node;
      response.groupCount++;
      let dotGroupId = "cluster_" + response.groupCount;
      let groupLabel = node.labelTitle || "";
      if (settings.useHtmlLabels) {
        groupLabel = foldAndEscape(groupLabel, settings.lineLength || defaultSettings.lineLength!);
        groupLabel = `<<FONT FACE="Arial" POINT-SIZE="10" COLOR="${settings.groupFontColor}">${groupLabel}</FONT>>`;
      } else {
        groupLabel = '"' + escapeQuotesForDot(groupLabel) + '"';
      }
      let groupColor = node.color || "#CCCCCC";

      dot += "\nsubgraph " + dotGroupId + " {\n";
      dot += "  label = " + groupLabel + ";\n";
      dot += '  color = "' + groupColor + '";\n';
      dot += "  style = filled;\n";
      let labelloc = "t";
      if (settings.graphVizSettings && settings.graphVizSettings.rankdir == "BT") {
        labelloc = "b";
      }
      dot += ' labelloc = "' + labelloc + '";\n\n';
      if (groupNode.children) {
        for (let child of groupNode.children) {
          dot += this.exportNodesRecursive(child, response, settings);
        }
      }
      dot += "\n}\n\n";
      return dot;
    }

    let title = node.labelTitle || "";
    let text = node.labelText || "";
    let label = "";
    let color = node.color && validateColorString(node.color) ? node.color : "#63AEF2";
    let fontColor =
      node.type === ArgdownTypes.ARGUMENT_MAP_NODE ? settings.argumentFontColor : settings.statementFontColor;
    label = getLabel(title, text, fontColor!, settings);
    if (node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
      dot += `  ${node.id} [label=${label}, shape="box", style="filled,rounded", fillcolor="${color}", fontcolor="${
        settings.argumentFontColor
      }",  type="${node.type}"];\n`;
    } else if (node.type === ArgdownTypes.STATEMENT_MAP_NODE) {
      dot += `  ${
        node.id
      } [label=${label}, shape="box", style="filled,rounded,bold", color="${color}", fillcolor="white", labelfontcolor="white", fontcolor="${
        settings.statementFontColor
      }", type="${node.type}"];\n`;
    }
    return dot;
  }
}
const fold = (s: string, n: number, useSpaces: boolean, a?: string[]): string[] => {
  if (!s) return [];

  a = a || [];
  if (s.length <= n) {
    a.push(s);
    return a;
  }
  var line = s.substring(0, n);
  if (!useSpaces) {
    // insert newlines anywhere
    a.push(line);
    return fold(s.substring(n), n, useSpaces, a);
  } else {
    // attempt to insert newlines after whitespace
    var lastSpaceRgx = /\s(?!.*\s)/;
    var idx = line.search(lastSpaceRgx);
    var nextIdx = n;
    if (idx > 0) {
      line = line.substring(0, idx);
      nextIdx = idx;
    }
    a.push(line);
    return fold(s.substring(nextIdx), n, useSpaces, a);
  }
};
const foldAndEscape = (str: string, lineLength: number): string => {
  let strArray = fold(str, lineLength, true);
  for (let i = 0; i < strArray.length; i++) {
    strArray[i] = escapeForHtml(strArray[i]);
  }
  return strArray.join("<br/>");
};
const escapeForHtml = (s: string): string => {
  return s.replace(/[^0-9A-Za-z ]/g, function(c) {
    return "&#" + c.charCodeAt(0) + ";";
  });
};
const escapeQuotesForDot = (str: string): string => {
  return str.replace(/\"/g, '\\"');
};
const getLabel = (title: string, text: string, color: string, settings: IDotSettings): string => {
  let label = "";
  if (settings.useHtmlLabels) {
    label += `<<FONT FACE="Arial" POINT-SIZE="8" COLOR="${color}"><TABLE BORDER="0" CELLSPACING="0">`;
    if (!_.isEmpty(title)) {
      let titleLabel = foldAndEscape(title, settings.lineLength || defaultSettings.lineLength!);
      titleLabel = `<TR><TD ALIGN="center"><B>${titleLabel}</B></TD></TR>`;
      label += titleLabel;
    }
    if (!_.isEmpty(text)) {
      let textLabel = foldAndEscape(text, settings.lineLength || defaultSettings.lineLength!);
      textLabel = `<TR><TD ALIGN="center">${textLabel}</TD></TR>`;
      label += textLabel;
    }
    label += "</TABLE></FONT>>";
  } else {
    label = '"' + escapeQuotesForDot(title) + '"';
  }
  return label;
};
