<template>
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

<!--        <div ref={this.undoButtonContainer}>-->
<!--          {this.state.bindings.undoHistory.getUndo().map((elt, index) =>-->
<!--          <button className="history-button-active" key={index} ref={(ref) => this.undoButtons[index] = ref as HTMLButtonElement}>{elt.getUndoName()}</button>-->
<!--          )}-->
<!--        </div>-->

        <div ref="redoButtonContainer">
          {this.state.bindings.undoHistory.getRedo().slice().reverse().map((elt, index) =>
          <button class="history-button-inactive" key={index}>{elt.getUndoName()}</button>
          )}
        </div>
      </div>
    </div>

    <div class="main">
      <h1>An Interacto-React app</h1>
      <Tabs>
        <Tab title="Type some text">
          <textarea value={this.state.textFieldValue} onChange={this.onTextChange} ref="textArea"/>
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

          <svg width="1000" height="600" style="border:1px solid black" ref={this.canvas}>
          </svg>
        </Tab>

        <Tab title="Drag the cards">
<!--          <div class="cards-block" ref={this.cards1}>-->
<!--              {this.state.cards1.map(card =>-->
<!--                  <Card class="cards" key={card.title}>-->
<!--                      <div>-->
<!--                          <p>{card.title}</p>-->
<!--                          <p>{card.subTitle}</p>-->
<!--                      </div>-->
<!--                      <div>-->
<!--                          <p>-->
<!--                              {card.text}-->
<!--                          </p>-->
<!--                      </div>-->
<!--                  </Card>-->
<!--              )}-->
<!--          </div>-->

<!--          <div class="cards-block" ref={this.cards2}>-->
<!--              {this.state.cards2.map(card =>-->
<!--                  <Card class="cards" key={card.title}>-->
<!--                      <div>-->
<!--                          <p>{card.title}</p>-->
<!--                          <p>{card.subTitle}</p>-->
<!--                      </div>-->
<!--                      <div>-->
<!--                          <p>-->
<!--                              {card.text}-->
<!--                          </p>-->
<!--                      </div>-->
<!--                  </Card>-->
<!--              )}-->
<!--          </div>-->
        </Tab>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import {defineComponent, onMounted} from "vue";
import Tab from "@/components/Tab.vue";
import Tabs from "@/components/Tabs.vue";
import {BindingsImpl, Redo, Undo} from "interacto";
import {ref} from 'vue';
import {ClearText} from "@/command/ClearText";
import {SetText} from "@/command/SetText";
import {HistoryBackToStart} from "@/command/HistoryBackToStart";
import {HistoryGoBack} from "@/command/HistoryGoBack";
import {HistoryGoForward} from "@/command/HistoryGoForward";
import {DeleteElt} from "@/command/DeleteElt";
import {ChangeColor} from "@/command/ChangeColor";
import {DrawRect} from "@/command/DrawRect";

export default defineComponent ({
  components: {
    Tab,
    Tabs
  },
  setup() {
    let bindings = ref(new BindingsImpl());

    let clearTextButton = ref(null);
    let textArea = ref(null);
    let undoButton = ref(null);
    let redoButton = ref(null);
    let undoButtonContainer = ref(null);
    let redoButtonContainer = ref(null);
    let baseStateButton = ref(null);
    let canvas = ref(null);
    let cards1 = ref(null);
    let cards2 = ref(null);
    let preview = ref(null);
    // undoButtons: Array<HTMLButtonElement> = [];

    const setupBindings = () => {
      // bindings.value.buttonBinder()
      //     .on(this.clearTextButton.value!)
      //     .toProduce(() => new ClearText(this, 'txt' as keyof Readonly<{}>, 'textFieldValue' as keyof Readonly<{}>))
      //     .bind();
      //
      // bindings.value.textInputBinder()
      //     .on(this.textArea.value!)
      //     .toProduce(() => new SetText(this, 'txt' as keyof Readonly<{}>, 'textFieldValue' as keyof Readonly<{}>))
      //     .then((c, i) => c.text = (i.widget as HTMLInputElement).value)
      //     .end(() => this.forceUpdate())
      //     .bind();

      // bindings.value.buttonBinder()
      //     .on(undoButton.value!)
      //     .toProduce(() => new Undo(this.state.bindings.undoHistory))
      //     .bind();
      //
      // bindings.value.buttonBinder()
      //     .on(redoButton.value!)
      //     .toProduce(() => new Redo(bindings.value.undoHistory))
      //     .bind();

      // bindings.value.buttonBinder()
      //     .on(this.baseStateButton.value!)
      //     .toProduce(() => new HistoryBackToStart(this.state.bindings.undoHistory))
      //     .bind();

      // bindings.value.buttonBinder()
      //     .onDynamic(this.undoButtonContainer.value!)
      //     .toProduce(i => new HistoryGoBack(Array.from(undoButtonContainer.value!.childNodes).indexOf(i.widget!), this.state.bindings.undoHistory))
      //     .bind();
      //
      // bindings.value.buttonBinder()
      //     .onDynamic(this.redoButtonContainer.value!)
      //     .toProduce(i => new HistoryGoForward(Array.from(redoButtonContainer.value!.childNodes).indexOf(i.widget!), this.state.bindings.undoHistory))
      //     .bind();

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
    }

    onMounted(() => {
      setupBindings();

      const drawrect = new DrawRect(canvas.value!);
      drawrect.setCoords(10, 10, 300, 300);
      drawrect.execute();

      // preview.value!.style.display = 'none';
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
      preview
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
