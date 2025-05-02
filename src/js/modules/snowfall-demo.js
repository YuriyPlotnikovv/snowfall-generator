class Snowfall {
  handleResize = (() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        this.viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

        const newCount = this.getSnowflakeCountByWidth(this.viewportWidth);
        if (newCount !== this.snowflakeCount) {
          this.snowflakeCount = newCount;
          cancelAnimationFrame(this.animationFrameId);
          this.initSnowflakes();
          this.previousTimestamp = performance.now();
          this.animationFrameId = requestAnimationFrame(this.animationStep.bind(this));
        } else {
          this.updateSegments();
        }
      }, 100);
    };
  })();

  constructor(containerId, initialSettings) {
    this.containerId = containerId;
    this.settings = initialSettings;

    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.containerId;

      Object.assign(this.container.style, {
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

      document.body.appendChild(this.container);
    }

    if (!this.container.shadowRoot) {
      this.shadow = this.container.attachShadow({mode: 'closed'});
    } else {
      this.shadow = this.container.shadowRoot;
    }

    this.snowflakeContainer = document.createElement('div');
    Object.assign(this.snowflakeContainer.style, {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'visible',
    });

    this.shadow.innerHTML = '';
    this.shadow.appendChild(this.snowflakeContainer);

    this.viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    this.viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    this.snowflakes = [];
    this.previousTimestamp = performance.now();
    this.snowflakeCount = this.getSnowflakeCountByWidth(this.viewportWidth);

    this.initSnowflakes();

    window.addEventListener('resize', this.handleResize.bind(this));

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.previousTimestamp = performance.now();
      }
    });

    this.animationFrameId = requestAnimationFrame(this.animationStep.bind(this));
  }

  getRandomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  getSnowflakeCountByWidth(width) {
    const baseCount = this.settings.snowflakesCount || 100;
    let count;

    if (width <= 767) {
      count = Math.floor(baseCount / 3);
    } else if (width <= 1325) {
      count = Math.floor((baseCount * 2) / 3);
    } else {
      count = baseCount;
    }

    return Math.max(count, 30);
  }

  createSnowflakeElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = (this.settings.snowflakesType === 'custom' && this.settings.customSnowflakeSVG)
      ? this.settings.customSnowflakeSVG
      : this.settings.snowflakesSVG[this.settings.snowflakesType] || '';

    const svgElement = wrapper.firstChild;

    if (!svgElement) {
      return document.createElement('div');
    }

    Object.assign(svgElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
      userSelect: 'none',
    });

    return svgElement;
  }

  generateInitialX(index, segmentWidth) {
    if (!this.settings.windEnabled) {
      return segmentWidth * index + this.getRandomInRange(0, segmentWidth);
    }
    if (this.settings.windType === 'left') {
      if ((this.settings.windSpeed >= 50 && this.viewportWidth <= 767) || this.settings.windSpeed >= 100) {
        return this.getRandomInRange(-this.viewportWidth, this.viewportWidth);
      } else {
        return this.getRandomInRange(-this.viewportWidth * 0.5, this.viewportWidth);
      }
    }
    if (this.settings.windType === 'right') {
      if ((this.settings.windSpeed >= 50 && this.viewportWidth <= 767) || this.settings.windSpeed >= 100) {
        return this.getRandomInRange(0, this.viewportWidth * 2);
      } else {
        return this.getRandomInRange(0, this.viewportWidth * 1.5);
      }
    }

    return segmentWidth * index + this.getRandomInRange(0, segmentWidth);
  }

  createSnowflake(index, total) {
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

    const size = this.getRandomInRange(this.settings.snowflakesSize[0], this.settings.snowflakesSize[1]);
    const opacity = this.getRandomInRange(this.settings.snowflakesVisibility[0], this.settings.snowflakesVisibility[1]);
    const fallSpeed = this.getRandomInRange(this.settings.snowfallSpeed[0], this.settings.snowfallSpeed[1]);
    const segmentWidth = this.viewportWidth / total;

    let swayAmplitude = 0;
    let swayFrequency = 0;
    let swayPhase = 0;

    if (this.settings.swayEnabled && Math.random() < 0.5) {
      swayAmplitude = this.getRandomInRange(this.settings.swayAmplitude[0], this.settings.swayAmplitude[1]);
      swayFrequency = this.getRandomInRange(this.settings.swayFrequency[0], this.settings.swayFrequency[1]);
      swayPhase = Math.random() * 2 * Math.PI;
    }

    let windVelocity = 0;
    if (this.settings.windEnabled) {
      if (this.settings.windType === 'left') {
        windVelocity = this.settings.windSpeed;
      } else if (this.settings.windType === 'right') {
        windVelocity = -this.settings.windSpeed;
      }
    }

    let rotationSpeed = 0;
    if (this.settings.rotationEnabled && Math.random() < 0.5) {
      rotationSpeed = this.getRandomInRange(this.settings.rotationSpeed[0], this.settings.rotationSpeed[1]) * (Math.random() < 0.5 ? 1 : -1);
    }

    const initialX = this.generateInitialX(index, segmentWidth);
    const initialY = this.getRandomInRange(0, this.viewportHeight);
    const segmentOffset = (initialX - segmentWidth * index) / segmentWidth;

    const svgElement = this.createSnowflakeElement();
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
      segmentOffset: segmentOffset,
      segmentWidth,
    };
  }

  initSnowflakes() {
    this.snowflakeContainer.innerHTML = '';
    this.snowflakes = [];

    const count = this.snowflakeCount;

    for (let i = 0; i < count; i++) {
      const snowflake = this.createSnowflake(i, count);
      this.snowflakeContainer.appendChild(snowflake.element);
      this.snowflakes.push(snowflake);
    }
  }

  updateSegments() {
    const segmentWidth = this.viewportWidth / this.snowflakes.length;

    for (const snowflake of this.snowflakes) {
      snowflake.segmentWidth = segmentWidth;
      snowflake.initialX = segmentWidth * snowflake.segmentIndex + segmentWidth * snowflake.segmentOffset;
      snowflake.x = snowflake.initialX;

      if (snowflake.y > this.viewportHeight) {
        snowflake.y = -snowflake.size;
      }
    }
  }

  animationStep(currentTimestamp) {
    let deltaTime = (currentTimestamp - this.previousTimestamp) / 1000;
    if (deltaTime < 0 || deltaTime > 0.1) {
      deltaTime = 0.016;
    }

    this.previousTimestamp = currentTimestamp;

    for (const snowflake of this.snowflakes) {
      snowflake.y += snowflake.fallSpeed * deltaTime;

      let swayOffset = 0;
      if (this.settings.swayEnabled) {
        swayOffset = snowflake.swayAmplitude * Math.sin(2 * Math.PI * snowflake.swayFrequency * currentTimestamp / 1000 + snowflake.swayPhase);
      }

      if (!this.settings.windEnabled) {
        snowflake.x = snowflake.initialX + swayOffset;
      } else {
        snowflake.x = snowflake.initialX + snowflake.windVelocity * deltaTime + swayOffset;
        snowflake.initialX += snowflake.windVelocity * deltaTime;
      }

      if (this.settings.rotationEnabled && snowflake.rotationSpeed !== 0) {
        snowflake.rotationAngle = (snowflake.rotationAngle + snowflake.rotationSpeed * deltaTime) % 360;
      }

      if (snowflake.y > this.viewportHeight) {
        snowflake.y = -snowflake.size;
        snowflake.initialX = this.generateInitialX(snowflake.segmentIndex, snowflake.segmentWidth);
        snowflake.x = snowflake.initialX;
        snowflake.swayPhase = Math.random() * 2 * Math.PI;
        snowflake.rotationAngle = this.settings.rotationEnabled ? Math.random() * 360 : 0;
      }

      const rotationPart = this.settings.rotationEnabled ? ` rotate(${snowflake.rotationAngle.toFixed(2)}deg)` : '';
      snowflake.element.style.transform = `translate(${snowflake.x.toFixed(2)}px, ${snowflake.y.toFixed(2)}px)${rotationPart}`;
    }

    this.animationFrameId = requestAnimationFrame(this.animationStep.bind(this));
  }

  updateSettings(newSettings) {
    const prevType = this.settings.snowflakesType;
    const prevCount = this.settings.snowflakesCount;
    const prevCustomSVG = this.settings.customSnowflakeSVG;

    this.settings = Object.assign({}, this.settings, newSettings);

    this.snowflakeCount = this.getSnowflakeCountByWidth(this.viewportWidth);

    const typeChanged = prevType !== this.settings.snowflakesType;
    const countChanged = prevCount !== this.settings.snowflakesCount;
    const svgChanged = (this.settings.snowflakesType === 'custom')
      ? prevCustomSVG !== this.settings.customSnowflakeSVG
      : this.settings.snowflakesSVG[prevType] !== (this.settings.snowflakesSVG[this.settings.snowflakesType] || '');

    if (typeChanged || countChanged || svgChanged) {
      cancelAnimationFrame(this.animationFrameId);
      this.initSnowflakes();
      this.previousTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame(this.animationStep.bind(this));
    } else {
      for (const snowflake of this.snowflakes) {
        snowflake.size = this.getRandomInRange(this.settings.snowflakesSize[0], this.settings.snowflakesSize[1]);
        snowflake.opacity = this.getRandomInRange(this.settings.snowflakesVisibility[0], this.settings.snowflakesVisibility[1]);
        snowflake.fallSpeed = this.getRandomInRange(this.settings.snowfallSpeed[0], this.settings.snowfallSpeed[1]);
        snowflake.windVelocity = this.settings.windType === 'left' ? this.settings.windSpeed : this.settings.windType === 'right' ? -this.settings.windSpeed : 0;

        if (this.settings.swayEnabled && Math.random() < 0.5) {
          snowflake.swayAmplitude = this.getRandomInRange(this.settings.swayAmplitude[0], this.settings.swayAmplitude[1]);
          snowflake.swayFrequency = this.getRandomInRange(this.settings.swayFrequency[0], this.settings.swayFrequency[1]);
          snowflake.swayPhase = Math.random() * 2 * Math.PI;
        } else {
          snowflake.swayAmplitude = 0;
          snowflake.swayFrequency = 0;
          snowflake.swayPhase = 0;
        }

        if (this.settings.rotationEnabled && Math.random() < 0.5) {
          snowflake.rotationSpeed = this.getRandomInRange(this.settings.rotationSpeed[0], this.settings.rotationSpeed[1]) * (Math.random() < 0.5 ? 1 : -1);
        } else {
          snowflake.rotationSpeed = 0;
        }

        snowflake.element.style.width = snowflake.size + 'px';
        snowflake.element.style.height = snowflake.size + 'px';
        snowflake.element.style.opacity = snowflake.opacity.toFixed(2);
      }
    }
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.container.innerHTML = '';
  }
}
