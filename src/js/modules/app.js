document.addEventListener('DOMContentLoaded', () => {
  const snowfall = new Snowfall('snow-container', {
    snowflakesType: '',
    customSnowflakeSVG: '',
    snowflakesSVG,
    snowflakesCount: 50,
    snowflakesSize: [5, 50],
    snowflakesVisibility: [0.1, 1],
    snowfallSpeed: [10, 100],
    windEnabled: false,
    windType: '',
    windSpeed: 50,
    swayEnabled: false,
    swayAmplitude: [5, 20],
    swayFrequency: [0.1, 0.5],
    rotationEnabled: false,
    rotationSpeed: [10, 40],
  });

  new Vue({
    el: '#app',
    components: {
      'vue-slider': window['vue-slider-component']
    },
    data: {
      isSettings: false,
      isLoading: false,
      isGenerated: getCookie('isGenerated') === 'true',
      generatedScriptUrl: getCookie('generatedScriptUrl') || '',
      settings: {
        snowflakesType: '',
        customSnowflakeSVG: '',
        snowflakesCount: 50,
        snowflakesSize: [5, 50],
        snowflakesVisibility: [0.1, 1],
        snowfallSpeed: [10, 100],
        windEnabled: false,
        windType: '',
        windSpeed: 50,
        swayEnabled: false,
        swayAmplitude: [5, 20],
        swayFrequency: [0.1, 0.5],
        rotationEnabled: false,
        rotationSpeed: [10, 40],
      },
      snowflakesSVG,
      ranges: {
        snowflakesCount: {min: 10, max: 150},
        snowflakesSize: {min: 5, max: 100},
        snowflakesVisibility: {min: 0.1, max: 1},
        snowfallSpeed: {min: 10, max: 300},
        windSpeed: {min: 0, max: 150},
        swayAmplitude: {min: 5, max: 50},
        swayFrequency: {min: 0.1, max: 1},
        rotationSpeed: {min: 10, max: 100},
      },
    },
    watch: {
      settings: {
        handler(newSettings) {
          snowfall.updateSettings(newSettings);
        },
        deep: true
      },
      snowflakesSVG: {
        handler(newValue) {
          const keys = Object.keys(newValue);
          if (keys.length > 0 && !this.settings.snowflakesType) {
            this.settings.snowflakesType = keys[0];
          }
        },
        immediate: true
      },
      isGenerated(newVal) {
        setCookie('isGenerated', newVal, 3);
      },
      generatedScriptUrl(newVal) {
        setCookie('generatedScriptUrl', newVal, 3);
      }
    },
    methods: {
      showSettings() {
        this.isSettings = true;
      },
      submitSettings() {
        this.isLoading = true;

        const params = {
          ...this.settings,
          snowflakesSVG: this.snowflakesSVG
        };

        fetch('/generate-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
          .then(async response => {
            if (!response.ok) {
              throw new Error('Ошибка сервера при генерации скрипта');
            }
            const data = await response.json();

            this.generatedScriptUrl = data.scriptUrl;
            this.isGenerated = true;
            this.isLoading = false;
          })
          .catch(err => {
            console.error(err);
            alert('Ошибка при генерации скрипта');
            this.isLoading = false;
          });
      },
      onCustomSVGUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = e => {
          let text = e.target.result.trim();

          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'image/svg+xml');
          const svg = doc.querySelector('svg');

          if (svg) {
            svg.removeAttribute('width');
            svg.removeAttribute('height');

            const serializer = new XMLSerializer();
            text = serializer.serializeToString(svg);

            this.settings.customSnowflakeSVG = text;
            this.settings.snowflakesType = 'custom';
          } else {
            alert('Пожалуйста, загрузите корректный SVG-файл');
          }
        };

        reader.onerror = () => {
          alert('Ошибка при чтении файла');
        };

        reader.readAsText(file);
      },
      downloadScript() {
        if (!this.generatedScriptUrl) {
          alert('Файл для скачивания отсутствует');
          return;
        }

        const link = document.createElement('a');
        link.href = this.generatedScriptUrl;
        link.download = 'snowfall.zip';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      createNewScript() {
        deleteCookie('isGenerated');
        deleteCookie('generatedScriptUrl');
        this.isGenerated = false;
        this.generatedScriptUrl = '';
        this.isSettings = true;
      },
    }
  });
});
