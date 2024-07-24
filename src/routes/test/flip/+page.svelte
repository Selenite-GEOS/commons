<script lang="ts">
  import {draggable, type DragOptions} from "@neodrag/svelte";
  import {flip} from 'svelte/animate';

  let items = $state([
    'apple',
    'banana',
    'cranberry',
    'durian',
    'eggplant',
    'fig',
    'grape',
    'hazelnut'
  ]);

  let currentDragIndex = $state(0); // index being dragged, updated while dragging
  let itemHeight = $state(48); // height of item(+gap) to calculate offset
  let translateY = $state(0); // offset to apply to current dragged item
  let lastOffsetY = $state(0); // last offset reported by neodrag
  const options: DragOptions = {
    axis: 'y',
    bounds: 'parent',
    handle: '.handle',
    onDragStart({rootNode,offsetY}){
      currentDragIndex = [...rootNode.parentNode.children].indexOf(rootNode); // get start index from dom
      lastOffsetY = offsetY; // store neodrag offset to correctly calculate delta in onDrag
      translateY = 0;
    },
    onDrag({offsetY}){
      translateY+=(offsetY - lastOffsetY); // move dragged item by delta from last event
      lastOffsetY = offsetY; // store neodrag offset for next delta calc 
      if(translateY > 0.5 * itemHeight){
        shiftCurrentItem(1) // dragged by more than half height down, shift down by one
      } else if (translateY < -0.5*itemHeight) {
        shiftCurrentItem(-1) // dragged by more than half height up, shift up by one
      }
    },
    onDragEnd({rootNode}){
      rootNode.style.transform=`translate3d(0,0,0)` // on end of drag, remove translate so item returns to natural pos
      translateY = 0;
    },
    transform({offsetY}){
      return `translate3d(0,${translateY}px,0)` // apply calculated offset
    }
  }
  function shiftCurrentItem(shift: number) {
    items.splice(currentDragIndex+shift,0,items.splice(currentDragIndex,1)[0]); // double splice to switch currentDragIndex item by shift
    items = items; // reassign for reactivity
    currentDragIndex+=shift; // update currentDragIndex so next shift works 
    translateY -= shift * itemHeight; // item has moved to a new place, update translate so that it keeps its current dragged pos
  }
  // the flip duration is set only on prev and next item of currentDragIndex, so the swap transition plays nice even when dragging fast
  // alternatively you can also set it on every item except currentDragIndex
</script>
<ul>  
  {#each items as item, i (item)}
    <li animate:flip={{duration: i === currentDragIndex + 1 || i === currentDragIndex -1 ? 250 : 0}}  use:draggable={options} class="item">
      <span>{i}: {item}</span><div class="handle"></div>
    </li>
  {/each}
</ul>

<style>
  * { box-sizing: border-box}
  .item {
    display: flex;
    width: 200px;
    height: 40px;
    align-items: center;
    border: 1px solid blueviolet;
    padding: 10px;
    background: #111;
  }
  .handle {
    margin-left: auto;
    width: 20px;
    height: 10px;
    background: cadetblue;
    cursor: grab;
  }
  ul {
    list-style: none;
    display: flex;
    gap: 8px;
    flex-direction: column;
  }
  ul :global(>li.neodrag-dragging) {
    z-index: 1;
    position: relative;
    cursor: n-resize;
  }
  ul :global(>li.neodrag-dragging .handle) {
    cursor: n-resize;
  }
</style>
