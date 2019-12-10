# wmenu
Web version of JMenu

![Menu Search](/doc/img/MainMenu.png)

## Install
```
git clone https://github.com/JeffersonLab/wmenu.git
cd wmenu
gradlew build
```

## Configure

Environment variables are needed:

1. WMENU_JMENU_URL - path to menus web service
1. WMENU_SEARCH_URL  - path to search results web service
1. WMENU_ROOT_MENU - name of root menu (example 'MainMenu' for ops, 'MainMenuUITF' for itf)

## Run
1. Copy build/libs/wmenu.war into a Tomcat webapps directory
1. Start Tomcat and navigate your web browser to localhost:8080/wmenu

## See Also
   - [Wiki](https://github.com/JeffersonLab/wmenu/wiki)
