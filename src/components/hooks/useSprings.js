import { useRef } from 'react';
import rebound from 'rebound';
import { LAYER_MAXIMUM } from '../../constants';
import { useRefInit } from './useRefInit';

function noOp() {}

class AnimationLooper extends rebound.AnimationLooper {
  constructor() {
    super();

    this.isEnabled = true;
    this.rafId = null;
    this.timeScale = 1;

    this.onAnimationFrame = (time) => {
      this.springSystem.loop(time * this.timeScale);
    };
  }

  run() {
    if (!this.isEnabled) {
      return;
    }

    cancelAnimationFrame(this.rafId);

    this.rafId = requestAnimationFrame(this.onAnimationFrame);
  }
}

function createLayerSprings(springSystem) {
  const layerSprings = {
    element: null,
    ref: (element) => layerSprings.element = element,
    shouldImmediatelyPosition: true,
    opacitySpring: springSystem.createSpring(),
    transformSpring: springSystem.createSpring(180, 7),
    state: null,
    yOffset: 0
  };

  layerSprings.opacitySpring.setOvershootClampingEnabled(true);

  return layerSprings;
}

export function useSprings({ onLayerRemoved = noOp } = {}) {
  // a hook used to coordinate springs and their associated DOM elements.

  const controlsRef = useRef();
  const containerRef = useRef();

  // need to store some props in a ref for access within closures.
  const propsRef = useRef({
    layersWrapped: [],
    isCapturing: false,
    onLayerRemoved: null
  });

  propsRef.current.onLayerRemoved = onLayerRemoved;

  return useRefInit(function () {
    const looper = new AnimationLooper();
    const springSystem = new rebound.SpringSystem(looper);
    const controlOpacitySpring = springSystem.createSpring();
    const layerSpringsByKey = new Map();

    const kickStartSpringSystem = function () {
      if (springSystem.getIsIdle()) {
        looper.run();
      }
    };

    const getLayerSprings = function (key) {
      if (layerSpringsByKey.has(key)) {
        return layerSpringsByKey.get(key);
      }

      const layerSprings = createLayerSprings(springSystem);

      layerSpringsByKey.set(key, layerSprings);

      kickStartSpringSystem();

      return layerSprings;
    };

    const updateSpringProps = function (layersWrapped, isCapturing) {
      propsRef.current.layersWrapped = layersWrapped;
      propsRef.current.isCapturing = isCapturing;

      kickStartSpringSystem();
    };

    springSystem.addListener({
      onBeforeIntegrate: function () {
        // before each integration, set all the springs' target values.
        const { layersWrapped, isCapturing } = propsRef.current;
        const controlsAreVisible = layersWrapped.length > 0;

        let yOffset = isCapturing ? 0.75 : 0;

        layersWrapped.forEach(function (layerWrapped) {
          const layerSprings = getLayerSprings(layerWrapped.key);

          layerSprings.yOffset = yOffset;

          if (layerSprings.state === 'enter') {
            yOffset++;
          } else if (layerSprings.state === 'exit' && layerSprings.opacitySpring.getCurrentValue() >= 0.2) {
            yOffset++;
          }
        });

        if (controlsAreVisible) {
          controlOpacitySpring.setEndValue(1);
        }

        let waitingOnPreviousLayerSprings = controlsAreVisible ? controlOpacitySpring.getCurrentValue() < 0.9 : false;

        for (let i = layersWrapped.length - 1; i >= 0; i--) {
          const key = layersWrapped[i].key;
          const layerSprings = getLayerSprings(key);

          switch (layerSprings.state) {
            case 'enter':
              if (layerSprings.shouldImmediatelyPosition) {
                layerSprings.shouldImmediatelyPosition = false;

                layerSprings.opacitySpring.setCurrentValue(0).setAtRest();
                layerSprings.transformSpring.setCurrentValue(i).setAtRest();
              }

              if (waitingOnPreviousLayerSprings) {
                break;
              }

              layerSprings.opacitySpring.setEndValue(1);
              layerSprings.transformSpring.setEndValue(layerSprings.yOffset);

              if (
                layerSprings.opacitySpring.getCurrentValue() < 0.9
                ||
                layerSprings.transformSpring.getCurrentDisplacementDistance() > 4
              ) {
                waitingOnPreviousLayerSprings = true;
              }

              break;
            case 'exit':
              if (waitingOnPreviousLayerSprings) {
                break;
              }

              layerSprings.opacitySpring.setEndValue(0);

              if (layerSprings.opacitySpring.getCurrentValue() > 0.1) {
                waitingOnPreviousLayerSprings = true;
              }
              break;
            default:
          }
        }

        if (!waitingOnPreviousLayerSprings && !controlsAreVisible) {
          controlOpacitySpring.setEndValue(0);
        }
      },
      onAfterIntegrate: function () {
        // after springs have been calculated, sync up the DOM.
        controlsRef.current.style.opacity = controlOpacitySpring.getCurrentValue();
        controlsRef.current.style.visibility = controlOpacitySpring.getCurrentValue() === 0 ? 'hidden' : 'visible';

        containerRef.current.style.height = `${LAYER_MAXIMUM * 48}px`;

        layerSpringsByKey.forEach(function (layerSprings, key) {
          // remove any layerSprings that are exiting and have finished all
          // their movement.
          if (
            layerSprings.state === 'exit'
            &&
            layerSprings.opacitySpring.isAtRest()
            &&
            layerSprings.opacitySpring.getCurrentValue() === 0
          ) {
            layerSprings.opacitySpring.destroy();
            layerSprings.transformSpring.destroy();

            layerSpringsByKey.delete(key);

            propsRef.current.onLayerRemoved(key);

            return;
          }

          layerSprings.element.style.opacity = layerSprings.opacitySpring.getCurrentValue();
          layerSprings.element.style.visibility = layerSprings.opacitySpring.getCurrentValue() === 0 ? 'hidden' : 'visible';
          layerSprings.element.style.transform = `translateY(${layerSprings.transformSpring.getCurrentValue() * 48}px)`;
        });
      }
    });

    // set initial styles.
    kickStartSpringSystem();

    return {
      controlsRef,
      containerRef,
      updateSpringProps,
      getLayerSprings
    };
  });
}
