import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  IGroupMapNode,
  StatementSelectionMode,
  DataPlugin,
  PreselectionPlugin,
  ArgumentSelectionPlugin,
  StatementSelectionPlugin,
  GroupPlugin,
  ColorPlugin,
  ArgdownTypes
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
const colorPlugin = new ColorPlugin();
app.addPlugin(colorPlugin, "build-model");

const preselectionPlugin = new PreselectionPlugin();
app.addPlugin(preselectionPlugin, "build-map");
const statementSelectionPlugin = new StatementSelectionPlugin({ statementSelectionMode: StatementSelectionMode.ALL });
app.addPlugin(statementSelectionPlugin, "build-map");
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
app.addPlugin(argumentSelectionPlugin, "build-map");
const mapPlugin = new MapPlugin();
app.addPlugin(mapPlugin, "build-map");
const groupPlugin = new GroupPlugin();
app.addPlugin(groupPlugin, "build-map");

describe("GroupPlugin", function() {
  it("can create groups from sections", function() {
    let source = `
# Section 1
  
  [A]: text
    + <B>
  
## Section 2
  
  <B>: some more text
    - <C>

  [A]: A different text
  
### Section 3
  
  <C>: text

  <B>: Some different text
  
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source
    });
    expect(result.map!.nodes.length).to.equal(2);
    expect(result.map!.nodes[0].title).to.equal("A");
    expect(result.map!.nodes[1].title).to.equal("Section 2");
    expect(result.map!.edges.length).to.equal(2);

    let section2 = <IGroupMapNode>result.map!.nodes[1];
    expect(section2.children!.length).to.equal(2);
    expect(section2.children![0].title).to.equal("B");

    let section3 = <IGroupMapNode>section2.children![1];
    expect(section3.title).to.equal("Section 3");
    expect(section3.children!.length).to.equal(1);
    expect(section3.children![0].title).to.equal("C");
  });
  it("can create groups with only other groups as children", function() {
    let source = `
# Section 1

## Section 2

### Section 3

<A>: text
      - <B>: text
  
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      selection: { statementSelectionMode: StatementSelectionMode.ALL }
    });

    expect(result.map!.nodes.length).to.equal(1);
    expect(result.map!.nodes[0].title).to.equal("Section 2");

    let section2 = <IGroupMapNode>result.map!.nodes[0];
    expect(section2.children!.length).to.equal(1);
    expect(section2.children![0].title).to.equal("Section 3");

    let section3 = <IGroupMapNode>section2.children![0];
    expect(section3.title).to.equal("Section 3");
    expect(section3.children!.length).to.equal(2);
    expect(section3.children![0].title).to.equal("A");
    expect(section3.children![1].title).to.equal("B");
  });
  it("puts argument into the group of its first definition", function() {
    let source = `
# h1

<a>: definition of a
    - [p]

<b>: definition of b

## h2

<a>
    + <b>

<b>

(1) s1
(2) s2
-----
(3) s3

<c>
    + <a>: another definition of a

### h3

<c>

[p]: definition of p  
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source
    });
    // console.log(toJSON(result.map!.nodes, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.map!.nodes.length).to.equal(3);
    expect(result.map!.nodes[0].title).to.equal("a");
    expect(result.map!.nodes[1].title).to.equal("h2");
    expect(result.map!.nodes[2].title).to.equal("c");
  });
  it("ignores sections with isGroup === false", function() {
    let source = `
# h1

[p]: text

## h2 {isGroup: false}

[p]
    - <a>: text

## h3 {isGroup: true}

[p]
    - <b>: text

  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      group: { groupDepth: 1 }
    });
    //console.log(toJSON(result.map!.nodes, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);
    expect(result.sections![0].children[0].isGroup).to.be.false;
    expect(result.arguments!["a"].section).to.be.undefined;

    expect(result.map!.nodes.length).to.equal(3);
    expect(result.map!.nodes[0].title).to.equal("p");
    expect(result.map!.nodes[1].title).to.equal("h3");
    expect(result.map!.nodes[2].title).to.equal("a");
    expect((<IGroupMapNode>result.map!.nodes[1]).children!.length).to.equal(1);
    expect((<IGroupMapNode>result.map!.nodes[1]).children![0].title).to.equal("b");
  });
  it("can use a custom color scheme for groups", function() {
    let source = `
    ===
    color:
        colorScheme: colorbrewer-set2
        groupColorScheme:
            - "#fff2ae"
            - "#f4cae4"
            - "#b3e2cd"
    selection:
        excludeDisconnected: false
    group:
        groupDepth: 3
    ===
    
    # H1
    
    <a>: #tag-1
    
    ## H2
    
    <b>: #tag-2 #tag-1
    
    ### H3
    
    [c]: #tag-3
    
    <b>: #tag-3
    `;
    const request = { process: ["parse-input", "build-model", "build-map"], input: source };
    const response = app.run(request);
    expect(response.map!.nodes![0].color).to.equal("#fff2ae");
    const group2 = <IGroupMapNode>(<IGroupMapNode>response.map!.nodes![0]).children![1];
    expect(group2.type).to.equal(ArgdownTypes.GROUP_MAP_NODE);
    expect(group2.color).to.equal("#f4cae4");
    const group3 = <IGroupMapNode>group2.children![1];
    expect(group3.type).to.equal(ArgdownTypes.GROUP_MAP_NODE);
    expect(group3.color).to.equal("#b3e2cd");
  });
});
