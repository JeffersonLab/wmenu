# wmenu [![CI](https://github.com/JeffersonLab/wmenu/actions/workflows/ci.yml/badge.svg)](https://github.com/JeffersonLab/wmenu/actions/workflows/ci.yml)
Web version of JMenu

![Menu Search](/doc/img/MainMenu.png)

---
- [Install](https://github.com/JeffersonLab/wmenu#install)
- [Configure](https://github.com/JeffersonLab/wmenu#configure)
- [Build](https://github.com/JeffersonLab/wmenu#build)
- [Develop](https://github.com/JeffersonLab/wmenu#develop)    
- [Release](https://github.com/JeffersonLab/wmenu#release)
- [Deploy](https://github.com/JeffersonLab/wmenu#deploy) 
- [See Also](https://github.com/JeffersonLab/wmenu#see-also) 
---

## Install
   1. Download Java 8+
   1. Download [Apache Tomcat 7, 8, or 9](http://tomcat.apache.org/)
   1. Download [wmenu.war](https://github.com/JeffersonLab/wmenu/releases) and drop it into the Tomcat webapps directory
   1. Start Tomcat and navigate your web browser to localhost:8080/wmenu

## Configure

Environment variables are needed:

1. WMENU_JMENU_URL - path to menus web service
1. WMENU_SEARCH_URL  - path to search results web service
1. WMENU_ROOT_MENU - name of root menu (example 'MainMenu' for ops, 'MainMenuUITF' for itf)

## Build 
This project is built with [Java 17](https://adoptium.net/) (compiled to Java 8 bytecode), and uses the [Gradle 7](https://gradle.org/) build tool to automatically download dependencies and build the project from source:

```
git clone https://github.com/JeffersonLab/wmenu
cd wmenu
gradlew build
```
**Note**: If you do not already have Gradle installed, it will be installed automatically by the wrapper script included in the source

**Note for JLab On-Site Users**: Jefferson Lab has an intercepting [proxy](https://gist.github.com/slominskir/92c25a033db93a90184a5994e71d0b78)

## Develop
This application requires a menu server and Elasetic Search server.  On-site at JLab [configure](https://github.com/JeffersonLab/wmenu#configure) the app to use:

```
WMENU_JMENU_URL=https://accweb9.acc.jlab.org/apps/jmenu/api/menus
WMENU_SEARCH_URL=https://accweb7.acc.jlab.org/search/jmenu-cebaf
WMENU_ROOT_MENU=MainMenu
```

**Note**: These servers support CORS to allow cross-origin requests.

## Release
1. Bump the version number and release date in build.gradle and commit and push to GitHub (using [Semantic Versioning](https://semver.org/)).   
2. Create a new release on the GitHub [Releases](https://github.com/JeffersonLab/wedm/releases) page corresponding to same version in build.gradle (Enumerate changes and link issues).   Run war Gradle build target and attach war to release.

## Deploy
At JLab this app is found at [epicsweb.jlab.org/wmenu](https://epicsweb.jlab.org/wmenu/), plus other fiefdom specific subpaths, and internally at [epicswebtest.acc.jlab.org/wmenu](https://epicswebtest.acc.jlab.org/wmenu/).  However, the epicsweb server is a proxy for `epicswebops.acc.jlab.org`, `epicswebchl.acc.jlab.org`, `epicswebfel.acc.jlab.org`, `epicswebsrf.acc.jlab.org` and `epicswebitf.acc.jlab.org`.  Additionally, the context root for each is adjusted with a suffix such that all servers can be reached from a single namespace.  The context root suffixes are `/`, `/chl`, `/fel`, `/srf`, and `/itf` respectively.  Tomcat interprets context roots from _war_ file name unless overridden elsewhere.  Therefore each _war_ must be renamed with `#<suffix>`.    Use wget or the like to grab the release war file.  Don't download directly into webapps dir as file scanner may attempt to deploy before fully downloaded.  Be careful of previous war file as by default wget won't overrwite.  The war file should be attached to each release, so right click it and copy location (or just update version in path provided in the example below).  Example for chl fiefdom:

```
cd /tmp
rm wmenu.war
wget https://github.com/JeffersonLab/wmenu/releases/download/v1.2.3/wmenu.war
mv wmenu.war wmenu#chl.war
mv  wmenu#chl.war /usr/share/tomcat/webapps
```

## See Also

  - [wedm](https://github.com/JeffersonLab/wedm)   
