import logo from "./logo.svg";
import styles from "./App.module.css";

//import { createState, onMount } from "solid-js";
import { onMount, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

//import { Tab, TabContainer, Tabs } from "solid-blocks";
import { Tab, TabContainer, Tabs } from "./solid-blocks";
//import { GridResizer } from './solid-blocks/src/splitter.jsx';
//import { SplitY, SplitX } from './solid-blocks/src/splitter.jsx';
import { LayoutRow, LayoutColumn, LayoutItem } from './solidjs-splitter-component';
import { glob as globalStyle } from "solid-styled-components";


//import TreeView from "solidjs-treeview-component";
import FolderView from "./solidjs-folderview-component";
//import SyntaxTreeView from "./solidjs-syntaxtreeview-component";
import CodeMirror from "./solidjs-codemirror-component";

//import MonacoEditor from "./solidjs-monaco-editor-component";
//import TreeSitter from "./solidjs-treesitter-component";
//import MonacoEditorTreeSitter from "./solidjs-monaco-editor-tree-sitter-component";
import MonacoEditorLezerParser from "./solidjs-monaco-editor-lezer-parser-component";


const backendUrl = 'http://localhost:8080';




// TODO better way to define style?
// we need `node.classList.toggle('expand')`
// but we dont care about the exact class name
var className = 'linux-find';
globalStyle(`
  .${className}.tree-view.root { margin-left: 1px; margin-right: 1px; }
  .${className}.tree-view.root { height: 100%; /* fit to container */; overflow: auto; /* scroll on demand */ }
  .${className}.tree-view { text-align: left; }
  .${className}.tree-view ul,
  .${className}.tree-view { list-style: none; padding: 0; }
  .${className}.tree-view li { white-space: pre; /* dont wrap on x overflow. TODO fix width on overflow */ }
  .${className}.tree-view li.branch > div { color: blue; font-family: monospace; }
  .${className}.tree-view li.branch > ul { display: none; /* default collapsed */ }
  .${className}.tree-view li.branch.expanded { outline: solid 1px grey; }
  .${className}.tree-view li.branch.expanded > ul { display: block; }
  .${className}.tree-view li.empty { font-style: italic; }
  .${className}.tree-view div.link-source { color: green; font-family: monospace; }
  .${className}.tree-view div.file { font-family: monospace; }
  /* .${className}.tree-view div.parentPath { opacity: 0.6; } */ /* this looks worse than expected */
`);

var className = 'file-tree';
globalStyle(`
  .${className}.tree-view.root { margin-left: 1px; margin-right: 1px; }
  .${className}.tree-view.root { height: 100%; /* fit to container */; overflow: auto; /* scroll on demand */ }
  .${className}.tree-view { text-align: left; }
  .${className}.tree-view ul,
  .${className}.tree-view { list-style: none; padding: 0; }
  .${className}.tree-view ul { padding-left: 0.5em; margin-left: 0.5em; border-left: solid 1px grey; }
  .${className}.tree-view li { white-space: pre; /* dont wrap on x overflow. TODO fix width on overflow */ }
  .${className}.tree-view li.branch > div { color: blue; font-family: monospace; }
  .${className}.tree-view li.branch > ul { display: none; /* default collapsed */ }
  .${className}.tree-view li.branch.expanded {  }
  .${className}.tree-view li.branch.expanded > ul { display: block; }
  .${className}.tree-view li.empty { font-style: italic; }
  .${className}.tree-view div.link-source { color: green; font-family: monospace; }
  .${className}.tree-view div.file { font-family: monospace; }
`);




export default function App() {

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  const [store, setStore] = createStore({
    options: [],
    config: null, // syntax tree, parsed by tree-sitter-nix
    fileSelected: '',
  });

  onMount(() => {
    loadOptions();
    loadConfig();
  });



  async function loadConfig() {
    if (store.config) {
      console.log(`loadConfig: already loaded`);
      return;
    }
    console.log(`loadConfig: fetch`)

    // get source code
    var url = new URL(`${backendUrl}/readconfig`);
    var response = await fetch(url);
    //if (!response.ok) { console.log(`http request error ${response.status}`); return; }
    var responseData = await response.text();
    console.log("loadConfig: responseData 1, first 200 bytes:");
    console.log(responseData.slice(0, 200));
    setStore('configText', responseData);
    //console.log("loadConfig: set store done 1");

    /* now parsed in browser
    // get syntax tree
    var url = new URL(`${backendUrl}/parseconfig`);
    var response = await fetch(url);
    //if (!response.ok) { console.log(`http request error ${response.status}`); return; }
    var responseData = await response.json();
    console.log("loadConfig: responseData 2", responseData);
    // set store.config
    setStore('config', responseData);
    console.log("loadConfig: set store done 2");
    */
  }



  const startPath = ['options'];
  const pathSeparator = '.';

  async function loadOptions(node = null, parentPath = [], get = null) {
    parentPath = parentPath ? [...startPath, ...parentPath] : startPath;
    console.log(`parentPath = ${parentPath.join(pathSeparator)}`)
    //const path = (node && get) ? get.path(node, parentPath) : '';
    //const path = node ? get.path(node, parentPath) : startPath;
    //const path = (node && get) ? get.path(node, parentPath) : parentPath;
    const path = (node && get) ? [...parentPath, get.name(node)] : parentPath;
    console.log(`loadOptions: node ${JSON.stringify(node)} parentPath ${JSON.stringify(parentPath)} path ${path.join(pathSeparator)}`)

    const childNodesKey = 'children';
    function createNode(depth, type, name, children) {
      return { depth, name, children: [] };
    }

    // init store
    if (!store.options) {
      const storePath = ['options'];
      for (const [depth, name] of parentPath.entries()) {
        storePath.push(0); // first node in store.options
        const node = createNode(depth, 'd', name, []);
        setStore(...storePath, node);
        storePath.push(childNodesKey); // add next node to the children array of current node
      }
    }

    const storePath = ['options'];
    let parentDir = store.options;
    console.log('loadOptions: parentDir 1: ', JSON.parse(JSON.stringify(parentDir)));
    console.log(`loadOptions: build storePath. parentPath ${parentPath}. path ${path.join(pathSeparator)}`);
    //path.split(pathSeparator).filter(Boolean).forEach((partName, partDepth) => {
    //path.split(pathSeparator).filter(Boolean).forEach((partName, partDepth) => {
    for (const [partDepth, partName] of path.entries()) {
      console.log(`loadOptions: parentDir 2 depth ${partDepth}: `, JSON.parse(JSON.stringify(parentDir)));
      const i = parentDir.findIndex(({ type, name }) => (type == 'd' && name == partName));
      console.log(`loadOptions: build storePath. depth ${partDepth}`, { parentDir: JSON.parse(JSON.stringify(parentDir)), i, partName });
      if (i == -1) {
        console.log(`error: not found parent for partName ${partName} -> root folder?`)
        continue
      }
      // TODO simplify? why store depth? why not just fileTree?
      storePath.push(i);
      parentDir = parentDir[i];
      console.log(`loadOptions: parentDir 3 depth ${partDepth}: `, JSON.parse(JSON.stringify(parentDir)));

      storePath.push(childNodesKey);
      parentDir = parentDir[childNodesKey];
      console.log(`loadOptions: parentDir 4 depth ${partDepth}: `, JSON.parse(JSON.stringify(parentDir)));
    }

    //console.dir({ parentPath, storePath, val: store(...storePath) })
    //console.dir({ parentPath, storePath, parentDir })

    if (parentDir != store.options && parentDir.length > 0) {
      console.log(`loadOptions: already loaded path ${path.join(pathSeparator)}`);
      return; // already loaded
    };


    console.log(`loadOptions: fetch path ${path.join(pathSeparator)}`)

    // load files from API server
    //const path = 'options'; // TODO
    const data = { q: `builtins.toJSON (builtins.attrNames ${path.join(pathSeparator)})` };
    const url = new URL(`${backendUrl}/repl`);
    for (let k in data) {
      url.searchParams.append(k, data[k]);
    }

    console.log("loadOptions: url", String(url));
    const response = await fetch(url);
    //if (!response.ok) { console.log(`http request error ${response.status}`); return; }
    const responseData = { files: await response.json() };
    console.log("loadOptions: responseData.files", responseData.files);
    const depth = storePath.length - 1;
    responseData.files = responseData.files.map(name => {
      //return [ depth, 'd', name, [] ];
      return { depth, type: 'd', name, children: [] };
    });

    /*
    // mock the server response
    await sleep(500); // loading ...
    const depth = path.split(pathSeparator).filter(Boolean).length;
    console.log(`loadOptions path = /${path} + depth = ${depth} + parentPath = ${parentPath}`);
    const responseData = {
      files: Array.from({ length: 5 }).map((_, idx) => {
        const typeList = 'dddfl'; // dir, file, link
        const type = typeList[Math.round(Math.random() * (typeList.length - 1))];
        if (type == 'd') return [ depth, type, `dirr-${depth}-${idx}`, [] ];
        if (type == 'f') return [ depth, type, `file-${depth}-${idx}` ];
        if (type == 'l') return [ depth, type, `link-${depth}-${idx}`, `link-target-${depth}-${idx}` ];
      }),
    }
    */

     console.log(`storePath: ${storePath.join(' -> ')}`);

    // add new files to the app store
    if (!store.options || store.options.length == 0)
      setStore('options', responseData.files); // init
    else {
      //console.log(`add files for path ${path.join(pathSeparator)}`)
      setStore(...storePath, responseData.files);
    }
  }



  /* obscure array format

  function optionsGetters() {
    const get = {};
    get.isLeaf = node => (node[1] != 'd');
    get.name = node => node ? node[2] : '';
    get.path = (node, parentPath) => parentPath ? `${parentPath}${pathSeparator}${get.name(node)}` : get.name(node);
    get.childNodes = node => {
      //console.log('get.childNodes. node:', node)
      return node[3];
    };
    const fancyPath = (node, parentPath) => (
      parentPath ? <>
        <div class="parentPath">{(() => parentPath)()}{pathSeparator}</div>
        <div class="name">{get.name(node)}</div>
      </> : get.name(node)
    );
    get.branchLabel = fancyPath;
    get.emptyLabel = (parentPath) => '( empty )';
    const isLink = node => (node[1] == 'l');
    const linkTarget = node => node[3];
    get.leafLabel = (node, parentPath) => {
      if (isLink(node))
        return <>
          <div class="link-source">{fancyPath(node, parentPath)}</div>{" -> "}
          <div class="link-target">{linkTarget(node)}</div>
        </>;
      return <div class="file" onClick={() => setStore('fileSelected', get.path(node, parentPath))}>{fancyPath(node, parentPath)}</div>;
    };
    return get;
  }

  function fileTreeGetters() {
    const get = optionsGetters();
    const simplePath = (node, parentPath) => (
        <div class="name">{get.name(node)}</div>
    );
    get.branchLabel = simplePath;
    get.branchLabel = simplePath;
    const isLink = node => (node[1] == 'l');
    const linkTarget = node => node[3];
    get.leafLabel = (node, parentPath) => {
      if (isLink(node))
        return <>
          <div class="link-source">{simplePath(node, parentPath)}</div>{" -> "}
          <div class="link-target">{linkTarget(node)}</div>
        </>;
      return <div class="file" onClick={() => setStore('fileSelected', get.path(node, parentPath))}>{simplePath(node, parentPath)}</div>;
    };
    return get;
  }
  */



  


  // verbose object format
  function configGetters() {
    const get = {};
    get.isLeaf = node => (node.type != 'set');
    get.name = node => node ? node.text.slice(0, 10) : '';
    get.path = (node, parentPath) => parentPath ? [...parentPath, get.name(node)] : [get.name(node)];
    get.childNodes = node => node.children;
    const fancyPath = (node, parentPath) => (
      parentPath ? <>
        <div class="parentPath">{(() => parentPath.join(pathSeparator))()}{pathSeparator}</div>
        <div class="name">{get.name(node)}</div>
      </> : get.name(node)
    );
    get.branchLabel = fancyPath;
    get.emptyLabel = (parentPath) => '( empty )';
    get.leafLabel = (node, parentPath) => {
      return <div class="file" onClick={() => setStore('fileSelected', get.path(node, parentPath))}>{fancyPath(node, parentPath)}</div>;
    };
    return get;
  }








  // verbose object format
  function optionsGetters() {
    const get = {};
    get.isLeaf = node => (node.type != 'd');
    get.name = node => node ? node.name : '';
    get.path = (node, parentPath) => parentPath ? [...parentPath, get.name(node)] : [get.name(node)];
    get.childNodes = node => node.children;
    const fancyPath = (node, parentPath) => (
      parentPath ? <>
        <div class="parentPath">{(() => parentPath.join(pathSeparator))()}{pathSeparator}</div>
        <div class="name">{get.name(node)}</div>
      </> : get.name(node)
    );
    get.branchLabel = fancyPath;
    get.emptyLabel = (parentPath) => '( empty )';
    const isLink = node => (node.type == 'l');
    const linkTarget = node => node.target;
    get.leafLabel = (node, parentPath) => {
      if (isLink(node))
        return <>
          <div class="link-source">{fancyPath(node, parentPath)}</div>{" -> "}
          <div class="link-target">{linkTarget(node)}</div>
        </>;
      return <div class="file" onClick={() => setStore('fileSelected', get.path(node, parentPath))}>{fancyPath(node, parentPath)}</div>;
    };
    return get;
  }

  function fileTreeGetters() {
    const get = optionsGetters();
    const simplePath = (node, parentPath) => (
        <div class="name">{get.name(node)}</div>
    );
    get.branchLabel = simplePath;
    get.branchLabel = simplePath;
    const isLink = node => (node.type == 'l');
    const linkTarget = node => node.target;
    get.leafLabel = (node, parentPath) => {
      if (isLink(node))
        return <>
          <div class="link-source">{simplePath(node, parentPath)}</div>{" -> "}
          <div class="link-target">{linkTarget(node)}</div>
        </>;
      return <div class="file" onClick={() => setStore('fileSelected', get.path(node, parentPath))}>{simplePath(node, parentPath)}</div>;
    };
    return get;
  }

  function optionsFilter() {
    //return node => (node[2][0] != '.'); // hide dotfiles
    return node => (node.name[0] != '.'); // hide dotfiles
  }

  /*
        <h4>file tree, show only file names</h4>
      <div style="height: 8em">
      <TreeView
      data={store.options}
      get={fileTreeGetters()}
      filter={optionsFilter()}
      load={loadOptions}
      className="file-tree"
    />
  </div>
  <h4>directory listing, show full file path, similar to the linux command <code>find -printf '%P\\n'</code></h4>


    <div style="height: 20em">
      <TreeView
      data={store.options}
      get={optionsGetters()}
      filter={optionsFilter()}
      load={loadOptions}
      className="linux-find"
    />
  </div>

      <div style="height: 20em">
        <TreeView
          data={store.options}
          get={optionsGetters()}
          filter={optionsFilter()}
          load={loadOptions}
          className="linux-find"
        />
      </div>

      <div>click on a directory to load more files</div>
      <div>click on a file to select it. selected file: {store.fileSelected ? <code>{store.fileSelected}</code> : '( none )'}</div>

  */

  /*
    FIXME Uncaught (in promise) RangeError: Invalid array length
    FolderView
          data={store.config}

      <h3>config</h3>
     
      <div style="height: 20em">
        <SyntaxTreeView
          data={store.config}
          get={configGetters()}
          className="linux-find"
        />
      </div>

      <h3>options</h3>
      <div style="height: 20em">
        <FolderView
          data={store.options}
          get={optionsGetters()}
          filter={optionsFilter()}
          load={loadOptions}
          className="linux-find"
        />
      </div>



      <h3>TreeSitter</h3>
      <TreeSitter/>

      <h3>CodeMirror</h3>


    */

      //   <Tabs onchange={i => setEvents(e => `onchange(${i})\n${e}`)}>

/*
      <GridResizer
        ref={(el) => setHorizontalResizer(el)}
        isHorizontal={props.isHorizontal}
        direction="horizontal"
        class="row-start-1 row-end-3 col-start-2"
        onResize={changeLeft}
      />

      const [horizontalResizer, setHorizontalResizer] = createSignal();
      const [left, setLeft] = createSignal(1.25);

      const changeLeft = (clientX, _clientY) => {
        // Adjust the reading according to the width of the resizable panes
        const clientXAdjusted = clientX - horizontalResizer().offsetWidth / 2;
        const widthAdjusted = document.body.offsetWidth - horizontalResizer().offsetWidth;

        const percentage = clientXAdjusted / (widthAdjusted / 2);
        const percentageAdjusted = adjustPercentage(percentage, 0.5, 1.5);

        setLeft(percentageAdjusted);
      };
*/



/*

      <GridResizer
        ref={(el) => setVerticalResizer(el)}
        isHorizontal={props.isHorizontal}
        direction="vertical"
        class="row-start-3"
        onResize={changeTop}
      />

      const [verticalResizer, setVerticalResizer] = createSignal();

      const changeTop = (_clientX, clientY) => {
        // Adjust the reading according to the height of the resizable panes
        const headerSize = document.body.offsetHeight - grid().offsetHeight;
        const clientYAdjusted =
          clientY - headerSize - fileTabs().offsetHeight - verticalResizer().offsetHeight / 2;
        const heightAdjusted =
          document.body.offsetHeight -
          headerSize -
          fileTabs().offsetHeight -
          verticalResizer().offsetHeight -
          resultTabs().offsetHeight;
    
        const percentage = clientYAdjusted / (heightAdjusted / 2);
        const percentageAdjusted = adjustPercentage(percentage, 0.5, 1.5);
    
        setTop(percentageAdjusted);
      };
*/

/*
https://golden-layout.github.io/golden-layout/frameworks/
*/

// FIXME MonacoEditorTreeSitter is breaking the "non-live" resize of splitter
// -> disable event listeners of monaco-editor?
//        <div style={{"flex-basis": "20%"}}>

  //const [tree, setTree] = createSignal();
  const [state, setState] = createStore();

  return (
    <div style="height: 100vh">
      <LayoutRow>
        <LayoutItem size="20%">
          <Tabs>
            <Tab>tree</Tab>
            <TabContainer>
              <div style="height: 100%; overflow: auto">
                <Show when={state.tree && state.tree.rootNode} fallback={"no tree"}>
                  <TreeView node={state.tree.rootNode} depth={0} />
                </Show>
              </div>
            </TabContainer>

            <Tab>todo</Tab>
            <TabContainer>todo</TabContainer>
          </Tabs>
        </LayoutItem>
        <LayoutItem>
          <MonacoEditorLezerParser
            options={{
              //url: "http://localhost:3000/foo.js",
              // const model = () => mEditor.getModel(Uri.parse(finalProps.url));
              value: store.configText,
              //value: `if true then true else false`,
              language: `nix`,
              //onDocChange: (newValue) => console.dir({ newValue }),
              //isDark: true,

            }}
            withMinimap={false}
            isDark={true}
            setTree={(tree) => setState('tree', tree)}
          />
        </LayoutItem>
      </LayoutRow>
    </div>
  );
}


        /*
        <LayoutItem>
          <MonacoEditorTreeSitter
            options={{
              //url: "http://localhost:3000/foo.js",
              // const model = () => mEditor.getModel(Uri.parse(finalProps.url));
              value: store.configText,
              //value: `if true then true else false`,
              language: `nix`,
              //onDocChange: (newValue) => console.dir({ newValue }),
              //isDark: true,

            }}
            withMinimap={false}
            isDark={true}
            setTree={(tree) => setState('tree', tree)}
          />
        </LayoutItem>

        <LayoutItem>
          <CodeMirror
            options={{
              lineNumbers: true,
              showCursorWhenSelecting: true,
              //value: `if true then true else false`,
              // FIXME editor is empty after page reload,
              // but the correct value (configuration.nix)
              // is loaded after hot reload
              value: store.configText,
            }}
          />
        </LayoutItem>
        */


// {props.node.text} <span class="comment"># {props.node.type}</span>
function TreeView(props) {
  return (
    <Show when={props.node.type != 'comment'}>
      <Show
        when={props.node.children.length > 0}
        fallback={
          <div class="leaf-node" style="font-family: monospace">
            <Show
              when={props.node.type != props.node.text}
              fallback={<><Indent depth={props.depth}/> {props.node.type}</>}
            ><Indent depth={props.depth}/> {props.node.type}: {props.node.text}</Show>
          </div>
        }
      >
        <div class="branch-node" style="font-family: monospace">
          <Indent depth={props.depth}/> {props.node.type}
          <div>
            <For each={props.node.children}>{childNode => TreeView({ node: childNode, depth: props.depth + 1 })}</For>
          </div>
        </div>
      </Show>
    </Show>
  );
}

function Indent(props) {
  return <For each={Array.from({ length: 2*props.depth })}>{() => <span>&nbsp;</span>}</For>
}



/*

      */






/*
      <h2>nixos-config-webui</h2>

      <h3>MonacoEditorTreeSitter</h3>


      <h3>MonacoEditor</h3>
      <MonacoEditor
        options={{
          url: "http://localhost:3000/foo.js",
          // const model = () => mEditor.getModel(Uri.parse(finalProps.url));
          value: `if true then true else false`,
          language: `javascript`,
          disabled: false,
          //withMinimap: false,
          //onDocChange: (newValue) => console.dir({ newValue }),
          //isDark: true,

        }}
      >hello world</MonacoEditor>
function App() {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  );
}

export default App;
*/
