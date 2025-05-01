document.addEventListener('DOMContentLoaded', () => {
  const messages = {
    ru: {
      invalidSVG: 'Пожалуйста, загрузите корректный SVG-файл',
      readError: 'Ошибка при чтении файла',
      serverErrorGenerate: 'Ошибка сервера при генерации скрипта',
      serverErrorDelete: 'Ошибка сервера при удалении скрипта',
      noFileToDownload: 'Файл для скачивания отсутствует',
      errorDeleteScript: 'Ошибка при удалении скрипта',
    },
    en: {
      invalidSVG: 'Please upload a valid SVG file',
      readError: 'Error reading file',
      serverErrorGenerate: 'Server error during script generation',
      serverErrorDelete: 'Server error during script deletion',
      noFileToDownload: 'No file available for download',
      errorDeleteScript: 'Error deleting script',
    }
  };

  const defaultSettings = {
    snowflakesType: '',
    customSnowflakeSVG: '',
    snowflakesCount: 50,
    snowflakesSize: [5, 50],
    snowflakesVisibility: [0.1, 1],
    snowfallSpeed: [10, 100],
    windEnabled: false,
    windType: 'left',
    windSpeed: 50,
    swayEnabled: false,
    swayAmplitude: [5, 20],
    swayFrequency: [0.1, 0.5],
    rotationEnabled: false,
    rotationSpeed: [10, 40],
  };

  const htmlLang = document.documentElement.lang || 'ru';
  const currentLang = messages[htmlLang] ? htmlLang : 'ru';

  function getMessage(key) {
    return messages[currentLang][key] || messages.en[key] || key;
  }

  const snowflakeKeys = Object.keys(snowflakesSVG);
  if (snowflakeKeys.length > 0) {
    defaultSettings.snowflakesType = snowflakeKeys[0];
  }

  const snowfall = new Snowfall('snow-container', {
    snowflakesSVG,
    ...JSON.parse(JSON.stringify(defaultSettings))
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
      settings: JSON.parse(JSON.stringify(defaultSettings)),
      snowflakesSVG,
      selectedFileName: '',
      ranges: {
        snowflakesCount: {min: 30, max: 200},
        snowflakesSize: {min: 5, max: 150},
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
              throw new Error(getMessage('serverErrorGenerate'));
            }
            const data = await response.json();

            this.generatedScriptUrl = data.scriptUrl;
            this.isGenerated = true;
            this.isLoading = false;
          })
          .catch(err => {
            console.error(err);
            alert(getMessage('serverErrorGenerate'));
            this.isLoading = false;
          });
      },
      onCustomSVGUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.selectedFileName = this.sliceFileName(file.name, 20);
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
            alert(getMessage('invalidSVG'));
          }
        };

        reader.onerror = () => {
          alert(getMessage('readError'));
        };

        reader.readAsText(file);
      },
      sliceFileName(name, maxLength = 20) {
        if (!name) return '';
        if (name.length <= maxLength) return name;

        const extIndex = name.lastIndexOf('.');
        const extension = extIndex !== -1 ? name.slice(extIndex) : '';
        const baseName = extIndex !== -1 ? name.slice(0, extIndex) : name;

        const charsToShow = maxLength - extension.length - 3;
        const frontChars = Math.ceil(charsToShow / 2);
        const backChars = Math.floor(charsToShow / 2);

        return baseName.slice(0, frontChars) + '...' + baseName.slice(baseName.length - backChars) + extension;
      },
      downloadScript() {
        if (!this.generatedScriptUrl) {
          alert(getMessage('noFileToDownload'));
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
        this.isLoading = true;

        const params = {
          generatedScriptUrl: this.generatedScriptUrl
        };

        fetch('/delete-generated-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
          .then(async response => {
            if (!response.ok) {
              throw new Error(getMessage('serverErrorDelete'));
            }
            deleteCookie('isGenerated');
            deleteCookie('generatedScriptUrl');
            this.isGenerated = false;
            this.generatedScriptUrl = '';
            this.isSettings = true;

            this.settings = {...JSON.parse(JSON.stringify(defaultSettings))};

            this.isLoading = false;
          })
          .catch(err => {
            console.error(err);
            alert(getMessage('errorDeleteScript'));
            this.isLoading = false;
          });
      },
    }
  });
});
