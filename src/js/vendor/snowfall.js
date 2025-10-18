document.addEventListener('DOMContentLoaded', () => {
  // Параметры
  const SNOWFLAKE_SVG_PATH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.988 511.988"><g fill="#4a89dc">...</g></svg>`; // Вставьте сюда полный SVG
  const SNOWFLAKES_COUNT_BASE = 100;
  const SNOWFLAKES_SIZE_MIN = 5;
  const SNOWFLAKES_SIZE_MAX = 50;
  const SNOWFLAKES_OPACITY_MIN = 0.3;
  const SNOWFLAKES_OPACITY_MAX = 1.0;
  const FALL_SPEED_MIN = 10;
  const FALL_SPEED_MAX = 100;

  const SWAY_ENABLED = true;
  const SWAY_PROBABILITY = 0.5;
  const SWAY_AMPLITUDE_MIN = 5;
  const SWAY_AMPLITUDE_MAX = 20;
  const SWAY_FREQUENCY_MIN = 0.1;
  const SWAY_FREQUENCY_MAX = 0.5;

  const WIND_TYPE_LEFT = 'left';
  const WIND_TYPE_RIGHT = 'right';
  const WIND_ENABLED = true;
  const WIND_TYPE = WIND_TYPE_LEFT;
  const WIND_SPEED = 100;

  const ROTATION_ENABLED = true;
  const ROTATION_PROBABILITY = 0.5;
  const ROTATION_SPEED_MIN = 10;
  const ROTATION_SPEED_MAX = 90;

  let container = document.getElementById('snow-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'snow-container';

    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: '9999',
      background: 'transparent',
    });

    document.body.appendChild(container);
  }

  let shadow = container.shadowRoot;

  if (!shadow) {
    shadow = container.attachShadow({mode: 'closed'});
  }

  const snowflakeContainer = document.createElement('div');

  Object.assign(snowflakeContainer.style, {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'visible',
  });

  shadow.innerHTML = '';
  shadow.appendChild(snowflakeContainer);

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  const getRandomInRange = (min, max) => min + Math.random() * (max - min);

  function getSnowflakeCountByWidth(width) {
    let count;

    if (width <= 767) {
      count = Math.floor(SNOWFLAKES_COUNT_BASE / 3);
    } else if (width <= 1325) {
      count = Math.floor((SNOWFLAKES_COUNT_BASE * 2) / 3);
    } else {
      count = SNOWFLAKES_COUNT_BASE;
    }

    return Math.max(count, 30);
  }

  function createSnowflakeElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = SNOWFLAKE_SVG_PATH.trim();
    const svgElement = wrapper.firstChild;

    if (!svgElement) return document.createElement('div');

    Object.assign(svgElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
      userSelect: 'none',
    });

    return svgElement;
  }

  function generateInitialX(index, segmentWidth) {
    if (!WIND_ENABLED) {
      return segmentWidth * index + getRandomInRange(0, segmentWidth);
    }

    if (WIND_TYPE === WIND_TYPE_LEFT) {
      if ((WIND_SPEED >= 50 && viewportWidth <= 767) || WIND_SPEED >= 100) {
        return getRandomInRange(-viewportWidth, viewportWidth);
      } else {
        return getRandomInRange(-viewportWidth * 0.5, viewportWidth);
      }
    }

    if (WIND_TYPE === WIND_TYPE_RIGHT) {
      if ((WIND_SPEED >= 50 && viewportWidth <= 767) || WIND_SPEED >= 100) {
        return getRandomInRange(0, viewportWidth * 2);
      } else {
        return getRandomInRange(0, viewportWidth * 1.5);
      }
    }

    return segmentWidth * index + getRandomInRange(0, segmentWidth);
  }

  function createSnowflake(index, total) {
    const wrapper = document.createElement('div');

    Object.assign(wrapper.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      willChange: 'transform',
      pointerEvents: 'none',
      userSelect: 'none',
      display: 'block',
    });

    const size = getRandomInRange(SNOWFLAKES_SIZE_MIN, SNOWFLAKES_SIZE_MAX);
    const opacity = getRandomInRange(SNOWFLAKES_OPACITY_MIN, SNOWFLAKES_OPACITY_MAX);
    const fallSpeed = getRandomInRange(FALL_SPEED_MIN, FALL_SPEED_MAX);
    const segmentWidth = viewportWidth / total;

    // Колебания с вероятностью SWAY_PROBABILITY
    let swayAmplitude = 0;
    let swayFrequency = 0;
    let swayPhase = 0;
    let windVelocity = 0;
    let rotationSpeed = 0;

    if (SWAY_ENABLED && Math.random() < SWAY_PROBABILITY) {
      swayAmplitude = getRandomInRange(SWAY_AMPLITUDE_MIN, SWAY_AMPLITUDE_MAX);
      swayFrequency = getRandomInRange(SWAY_FREQUENCY_MIN, SWAY_FREQUENCY_MAX);
      swayPhase = Math.random() * 2 * Math.PI;
    }

    if (WIND_ENABLED) {
      if (WIND_TYPE === WIND_TYPE_LEFT) {
        windVelocity = WIND_SPEED;
      } else if (WIND_TYPE === WIND_TYPE_RIGHT) {
        windVelocity = -WIND_SPEED;
      }
    }

    // Вращение с вероятностью ROTATION_PROBABILITY
    if (ROTATION_ENABLED && Math.random() < ROTATION_PROBABILITY) {
      rotationSpeed = getRandomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX) * (Math.random() < 0.5 ? 1 : -1);
    }

    const initialX = generateInitialX(index, segmentWidth);
    const initialY = getRandomInRange(0, viewportHeight);
    const svgElement = createSnowflakeElement();

    wrapper.style.width = size + 'px';
    wrapper.style.height = size + 'px';
    wrapper.style.opacity = opacity.toFixed(2);
    wrapper.style.transform = `translate(${initialX}px, ${initialY}px)`;
    wrapper.appendChild(svgElement);

    return {
      element: wrapper,
      x: initialX,
      y: initialY,
      size,
      opacity,
      fallSpeed,
      windVelocity,
      swayAmplitude,
      swayFrequency,
      swayPhase,
      rotationSpeed,
      rotationAngle: Math.random() * 360,
      initialX,
      segmentIndex: index,
      segmentWidth,
    };
  }

  let snowflakeCount = getSnowflakeCountByWidth(viewportWidth);
  let snowflakes = [];

  function initSnowflakes() {
    snowflakeContainer.innerHTML = '';
    snowflakes = [];
    snowflakeCount = getSnowflakeCountByWidth(viewportWidth);

    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = createSnowflake(i, snowflakeCount);
      snowflakeContainer.appendChild(snowflake.element);
      snowflakes.push(snowflake);
    }
  }

  function updateSegments() {
    const segmentWidth = viewportWidth / snowflakes.length;

    for (const snowflake of snowflakes) {
      snowflake.segmentWidth = segmentWidth;
      snowflake.initialX = generateInitialX(snowflake.segmentIndex, segmentWidth);
      snowflake.x = snowflake.initialX;

      if (snowflake.y > viewportHeight) {
        snowflake.y = -snowflake.size;
      }
    }
  }

  let previousTimestamp = performance.now();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      previousTimestamp = performance.now();
    }
  });

  function animationStep(currentTimestamp) {
    let deltaTime = (currentTimestamp - previousTimestamp) / 1000;

    if (deltaTime < 0 || deltaTime > 0.1) {
      deltaTime = 0.016;
    }

    previousTimestamp = currentTimestamp;

    for (const snowflake of snowflakes) {
      snowflake.y += snowflake.fallSpeed * deltaTime;

      let swayOffset = 0;
      if (SWAY_ENABLED && snowflake.swayAmplitude !== 0) {
        swayOffset = snowflake.swayAmplitude * Math.sin(2 * Math.PI * snowflake.swayFrequency * currentTimestamp / 1000 + snowflake.swayPhase);
      }

      if (!WIND_ENABLED) {
        snowflake.x = snowflake.initialX + swayOffset;
      } else {
        snowflake.x = snowflake.initialX + snowflake.windVelocity * deltaTime + swayOffset;
        snowflake.initialX += snowflake.windVelocity * deltaTime;
      }

      if (ROTATION_ENABLED && snowflake.rotationSpeed !== 0) {
        snowflake.rotationAngle = (snowflake.rotationAngle + snowflake.rotationSpeed * deltaTime) % 360;
      }

      if (snowflake.y > viewportHeight) {
        snowflake.y = -snowflake.size;
        snowflake.initialX = generateInitialX(snowflake.segmentIndex, snowflake.segmentWidth);
        snowflake.x = snowflake.initialX;
        snowflake.swayPhase = Math.random() * 2 * Math.PI;
        snowflake.rotationAngle = ROTATION_ENABLED ? Math.random() * 360 : 0;
      }

      const rotationPart = ROTATION_ENABLED ? ` rotate(${snowflake.rotationAngle.toFixed(2)}deg)` : '';
      snowflake.element.style.transform = `translate(${snowflake.x.toFixed(2)}px, ${snowflake.y.toFixed(2)}px)${rotationPart}`;
    }

    requestAnimationFrame(animationStep);
  }

  initSnowflakes();
  requestAnimationFrame(animationStep);

  window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    const newCount = getSnowflakeCountByWidth(viewportWidth);
    if (newCount !== snowflakeCount) {
      snowflakeCount = newCount;
      initSnowflakes();
    } else {
      updateSegments();
    }
  });
});
