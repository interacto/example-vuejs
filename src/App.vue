<template>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Josefin+Sans">

  <div class="page">
    <div>
      <div class="preview" ref="preview">
        <p></p>
        <svg class="preview-canvas">
        </svg>
      </div>

      <div class="history">
        <div class="header">
          <h2>HISTORY</h2>
          <button class="button-undo-redo" ref="undoButton">UNDO</button>
          <button class="button-undo-redo" ref="redoButton">REDO</button>
        </div>

        <div class="buttons">
          <button class="history-button-active" ref="baseStateButton">Start</button>

          <div ref="undoButtonContainer">
            <button v-for="(undoable, index) in bindings.undoHistory.getUndo()" class="history-button-active" :key="index">{{undoable.getUndoName()}}</button>
          </div>

          <div ref="redoButtonContainer">
            <button v-for="(undoable, index) in bindings.undoHistory.getRedo()" class="history-button-inactive" :key="index">{{undoable.getUndoName()}}</button>
          </div>
        </div>
      </div>

      <div class="main">
        <h1>An Interacto-Vue.js app</h1>
        <Tabs>
          <Tab title="Type some text">
            <textarea ref="textArea" :value="dataService.txt"></textarea>
            <br/>
            <button class="clearTextButton" ref="clearTextButton">Clear text</button>
            <br/><br/>
          </Tab>

          <Tab title="Create and edit rectangles">
            <p>
                Multi-touch (two touches) creates a rectangle.<br/>
                Three taps changes the color of the targeted rectangle.<br/>
                A long touch (2 seconds) removes the targeted rectangle.<br/>
                Swipe horizontally to clear all the SVG shapes.<br/>
            </p>
            <br/>

            <svg width="1000" height="600" style="border:1px solid black" ref="canvas">
            </svg>
          </Tab>

          <Tab title="Drag the cards">
            <div class="cards-block" ref="cards1">
              <div v-for="(card, index) in dataService.cards1" class="cards" :key=index>
                <div>
                  <div class="md-title">{{card.title}}</div>
                  <div class="md-subhead">{{card.subTitle}}</div>
                </div>
                <div>
                  <p>
                    {{card.text}}
                  </p>
                </div>
              </div>
            </div>

            <div class="cards-block" ref="cards2">
              <div v-for="(card, index) in dataService.cards2" class="cards" :key=index>
                <div>
                  <div class="md-title">{{card.title}}</div>
                  <div class="md-subhead">{{card.subTitle}}</div>
                </div>
                <div>
                  <p>
                    {{card.text}}
                  </p>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, Ref} from "vue";
import Tab from "@/components/Tab.vue";
import Tabs from "@/components/Tabs.vue";
import {BindingsImpl, Redo, Undo, TransferArrayItem} from "interacto";
import {ref} from 'vue';
import {ClearText} from "@/command/ClearText";
import {SetText} from "@/command/SetText";
import {HistoryBackToStart} from "@/command/HistoryBackToStart";
import {HistoryGoBack} from "@/command/HistoryGoBack";
import {HistoryGoForward} from "@/command/HistoryGoForward";
import {DeleteElt} from "@/command/DeleteElt";
import {ChangeColor} from "@/command/ChangeColor";
import {DrawRect} from "@/command/DrawRect";
import {MovePreview} from "@/command/MovePreview";
import {HidePreview} from "@/command/HidePreview";
import {DisplayPreview} from "@/command/DisplayPreview";

type MyCard = {
  title: string,
  subTitle: string,
  text: string
}

export type DataService = {
  txt: string,
  cards1: Array<MyCard>,
  cards2: Array<MyCard>,
};

let appData: DataService = {
  txt: "foo",
  cards1: [{
    title: 'card 1',
    subTitle: 'The card 1',
    text: 'Some text for card 1'
  },
    {
      title: 'card 2',
      subTitle: 'The card 2',
      text: 'Some text for card 2'
    }],
  cards2: [{
    title: 'card 3',
    subTitle: 'The card 3',
    text: 'Some text for card 3'
  }],
}

export default defineComponent ({
  components: {
    Tab,
    Tabs
  },

  setup() {
    let bindings = ref(new BindingsImpl());
    let dataService = ref(appData);

    let clearTextButton = ref(null);
    let textArea = ref(null);
    let undoButton = ref(null);
    let redoButton = ref(null);
    let undoButtonContainer: Ref<HTMLDivElement | undefined> = ref(undefined);
    let redoButtonContainer: Ref<HTMLDivElement | undefined> = ref(undefined);
    let baseStateButton = ref(null);
    let canvas = ref(null);
    let cards1 = ref(null);
    let cards2 = ref(null);
    let preview = ref<HTMLDivElement | undefined>(undefined);

    // For the card drag-and-drop
    let mementoX: string;
    let mementoY: string;
    let mementoCSSPosition: string;
    let card: HTMLElement;
    let sourceIndex: number;

    const setupBindings = () => {
      // This binder creates the command that allows the user to move a card from one list to another
      bindings.value.dndBinder(true)
          .on(window.document.body)
          .toProduce(() => {
            // The command is not executable until a proper target destination for the card has been selected by the user
            // The -1 index prevents makes canExecute() return false and prevents Interacto from executing the command
            return new TransferArrayItem(dataService.value.cards1, dataService.value.cards2, -1, 0, 'Drag card');
          })
          // Checks if the user picked a valid card, and a new list for the card as a destination
          .when(i => {
            // A valid card has to be selected in order to create the command
            const card = (i.src.target as Element).closest('.cards');
            return card !== null;
          })
          .first((c, i) => {
            card = (i.src.target as Element).closest('.cards') as HTMLElement;
            sourceIndex = Array.prototype.indexOf.call(card.parentNode!.children, card);
            // Saves the initial state of the card's style to be able to restore it if the command can't be executed
            mementoX = card.style.left;
            mementoY = card.style.top;
            mementoCSSPosition = card.style.position;
            // Edits the card's style to make it movable visually
            // console.log(card.clientWidth);
            card.style.width = String(card.clientWidth) + 'px';
            card.style.position = 'absolute';
            card.style.zIndex = '9999';
          })
          .then((c, i) => {
            // Retrieves the position of the mouse on the page (substract the sidebar size)
            let x = i.tgt.pageX - 220;
            let y = i.tgt.pageY;
            // Prevents parts of the card from going outside of the document
            if (i.tgt.pageX > window.innerWidth - card.clientWidth - 10) {
              x = x - card.clientWidth - 5;
            }
            if (i.tgt.pageY > window.innerHeight - card.clientHeight - 15) {
              y = y - card.clientHeight - 5;
            }

            // Moves the card visually
            card.style.left = String(x) + 'px';
            card.style.top = String(y) + 'px';

            // Checks if the target selected is valid for the current card and makes the command executable if it is
            const isCardPositionValid = (card.parentNode === cards1.value ?
                i.tgt.target === cards2.value : i.tgt.target === cards1.value);
            if (!isCardPositionValid) {
              c.srcIndex = -1;
              // console.log('not valid');

            } else {
              c.srcIndex = sourceIndex;

              // Defines which array is the source and which one is the target
              const fromSrcToTgt = i.tgt.target === cards2.value && i.src.target !== cards1.value;
              if (fromSrcToTgt) {
                c.srcArray = dataService.value.cards1;
                c.tgtArray = dataService.value.cards2;
              } else {
                c.srcArray = dataService.value.cards2;
                c.tgtArray = dataService.value.cards1;
              }
            }
          })
          // Resets the position of the card if the command is invalid or cancelled
          .ifCannotExecute(() => {
            card.style.left = mementoX;
            card.style.top = mementoY;
            card.style.position = mementoCSSPosition;
          })
          .cancel(() => {
            card.style.left = mementoX;
            card.style.top = mementoY;
            card.style.position = mementoCSSPosition;
          })
          .bind();

      bindings.value.buttonBinder()
          .on(clearTextButton.value!)
          .toProduce(() => new ClearText(dataService.value))
          .bind();

      bindings.value.textInputBinder()
          .on(textArea.value!)
          .toProduce(() => new SetText(dataService.value))
          .then((c, i) => c.text = (i.widget as HTMLInputElement).value)
          .bind();

      bindings.value.buttonBinder()
          .on(undoButton.value!)
          .toProduce(() => new Undo(bindings.value.undoHistory))
          .bind();

      bindings.value.buttonBinder()
          .on(redoButton.value!)
          .toProduce(() => new Redo(bindings.value.undoHistory))
          .bind();

      bindings.value.buttonBinder()
          .on(baseStateButton.value!)
          .toProduce(() => new HistoryBackToStart(bindings.value.undoHistory))
          .bind();

      bindings.value.buttonBinder()
          .onDynamic(undoButtonContainer.value!)
          .toProduce(i => new HistoryGoBack(Array.from(undoButtonContainer.value!.childNodes).indexOf(i.widget!) - 1, bindings.value.undoHistory))
          .bind();

      bindings.value.buttonBinder()
          .onDynamic(redoButtonContainer.value!)
          .toProduce(i => new HistoryGoForward(Array.from(redoButtonContainer.value!.childNodes).indexOf(i.widget!) - 1, bindings.value.undoHistory))
          .bind();

      bindings.value.tapBinder(3)
          .toProduce(i => new ChangeColor(i.taps[0].currentTarget  as SVGElement))
          .onDynamic(canvas.value!)
          .when(i => i.taps[0].currentTarget !== canvas.value
              && i.taps[0].currentTarget instanceof SVGElement)
          // Does not continue to run if the first targeted node is not an SVG element
          .strictStart()
          .bind();

      bindings.value.longTouchBinder(2000)
          .toProduce(i => new DeleteElt(canvas.value!, i.currentTarget  as SVGElement))
          .onDynamic(canvas.value!)
          .when(i => i.currentTarget !== canvas.value && i.currentTarget instanceof SVGElement)
          // Prevents the context menu to pop-up
          .preventDefault()
          // Consumes the events before the multi-touch interaction and co use them
          .stopImmediatePropagation()
          .bind();

      // Command previews

      // Displays command previews for undo buttons
      bindings.value.mouseoverBinder(false)
          .onDynamic(undoButtonContainer.value!)
          .toProduce(i => new DisplayPreview(
              //Array.from(undoButtonContainer.value!.childNodes).indexOf(i.widget!) - 1
              bindings.value.undoHistory.getUndo()[Array.from(undoButtonContainer.value!.childNodes).indexOf(i.target as HTMLButtonElement) - 1],
              preview.value!))
          .bind();

      // Displays command previews for redo buttons
      bindings.value.mouseoverBinder(false)
          .onDynamic(redoButtonContainer.value!)
          .toProduce(i => new DisplayPreview(
              bindings.value.undoHistory.getRedo()[
              bindings.value.undoHistory.getRedo().length
              - Array.from(redoButtonContainer.value!.childNodes).indexOf(i.target as HTMLButtonElement) - 1
              - 1],
              preview.value!))
          .bind();

      // Hides command previews for undo and redo buttons
      bindings.value.mouseoutBinder(false)
          .onDynamic(undoButtonContainer.value!)
          .onDynamic(redoButtonContainer.value!)
          .toProduce(() => new HidePreview(preview.value!))
          .bind();

      // Moves command previews to the mouse's position for undo and redo buttons
      bindings.value.mousemoveBinder()
          .onDynamic(undoButtonContainer.value!)
          .onDynamic(redoButtonContainer.value!)
          .toProduce(i => new MovePreview(preview.value!, i.pageX, i.pageY))
          .bind();
    }

    onMounted(() => {
      setupBindings();

      const drawrect = new DrawRect(canvas.value!);
      drawrect.setCoords(10, 10, 300, 300);
      drawrect.execute();

      preview.value!.style.display = 'none';
    });

    return {
      bindings,
      clearTextButton,
      textArea,
      undoButton,
      redoButton,
      undoButtonContainer,
      redoButtonContainer,
      baseStateButton,
      canvas,
      cards1,
      cards2,
      preview,
      dataService
    }
  }
})
</script>

<style>
.page {
  font-family: 'Josefin Sans', sans-serif;
}

h1 {
  text-align: center;
  min-height: 30px;
  width: calc(100vw - (220px));
}

.history {
  max-height:100vh;
  min-height:100vh;
  width: 200px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-x: hidden;
  background-color: #d6d6d6;
  border-right-style: solid;
  border-width: medium;
  overflow-y: auto;
}

.header {
  background-color: black;
  min-height: 75px;
  top: 0;
  left: 0;
  width: 100%;
  border-bottom-style: solid;
}

.header h2 {
  font-size: 25px;
  text-align: center;
  padding-top: 25px;
  padding-bottom: 25px;
  margin: 0;
  color: white;
}

.button-undo-redo{
  width: 50%;
  min-height: 40px;
  border-right-style: solid;
  border-left-style: solid;
  color: black;
  background-color: white;
  border-width: thin;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 20px;
}

.history-button-active{
  width: 100%;
  min-height: 35px;
  border-right-style: none;
  border-left-style: none;
  color: black;
  background-color: white;
  border-width: thin;
  font-family: 'Josefin Sans', sans-serif;
}

.history-button-inactive{
  width: 100%;
  min-height: 35px;

  border-right-style: none;
  border-left-style: none;
  color: lightgray;
  background-color: gray;
  border-width: thin;
  font-family: 'Josefin Sans', sans-serif;
}

.header button:disabled {
  width: 50%;
  min-height: 40px;
  border-right-style: solid;
  border-left-style: solid;
  color: black;
  background-color: lightgray;
  border-width: thin;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 20px;
}

.main {
  position: absolute;
  left: 220px;
  top: 0;
  bottom: 0;
  right: 20px;
}

.main button {
  min-height: 35px;
  color: black;
  background-color: white;
  font-family: 'Josefin Sans', sans-serif;
}

.cards {
  width: 33%;
  border: 1px solid rgba(0,0,0,.03);
  display: inline-block;
  max-width: 100%;
  margin: 4px;
  background-color: white;
  font-family: 'Josefin Sans', sans-serif;
  color: black;

  /* Makes the text on cards unselectable */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.cards-block {
  min-width: 33%;
  min-height: 50px;
  box-shadow: 0 2px 2px rgba(0,0,0,.24),0 0 2px rgba(0,0,0,.12);
  margin: 20px;
  width: 33%;
  background-color: #d6d6d6;
}

.preview {
  min-height: 30px;
  min-width: 100px;
  background-color: white;
  position: absolute;
  z-index: 999;
  padding: 10px;
  border-style: solid;
  border-width: medium;
}

.preview-canvas {
  height: 70px;
  width: 70px;
}

</style>
