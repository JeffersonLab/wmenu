if (!String.prototype.encodeXml) {
    String.prototype.encodeXml = function () {
        return this.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;');
    };
}
if (!String.prototype.stripQuotes) {
    String.prototype.stripQuotes = function () {
        var str = this;
        /*Strip optional start quote*/
        if (str.indexOf('"') === 0) {
            str = str.substring(1, str.length);
        }

        /*Strip optional end quote*/
        if (str.lastIndexOf('"') === str.length - 1) {
            str = str.substring(0, str.length - 1);
        }

        return str;
    };
}
var jlab = jlab || {};
jlab.wmenu = jlab.wmenu || {};
jlab.wmenu.OTF_PATH = '/cs/opshome/edm/wedm/otf/';
jlab.macroQueryString = function (macros) {
    var url = "",
            tokens = macros.split(",");
    for (var i = 0; i < tokens.length; i++) {
        var kvPair = tokens[i],
                pieces = kvPair.split("=");
        if (pieces.length === 2) {
            url = url + "&%24(" + encodeURIComponent(pieces[0]) + ")=" + encodeURIComponent(pieces[1]);
        }
    }

    return url;
};
jlab.wmenu.handleScreenSearchResults = function (json) {
    var screens = [];

    /*console.log(json);*/

    if (json.hits.total > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record._type === 'ScreenAction') {
                console.log(record);
                var parentId = 0;
                if (record._source.menuData) {
                    parentId = record._source.menuData.actionID;
                }
                screens.push(jlab.wmenu.createScreenActionLi({parentId: parentId, id: record._source.id, label: record._source.label, value: record._source.screen.value, type: record._source.screen.type}));
            } else {
                console.log('wrong type while parsing screens: ' + record._type);
            }
        }
    }

    return screens;
};
jlab.wmenu.handleApplicationSearchResults = function (json) {
    var applications = [];
    if (json.hits.total > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record._type === 'AppAction') {
                applications.push(jlab.wmenu.createAppActionLi({label: record._source.label, value: record._source.app.value}));
            } else {
                console.log('wrong type for applications: ' + record._type);
            }
        }
    }

    return applications;
};
jlab.wmenu.handleDocumentSearchResults = function (json) {
    var documents = [];
    if (json.hits.total > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record._type === 'WebAction') {
                documents.push(jlab.wmenu.createWebActionLi({label: record._source.label, value: record._source.doc.value}));
            } else {
                console.log('wrong type for document: ' + record._type);
            }
        }
    }

    return documents;
};
jlab.wmenu.doScreenSearch = function (q) {
    var url = jlab.wmenu.searchUrl + "/ScreenAction/_search",
            data = {q: q, size: 10, from: 0};

    var promise = $.ajax({
        url: url,
        type: "GET",
        data: data,
        dataType: "json"
    });
    promise.done(function (json) {
        jlab.wmenu.handleScreenSearchResults(json);
    });
    promise.error(function (xhr, textStatus) {
        var json;
        try {
            json = $.parseJSON(xhr.responseText);
        } catch (err) {
            window.console && console.log('Response is not JSON: ' + xhr.responseText);
            json = {};
        }

        var message = json.error || 'Server did not handle request';
        alert('Unable to perform request: ' + message);
    });

    return promise;
};
jlab.wmenu.doApplicationSearch = function (q) {
    var url = jlab.wmenu.searchUrl + "/AppAction/_search",
            data = {q: q, size: 10, from: 0};

    var promise = $.ajax({
        url: url,
        type: "GET",
        data: data,
        dataType: "json"
    });
    promise.done(function (json) {
        jlab.wmenu.handleApplicationSearchResults(json);
    });
    promise.error(function (xhr, textStatus) {
        var json;
        try {
            json = $.parseJSON(xhr.responseText);
        } catch (err) {
            window.console && console.log('Response is not JSON: ' + xhr.responseText);
            json = {};
        }

        var message = json.error || 'Server did not handle request';
        alert('Unable to perform request: ' + message);
    });

    return promise;
};
jlab.wmenu.doDocumentSearch = function (q) {
    var url = jlab.wmenu.searchUrl + "/WebAction/_search",
            data = {q: q, size: 10, from: 0};

    var promise = $.ajax({
        url: url,
        type: "GET",
        data: data,
        dataType: "json"
    });
    promise.done(function (json) {
        jlab.wmenu.handleDocumentSearchResults(json);
    });
    promise.error(function (xhr, textStatus) {
        var json;
        try {
            json = $.parseJSON(xhr.responseText);
        } catch (err) {
            window.console && console.log('Response is not JSON: ' + xhr.responseText);
            json = {};
        }

        var message = json.error || 'Server did not handle request';
        alert('Unable to perform request: ' + message);
    });

    return promise;
};
jlab.wmenu.doTriSearch = function () {
    var $input = $("#search-input"),
            q = $input.val();

    $("#search-results").empty();

    if (q === '') {
        console.log('nothing to search');
        return;
    }

    $input.prop("disabled", true);

    $.mobile.loading("show", {textVisible: true, theme: "b"});

    var screenPromise = jlab.wmenu.doScreenSearch(q),
            applicationPromise = jlab.wmenu.doApplicationSearch(q),
            documentPromise = jlab.wmenu.doDocumentSearch(q),
            screens = [],
            applications = [],
            documents = [];

    screenPromise.done(function (json) {
        screens = jlab.wmenu.handleScreenSearchResults(json);
    });

    applicationPromise.done(function (json) {
        applications = jlab.wmenu.handleApplicationSearchResults(json);
    });

    documentPromise.done(function (json) {
        documents = jlab.wmenu.handleDocumentSearchResults(json);
    });

    var allDone = $.when(screenPromise, applicationPromise, documentPromise);

    allDone.done(function () {
        var $container = $("#search-results");

        if (screens.length > 0) {
            $container.append('<h2>Screens</h2><ul data-role="listview" data-inset="true" class="section" id="screen-search-results"></ul>');
            var $screensContainer = $("#screen-search-results");

            for (i = 0; i < screens.length; i++) {
                $screensContainer.append(screens[i]);
            }

            $screensContainer.listview().listview("refresh");
        }

        if (applications.length > 0) {
            $container.append('<h2>Applications</h2><ul data-role="listview" data-inset="true" class="section" id="application-search-results"></ul>');
            var $applicationsContainer = $("#application-search-results");

            for (i = 0; i < applications.length; i++) {
                $applicationsContainer.append(applications[i]);
            }

            $applicationsContainer.listview().listview("refresh");
        }

        if (documents.length > 0) {
            $container.append('<h2>Documents</h2><ul data-role="listview" data-inset="true" class="section" id="document-search-results"></ul>');
            var $documentsContainer = $("#document-search-results");

            for (i = 0; i < documents.length; i++) {
                $documentsContainer.append(documents[i]);
            }

            $documentsContainer.listview().listview("refresh");
        }
    });

    allDone.always(function () {
        $input.prop("disabled", false);
        $.mobile.loading("hide");
    });
};
/*{label: label, value: value}*/
jlab.wmenu.createAppActionLi = function (record) {
    var li;
    if (record.value.indexOf('/cs/prohome/bin/start_browser') === 0) {
        var url = record.value.substring('/cs/prohome/bin/start_browser'.length).trim().stripQuotes();
        li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
    } else if (record.value.indexOf('start_browser') === 0) {
        var url = record.value.substring('start_browser'.length).trim().stripQuotes();
        li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
    } else if (record.value.indexOf('firefox') === 0) {
        var url = record.value.substring('firefox'.length).trim().stripQuotes();
        li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
    } else if (record.value.indexOf('jmenu') === 0) {
        var url = "#" + record.value.substring('jmenu'.length).trim().stripQuotes() + "-page";
        li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
    } else if (record.value.indexOf('jmenu') > 0) {
        if (record.value.indexOf('MainMenuUITF') > 0) {
            var url = "https://epicsweb.jlab.org/itf/wmenu/";
            li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
        } else if (record.value.indexOf('MainMenuCHL') > 0) {
            var url = "https://epicsweb.jlab.org/chl/wmenu/";
            li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
        } else if (record.value.indexOf('MainMenuSRF') > 0) {
            var url = "https://epicsweb.jlab.org/srf/wmenu/";
            li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';            
        } else {
            var url = "https://epicsweb.jlab.org/wmenu/";
            li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
        }
    } else {
        li = '<li class="disabled-item">' + record.label + '</li>';
    }

    return li;
};
/*{label: label, value: value}*/
jlab.wmenu.createWebActionLi = function (record) {
    var li;

    li = '<li><a rel="external" href="' + record.value + '">' + record.label + '</a></li>';

    return li;
};
/*{label: label, value: value, type: type}*/
jlab.wmenu.createScreenActionLi = function (record) {
    var li;

    /*If value is exactly 'edmRun' without params then don't try to link*/
    /*Also type must be one of edl or run*/
    /*Also don't link if type is run, but doesn't start with edmRun*/
    if (record.value.trim() !== 'edmRun' && (record.type === 'edl' || record.type === 'run') && !(record.type === 'run' && record.value.indexOf("edmRun") !== 0)) {
        /*console.log(record);*/
        var tokens = record.value.split(/\s+/),
                url = jlab.contextPrefix + '/wedm/screen?edl=' + tokens[tokens.length - 1];
        if (tokens.length > 1 && tokens[0].indexOf("edmRun") === 0 && tokens[1].indexOf("-m") === 0) {
            var macros = tokens[2];
            for (var j = 3; j < tokens.length - 1; j++) {
                macros = macros + tokens[j];
            }

            macros = macros.stripQuotes();

            url = url + jlab.macroQueryString(macros);
        }

        li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
    } else if (record.type === 'otf') { /*search result otf only - regular otf translated to edl type by menu server*/
        /*console.log(record);*/
        var tokens = record.value.split(/\s+/),
                url = jlab.contextPrefix + '/wedm/screen?edl=' + jlab.wmenu.OTF_PATH + record.parentId + '/' + record.id;
        li = '<li><a rel="external" href="' + url + '">' + record.label + '</a></li>';
    } else { /*unknown*/
        li = '<li data-debug="' + record.type + '">' + record.label + '</li>';
    }
    return li;
};
jlab.wmenu.handleRootMenuResults = function (json) {
    jlab.wmenu.menuDefs = json.data.menuDefs;
    jlab.wmenu.actionDefs = json.data.actionDefs;
    /*console.log(json);*/

    var heading = json.data.heading || json.data.label || 'Main Menu',
            menu = {id: jlab.wmenu.rootMenu, label: heading, sections: json.data.sections};

    /*This isn't really the root menu page, just a placeholder */
    $("#" + jlab.wmenu.rootMenu + "-page").remove();

    jlab.wmenu.addPage(menu);

    /*We need root menu page to be first page*/
    $("#search-page-root").insertAfter("#" + jlab.wmenu.rootMenu + "-page");

    /*See if URL contains a specific menu in it*/
    var u = $.mobile.path.parseUrl(window.location.href),
            menuName = u.hash;

    if (menuName.length > 0) {
        $(":mobile-pagecontainer").pagecontainer("change", menuName);
    }

    $.mobile.initializePage();
};
jlab.wmenu.addPage = function (menu) {
    var id = menu.id + '-page',
            heading = menu.heading || menu.label || '',
            $page = $('<div id="' + id + '" data-role="page"><div data-role="header"><h2>' + heading + '</h2></div><div role="main" class="ui-content"></div></div>'),
            $body = $("body"),
            $content = $page.find(".ui-content");

    if ($("#" + id).length) {
        /*console.log('Menu page already exists: ' + id);*/
        return;
    }

    $body.append($page);
    for (var i = 0; i < menu.sections.length; i++) {
        var section = menu.sections[i];

        if (section.heading) {
            $content.append('<h3>' + section.heading + '</h3>');
        }

        var $sectionDiv = $('<ul data-role="listview" data-inset="true" class="section"></ul>');

        $(section.items).each(function () {
            var def;
            if (this.type === 'menu') {
                def = jlab.wmenu.menuDefs[this.id];
                $sectionDiv.append('<li class="jmenu-' + this.type + '"><a href="#' + this.id + '-page">' + def.label + '</a></li>');
                /*jlab.wmenu.addPage(def);*/
            } else if (this.type === 'action') {
                def = jlab.wmenu.actionDefs[this.id];
                /*console.log(def);*/
                var li;
                if (def.type === 'AppAction') {
                    li = jlab.wmenu.createAppActionLi({label: def.label, value: def.action.app});
                } else if (def.type === 'WebAction') {
                    li = jlab.wmenu.createWebActionLi({label: def.label, value: def.action.doc});
                } else if (def.type === 'ScreenAction') {
                    /*console.log(def);*/
                    li = jlab.wmenu.createScreenActionLi({label: def.label, value: def.action.screen, type: def.action.type});
                } else {
                    console.log('unknown action sub-type: ' + def.type);
                }
                $sectionDiv.append(li);
            } else if (this.type === 'menutext') {
                $sectionDiv.append('<li class="jmenu-' + this.type + '">' + this.text + '</li>');
            } else {
                console.log('unknown type: ' + this.type);
                return true;
            }
        });

        $content.append($sectionDiv);
        $sectionDiv.listview().listview("refresh");

        if (i < menu.sections.length - 1) {
            $content.append('<div class="hr-container"><hr/></div>');
        }
    }
};
jlab.wmenu.loadRootMenu = function () {

    $.mobile.loading("show", {textVisible: true, theme: "b"});

    var url = jlab.wmenu.menuUrl + '/' + jlab.wmenu.rootMenu,
            data = {definitions: 1},
            dataType = "json",
            options = {url: url, type: 'GET', data: data, dataType: dataType, cache: true};

    if (url.indexOf("/") !== 0) {
        dataType = "jsonp";
        options.dataType = dataType;
        options.jsonp = 'jsonp';
        options.jsonpCallback = 'jsonp';
    }

    var promise = $.ajax(options);

    promise.done(function (json) {
        /*console.time('Build Menu');*/
        jlab.wmenu.handleRootMenuResults(json);
        /*console.timeEnd('Build Menu');*/
    });
    promise.error(function (xhr, textStatus) {
        var json;
        try {
            if (typeof xhr.responseText === 'undefined' || xhr.responseText === '') {
                json = {};
            } else {
                json = $.parseJSON(xhr.responseText);
            }
        } catch (err) {
            window.console && console.log('Response is not JSON: ' + xhr.responseText);
            json = {};
        }

        var message = json.error || 'Server did not handle request';
        alert('Unable to perform request: ' + message);
    });
    promise.always(function () {
        $.mobile.loading("hide");
    });

    return promise;
};
jlab.wmenu.dynamicallyAddMenuPage = function (urlObj) {
    var menuName = urlObj.hash,
            id = menuName.substring(1, menuName.length - 5);
    var def = jlab.wmenu.menuDefs[id];
    if (def) {
        jlab.wmenu.addPage(def);
    }
};
$(document).on("pagebeforechange", function (e, data) {
    if (typeof data.toPage === "string") {
        var u = $.mobile.path.parseUrl(data.toPage),
                menuName = u.hash,
                $page = $(menuName);

        if ($page.length === 0) {
            jlab.wmenu.dynamicallyAddMenuPage(u, data.options);
        }
    }
});
$(document).on("keyup", "#search-input", function (e) {
    if (e.keyCode === 13) {
        $(":mobile-pagecontainer").pagecontainer("change", "#search-page-root");
        jlab.wmenu.doTriSearch();
    }
});
$(document).on("pageshow", function () {
    var $page = $(".ui-page-active"),
            id = $page.attr("id"),
            $previousBtn = $("#previous-button");
    if (id === jlab.wmenu.rootMenu + '-page') {
        $previousBtn.hide();
    } else {
        $previousBtn.show();
    }
});
$(function () {
    $("#header-panel").toolbar({theme: "a"});
    $("#footer-panel").toolbar({theme: "a"});
    jlab.wmenu.loadRootMenu();
});