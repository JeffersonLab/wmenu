<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WMenu</title>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/wjmenu.css?v=${initParam.releaseNumber}"/>
    </head>
    <body>
        <h1>WMenu</h1>
        <div id="page">
            <div id="page-top-bevel">
                <div id="page-bottom-bevel">
                    <div id="container">
                        <div id="search-panel">
                            <img src="resources/img/search.png" alt="Search" width="27" height="29" id="search-icon"/>
                            <input id="search-input" type="text" placeholder="Search"/>
                            <img src="resources/img/indicator16x16.gif" alt="Activity Indicator" width="16" height="16" id="indicator" style="display: none;"/>
                        </div>   
                        <div id="search-results">

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="/epics2web/resources/js/jquery-1.10.2.min.js"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/wjmenu.js?v=${initParam.releaseNumber}"></script>
    </body>
</html>
