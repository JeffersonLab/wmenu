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
jlab.wmenu.OTF_PATH = '/cs/opshome/edm/wedm/otf-pregen/';
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

    if (json.hits.total.value > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record.fields.type[0] === 'ScreenAction') {
                /*console.log(record);*/
                var parentId = 0;
                if (record.fields['menuData.actionID']) {
                    parentId = record.fields['menuData.actionID'][0];
                }
                screens.push(jlab.wmenu.createScreenActionLi({parentId: parentId, id: record.fields.id[0], label: record.fields.label[0], value: record.fields['screen.value'][0], type: record.fields['screen.type'][0]}));
            } else {
                console.log('wrong type while parsing screens: ' + record.fields.type[0]);
            }
        }
    }

    return screens;
};
jlab.wmenu.handleApplicationSearchResults = function (json) {
    var applications = [];

    /*console.log(json);*/

    if (json.hits.total.value > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record.fields.type[0] === 'AppAction') {
                /*console.log(record);*/
                applications.push(jlab.wmenu.createAppActionLi({label: record.fields.label[0], value: record.fields['app.value'][0]}));
            } else {
                console.log('wrong type for applications: ' + record.fields.type[0]);
            }
        }
    }

    return applications;
};
jlab.wmenu.handleDocumentSearchResults = function (json) {
    var documents = [];

    /*console.log(json);*/

    if (json.hits.total.value > 0) {
        for (var i = 0; i < json.hits.hits.length; i++) {
            var record = json.hits.hits[i];
            if (record.fields.type[0] === 'WebAction') {
                /*console.log(record);*/
                documents.push(jlab.wmenu.createWebActionLi({label: record.fields.label[0], value: record.fields['doc.value']}));
            } else {
                console.log('wrong type for document: ' + record.fields.type[0]);
            }
        }
    }

    return documents;
};
jlab.wmenu.doScreenSearch = function (q) {
    var url = jlab.wmenu.searchUrl + "/_search",
            data = {
                    size: 10,
                    query: {
                        bool: {
                            must: [
                                {
                                    simple_query_string: {
                                        query: q,
                                        fields: [
                                            '*',
                                            'label^10',
                                            'menuData.headings^2',
                                            'menuData.labels^3',
                                            'menuData.menu_labels^5',
                                            'edlData.keywords^10',
                                            'edlData.elements^3'
                                        ],
                                        default_operator: 'AND'
                                    }
                                },
                                {
                                    match: {
                                        type: "ScreenAction"
                                    }
                                }
                            ]
                        }
                    },
                    fields: [
                        'id', 'type', 'label', 'menuData.actionID', 'screen.value', 'screen.type'
                    ],
                    _source: false
                };

    var promise = $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json"
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
    var url = jlab.wmenu.searchUrl + "/_search",
        data = {
            size: 10,
            query: {
                bool: {
                    must: [
                        {
                            simple_query_string: {
                                query: q,
                                fields: [
                                    '*',
                                    'label^10',
                                    'menuData.headings^2',
                                    'menuData.labels^3',
                                    'menuData.menu_labels^5',
                                    'edlData.keywords^10',
                                    'edlData.elements^3'
                                ],
                                default_operator: 'AND'
                            }
                        },
                        {
                            match: {
                                type: "AppAction"
                            }
                        }
                    ]
                }
            },
            fields: [
                'id', 'type', 'label', 'app.value'
            ],
            _source: false
        };

    var promise = $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json"
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
    var url = jlab.wmenu.searchUrl + "/_search",
        data = {
            size: 10,
            query: {
                bool: {
                    must: [
                        {
                            simple_query_string: {
                                query: q,
                                fields: [
                                    '*',
                                    'label^10',
                                    'menuData.headings^2',
                                    'menuData.labels^3',
                                    'menuData.menu_labels^5',
                                    'edlData.keywords^10',
                                    'edlData.elements^3'
                                ],
                                default_operator: 'AND'
                            }
                        },
                        {
                            match: {
                                type: "WebAction"
                            }
                        }
                    ]
                }
            },
            fields: [
                'id', 'type', 'label', 'doc.value'
            ],
            _source: false
        };

    var promise = $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json"
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
        } else if (record.value.indexOf('MainMenuLERF') > 0) {
            var url = "https://epicsweb.jlab.org/fel/wmenu/";
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
        var tokens = record.value.trim().split(/\s+/),
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
    } else if (record.type === 'otf') {
        /*console.log(record);*/
        // Step 1
        var filename = record.value.trim();

        // Step 2
        filename = btoa(filename); // Note: doesn't handle Unicode

        // Step 3
        if(filename.length > 251) {
            filename = filename.substring(0, 251);
        }

        // Step 4
        filename = filename + '.edl';

        var url = jlab.contextPrefix + '/wedm/screen?edl=' + jlab.wmenu.OTF_PATH + filename;
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
                    li = jlab.wmenu.createAppActionLi({label: this.label || def.label, value: def.action.app});
                } else if (def.type === 'WebAction') {
                    li = jlab.wmenu.createWebActionLi({label: this.label || def.label, value: def.action.doc});
                } else if (def.type === 'ScreenAction') {
                    /*console.log(def);*/
                    li = jlab.wmenu.createScreenActionLi({label: this.label || def.label, value: def.action.screen, type: def.action.type});
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
    } else {
        console.log('Submenu missing from root menu cache: ' + id);
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