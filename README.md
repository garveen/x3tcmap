#[DEMO](https://garveen.github.io/x3tcmap/)

#[中文演示](https://garveen.github.io/x3tcmap/)

#How to deal with your MODs

You must have php >= 5.5 installed. The windows binary can be found at [php.net](http://windows.php.net/download/).

Put your universe xmls in `maps` folder, and your language xmls in `lang` folder.

Edit `config.php`, add xmls' path to it. Languages will be autoloaded.

```bash
cd path/to
php -S 127.0.0.1:8000
```

Then you can type `http://127.0.0.1:8000` in your browser and have fun.
