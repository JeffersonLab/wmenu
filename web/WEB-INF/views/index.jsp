<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WMenu</title>
        <link rel="shortcut icon" href="${pageContext.request.contextPath}/resources/img/favicon.ico?v=${initParam.releaseNumber}"/>        
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/jquery.mobile-1.4.5.min.css"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/wmenu.css?v=${initParam.releaseNumber}"/>
    </head>
    <body>
        <div id="header-panel" data-role="header" data-position="fixed" data-theme="a">
            <a id="previous-button" href="#" data-rel="back" class="ui-btn ui-btn-left ui-alt-icon ui-nodisc-icon ui-corner-all ui-btn-icon-notext ui-icon-carat-l">Back</a>
            <h1>WMenu</h1>
            <input id="search-input" type="search" placeholder="Search"/>
        </div>        
        <div data-role="page" id="MainMenu-page">
            <div data-role="header">
                <h2></h2>
            </div>
            <div role="main" class="ui-content">
            </div>            
        </div>        
        <div data-role="page" id="search-page-root">
            <div data-role="header">
                <h2>Search Results</h2>
            </div>
            <div role="main" class="ui-content">   
                <div id="search-results">

                </div>
            </div>
        </div>
        <div id="footer-panel" data-role="footer" data-position="fixed" data-theme="a">
            <div id="contact">Contact: <a href="mailto:epicsweb@jlab.org?subject=epicsweb">epicsweb@jlab.org</a></div>
            <div id="version">Version: ${initParam.releaseNumber} (${initParam.releaseDate})</div> 
        </div>        
        <script type="text/javascript" src="/epics2web/resources/js/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.mobile-1.4.5.min.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/wmenu.js?v=${initParam.releaseNumber}"></script>      
        <script type="text/javascript">
            jlab.wmenu.menuUrl = '${fn:escapeXml(menuUrl)}';
            jlab.wmenu.searchUrl = '${fn:escapeXml(searchUrl)}';
        </script>        
    </body>
</html>
