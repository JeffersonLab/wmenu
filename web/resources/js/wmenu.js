var jlab = jlab || {};
jlab.wmenu = jlab.wmenu || {};
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
    if (json.hits.total > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record._type === 'ScreenAction') {
                var tokens = record._source.screen.value.split(/\s+/),
                        url = '/wedm/screen?edl=' + tokens[tokens.length - 1];
                if (tokens[0].indexOf("edmRun") === 0 && tokens[1].indexOf("-m") === 0) {
                    var macros = tokens[2];
                    for (var j = 3; j < tokens.length - 1; j++) {
                        macros = macros + tokens[j];
                    }

                    /*Strip optional start quote*/
                    if (macros.indexOf('"') === 0) {
                        macros = macros.substring(1, macros.length);
                    }

                    /*Strip optional end quote*/
                    if (macros.lastIndexOf('"') === macros.length - 1) {
                        macros = macros.substring(0, macros.length - 1);
                    }

                    url = url + jlab.macroQueryString(macros);
                }

                screens.push('<li><a rel="external" href="' + url + '">' + record._source.label + '</a></li>');
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
                if (record._source.app.value.indexOf('/cs/prohome/bin/start_browser') === 0) {
                    var url = record._source.app.value.substring('/cs/prohome/bin/start_browser'.length);
                    applications.push('<li><a rel="external" href="' + url + '">' + record._source.label + '</a></li>');
                } else if (record._source.app.value.indexOf('start_browser') === 0) {
                    var url = record._source.app.value.substring('start_browser'.length);
                    applications.push('<li><a rel="external" href="' + url + '">' + record._source.label + '</a></li>');
                } else {
                    applications.push('<li><a class="disabled-item" href="#">' + record._source.label + '</a></li>');
                }
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
                documents.push('<li><a rel="external" href="' + record._source.doc.value + '">' + record._source.label + '</a></li>');
            } else {
                console.log('wrong type for document: ' + record._type);
            }
        }
    }

    return documents;
};
jlab.wmenu.doScreenSearch = function (q) {
    var url = "https://accweb.acc.jlab.org/search/jmenu-cebaf/ScreenAction/_search",
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
    var url = "https://accweb.acc.jlab.org/search/jmenu-cebaf/AppAction/_search",
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
    var url = "https://accweb.acc.jlab.org/search/jmenu-cebaf/WebAction/_search",
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
            $indicator = $("#indicator"),
            q = $input.val();

    $("#search-results").empty();

    if (q === '') {
        console.log('nothing to search');
        return;
    }

    $input.prop("disabled", true);

    $.mobile.loading("show", {defaults: true});

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
jlab.wmenu.handleMainMenuResults = function (json) {
    console.log(json);
    var $container = $("#MainMenu-page-root .ui-content");
    for (var i = 0; i < json.data.sections.length; i++) {
        var $section = $('<ul data-role="listview" data-inset="true" class="section"></ul>');

        $(json.data.sections[i].items).each(function () {
            var def;
            if (this.type === 'menu') {
                def = json.data.menuDefs[this.id];
                jlab.wmenu.addPage(def, json.data.menuDefs, json.data.actionDefs);
            } else if (this.type === 'action') {
                def = json.data.actionDefs[this.id];
            } else {
                console.log('unknown type: ' + this.type);
            }
            $section.append('<li class="jmenu-' + this.type + '"><a href="#' + this.id + '-page">' + def.label + '</a></li>');
        });

        $container.append($section);
        $section.listview().listview("refresh");

        if (i < json.data.sections.length - 1) {
            $container.append('<div class="hr-container"><hr/></div>');
        }
    }
};
jlab.wmenu.addPage = function (menu, menuDefs, actionDefs) {
    var id = menu.id + '-page',
            $page = $('<div id="' + id + '" data-role="page"><div data-role="header"><h2>' + menu.label + '</h2></div><div role="main" class="ui-content"></div><div data-role="footer"></div></div>'),
            $body = $("body"),
            $content = $page.find(".ui-content");

    if ($("#" + id).length) {
        /*console.log('Menu page already exists: ' + id);*/
        return;
    }

    $body.append($page);
    //$page.trigger("create");
    for (var i = 0; i < menu.sections.length; i++) {
        var $section = $('<ul data-role="listview" data-inset="true" class="section"></ul>');

        $(menu.sections[i].items).each(function () {
            var def;
            if (this.type === 'menu') {
                def = menuDefs[this.id];
                $section.append('<li class="jmenu-' + this.type + '"><a href="#' + this.id + '-page">' + def.label + '</a></li>');
                jlab.wmenu.addPage(def, menuDefs, actionDefs);
            } else if (this.type === 'action') {
                def = actionDefs[this.id];
                $section.append('<li class="jmenu-' + this.type + '">' + def.label + '</li>');
            } else if (this.type === 'menutext') {
                $section.append('<li class="jmenu-' + this.type + '">' + this.text + '</li>');
            } else {
                console.log('unknown type: ' + this.type);
                return true;
            }
        });

        $content.append($section);
        $section.listview().listview("refresh");

        if (i < menu.sections.length - 1) {
            $content.append('<div class="hr-container"><hr/></div>');
        }
    }
    //$page.page().page("refresh");
};
jlab.wmenu.loadMainMenu = function () {
    var url = jlab.wmenu.menuUrl + '/MainMenu',
            data = {definitions: 1},
    dataType = "json",
            options = {url: url, type: 'GET', data: data, dataType: dataType};

    if (url.indexOf("/") !== 0) {
        dataType = "jsonp";
        options.dataType = dataType;
        options.jsonp = 'jsonp';
    }

    var promise = $.ajax(options);

    promise.done(function (json) {
        jlab.wmenu.handleMainMenuResults(json);
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

    return promise;
};
$(document).on("keyup", "#search-input", function (e) {
    if (e.keyCode === 13) {
        jlab.wmenu.doTriSearch();
        $(":mobile-pagecontainer").pagecontainer("change", "#search-page-root");
    }
});
$(document).on("pageshow", function () {
    var $page = $(".ui-page-active"),
            id = $page.attr("id"),
            $previousBtn = $("#previous-button");
    if (id === 'MainMenu-page-root') {
        $previousBtn.hide();
    } else {
        $previousBtn.show();
    }
});
$( document ).on( "mobileinit", function() {
  $.mobile.loader.prototype.options.text = "loading";
  $.mobile.loader.prototype.options.textVisible = true;
  $.mobile.loader.prototype.options.theme = "a";
  $.mobile.loader.prototype.options.html = "";
});
$(function () {
    $("#search-panel").toolbar({theme: "a"});
    jlab.wmenu.loadMainMenu();
});